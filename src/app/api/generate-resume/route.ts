import { NextRequest, NextResponse } from 'next/server'
import { gemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { studentData, optimizedData, targetRole } = await req.json()

  const prompt = `
Generate a clean, formatted resume as plain text for ${studentData.name} targeting a "${targetRole}" role.
Use this optimized data: ${JSON.stringify(optimizedData)}
Include: Name, Contact, Experience, Projects, Skills, Education.
Use standard resume formatting with clear section headers. Return only the resume text.
`

  const result = await gemini.generateContent(prompt)
  return NextResponse.json({ resumeText: result.response.text().trim() })
}