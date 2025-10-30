
import { NextRequest } from "next/server";
import { routeAndAnswer } from "@/lib/headmaster";
import { prisma } from "@/server/db";
import { searchPublicQA, searchPersonalMemory, upsertPublicQA, upsertPersonalMemory } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  const { message, userId, orgId } = await req.json()
  const q = String(message ?? "").trim()
  if (!q) return Response.json({ error: "empty" }, { status: 400 })

  // naive auth substitute; wire NextAuth session in real app
  const uid = userId ?? "anon"

  // 1) Try personal memory

  const personal = uid !== "anon" ? await searchPersonalMemory(uid, q, 2) : []
  if (personal.length && personal[0].score > 0.85) {
    return Response.json({ reply: personal[0].content, meta: { source: "personal-memory" } })
  }

  // 2) Try public QA
  const pub = await searchPublicQA(q, 2)
  if (pub.length && pub[0].score > 0.88) {
    return Response.json({ reply: pub[0].answer, meta: { source: "public-qa" } })
  }

  // 3) Ask headmaster
  const result = await routeAndAnswer({ input: q })

  // 4) Store
  const query = await prisma.query.create({
    data: { userId: uid, input: q, complexity: result.tier, orgId }
  })
  await prisma.answer.create({
    data: { queryId: query.id, output: result.reply, model: result.model }
  })

  // 5) Upsert caches (public as a default demo; in real app gate by flag)
  await upsertPublicQA(q, result.reply, orgId ?? null)
  if (uid !== "anon") await upsertPersonalMemory(uid, result.reply, "Svar på: " + q)

  return Response.json({ reply: result.reply, meta: { source: "fresh", tier: result.tier } })
}
