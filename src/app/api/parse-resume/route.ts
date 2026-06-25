import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
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