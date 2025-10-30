
import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { upsertPersonalMemory } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.memory) {
    await upsertPersonalMemory(body.userId ?? "demo", body.memory, "Demo")
  }
  if (body.reminder) {
    await prisma.reminder.create({ data: {
      userId: body.userId ?? "demo",
      dueAt: new Date(Date.now()+ 24*3600*1000),
      title: body.reminder,
    }})
  }
  return Response.json({ ok: true })
}
