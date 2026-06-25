import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { cv_text } = await req.json()

  const prompt = `
You are a resume coach. Extract all bullet points from this resume grouped by Experience, Projects, Skills, Education.
For each bullet, rate it as "STRONG" or "WEAK". Weak bullets are vague, have no numbers, or use passive language.

Return ONLY valid JSON in this exact format:
{
  "experience": [
    { "company": "Company Name", "role": "Role", "year": "Year", "bullets": [{ "text": "...", "strength": "WEAK" }] }
  ],
  "projects": [
    { "name": "Project Name", "bullets": [{ "text": "...", "strength": "STRONG" }] }
  ],
  "skills": ["skill1", "skill2"],
  "education": [{ "institution": "...", "degree": "...", "year": "..." }]
}

Resume:
${cv_text}
`

  const result = await gemini.generateContent(prompt)
  const raw = result.response.text().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(raw)

  return NextResponse.json(parsed)
}