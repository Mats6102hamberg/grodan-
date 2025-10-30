
import OpenAI from "openai";
import { prisma } from "@/server/db";

const EMB_MODEL = "text-embedding-3-small";

export async function embed(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await openai.embeddings.create({ model: EMB_MODEL, input: text })
  // Convert to plain number[]
  return res.data[0].embedding.map(Number)
}

export async function upsertPublicQA(question: string, answer: string, orgId?: string) {
  const vector = await embed(question + "\n" + answer)
  await prisma.publicQA.create({ data: { question, answer, orgId, embedding: vector as unknown as any } })
}

export async function searchPublicQA(query: string, k = 3) {
  // pgvector cosine similarity using Prisma raw
  const vector = await embed(query)
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, question, answer,
    1 - (embedding <=> $1::vector) AS score
    FROM "PublicQA"
    ORDER BY embedding <-> $1::vector
    LIMIT $2
  `, vector, k)
  return rows
}

export async function upsertPersonalMemory(userId: string, content: string, title?: string) {
  const vector = await embed(content)
  await prisma.memory.create({ data: { userId, content, title, embedding: vector as unknown as any } })
}

export async function searchPersonalMemory(userId: string, query: string, k=3) {
  const vector = await embed(query)
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, title, content,
    1 - (embedding <=> $1::vector) AS score
    FROM "Memory"
    WHERE "userId" = $2
    ORDER BY embedding <-> $1::vector
    LIMIT $3
  `, vector, userId, k)
  return rows
}
