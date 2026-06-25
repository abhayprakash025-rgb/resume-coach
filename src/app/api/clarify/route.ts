import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { bullet, userAnswer } = await req.json()

  const prompt = userAnswer
    ? `A student has this weak resume bullet: "${bullet}"
       They answered this about it: "${userAnswer}"
       Generate an improved, quantified, specific resume bullet point using their answer.
       Return ONLY the improved bullet text, nothing else.`
    : `This resume bullet is weak: "${bullet}"
       Ask ONE specific follow-up question to help improve it (ask about numbers, outcomes, or specific actions).
       Return ONLY the question, nothing else.`

  const result = await gemini.generateContent(prompt)
  return NextResponse.json({ response: result.response.text().trim() })
}