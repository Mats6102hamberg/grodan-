
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.ENABLE_CRON_REMINDERS !== "true") return new Response("off")
  const now = new Date()
  const soon = new Date(now.getTime() + 60*60*1000)
  const due = await prisma.reminder.findMany({ where: { dueAt: { lte: soon } } })
  // In real app: send emails/push/webhooks. For demo, just log to DB
  if (due.length) {
    console.log("Reminders due within an hour:", due.length)
  }
  return Response.json({ ok: true, count: due.length })
}
