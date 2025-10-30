
import OpenAI from "openai";

type Tier = 1|2|3|4

const MODELS: Record<Tier, string> = {
  1: "gpt-4o-mini",
  2: "gpt-4o",
  3: "gpt-4.1",
  4: "o3" // change to your preferred expert model
}

export function scoreComplexity(input: string, userHints?: string): Tier {
  const len = input.length
  const hasCode = /```|function|class|SELECT|<\/?[a-z]/i.test(input)
  const researchy = /(analysera|jämför|studie|källor|referens|arkitektur|skalning|säkerhet)/i.test(input)
  let score = 1
  if (len > 400 || hasCode) score = 2
  if (len > 1200 || researchy) score = 3
  if (/arkitektur|säkerhet|juridik|regulator|mission critical/i.test(input)) score = 4
  return score as Tier
}

export async function routeAndAnswer(opts: { input: string, userId?: string, roleHints?: string }) {
  const tier = scoreComplexity(opts.input, opts.roleHints)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = MODELS[tier]

  const sys = `Du är Grodans headmaster. Svara kort först med slutsats, sedan punktlista. Om frågan liknar tidigare, återanvänd svar.`

  const chat = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: opts.input }
    ],
    temperature: tier >= 3 ? 0.4 : 0.2
  })

  return { reply: chat.choices[0].message.content ?? "", model, tier }
}
