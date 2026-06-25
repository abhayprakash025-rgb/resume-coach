import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { parsedBullets, clarifyQA, targetRole } = await req.json()

  const prompt = `
You are a resume coach optimizing a resume for a "${targetRole}" role.
Here are the candidate's bullets and improvements from clarification: ${JSON.stringify({ parsedBullets, clarifyQA })}

Return ONLY valid JSON:
{
  "matchScore": 84,
  "matchLabel": "Strong match",
  "recommendations": [
    "Highlight SQL and dashboarding in your skills section.",
    "Add quantified impact to your BrightPath internship bullets."
  ],
  "optimizedBullets": {
    "experience": [
      { "company": "...", "role": "...", "year": "...", "bullets": ["improved bullet 1", "improved bullet 2"] }
    ],
    "projects": [
      { "name": "...", "bullets": ["improved bullet 1"] }
    ]
  },
  "strengths": ["Strong Impact", "Good Structure", "Role Alignment"]
}
`

  const result = await gemini.generateContent(prompt)
  const raw = result.response.text().replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(raw))
}