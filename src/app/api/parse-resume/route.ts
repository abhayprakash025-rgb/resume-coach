import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

// Tell Next.js not to try and statically generate this API route during build
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Moved INSIDE the function so it only runs when a file is actually uploaded, 
  // preventing the "DOMMatrix" crash during the build step.
  const pdf = require('pdf-parse')

  const formData = await req.formData()
  const file = formData.get('file') as File
  const buffer = Buffer.from(await file.arrayBuffer())

  let text = ''
  if (file.name.endsWith('.pdf')) {
    const data = await pdf(buffer)
    text = data.text
  } else if (file.name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  return NextResponse.json({ text })
}