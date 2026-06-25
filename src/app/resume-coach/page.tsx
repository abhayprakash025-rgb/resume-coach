'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StepBar from '@/components/StepBar'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)

  async function handleContinue() {
    if (!file) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Parse resume
    const formData = new FormData()
    formData.append('file', file)
    const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: formData })
    const { text } = await parseRes.json()

    // Analyze bullets with Gemini
    const analyzeRes = await fetch('/api/analyze-bullets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_text: text })
    })
    const parsedBullets = await analyzeRes.json()

    // Save session to Supabase
    const { data: session } = await supabase
      .from('resume_sessions')
      .insert({ student_id: user.id, cv_text: text, parsed_bullets: parsedBullets, step: 2 })
      .select()
      .single()

    // Also update students table cv_text
    await supabase.from('students').update({ cv_text: text }).eq('id', user.id)

    localStorage.setItem('sessionId', session.id)
    router.push('/resume-coach/review')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <StepBar current={1} />
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full mb-6">
          ✦ AI Resume Coach
        </div>
        <h1 className="text-4xl font-bold mb-2">Build a Resume You Can</h1>
        <h1 className="text-4xl font-bold text-amber-400 mb-4">Defend</h1>
        <p className="text-gray-500 mb-8">Upload your resume and let AI improve your impact, clarity, and role alignment.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]) }}
          onClick={() => document.getElementById('fileInput')?.click()}
          className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors mb-6
            ${drag ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
        >
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl">↑</div>
          <p className="font-medium">{file ? file.name : 'Drag & drop your resume'}</p>
          <p className="text-gray-400 text-sm mt-1">or click to browse — PDF or DOCX, up to 10 MB</p>
          <input id="fileInput" type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        <button
          onClick={handleContinue}
          disabled={!file || loading}
          className="bg-amber-400 text-black font-semibold px-8 py-3 rounded-full disabled:opacity-40 hover:bg-amber-500 transition"
        >
          {loading ? 'Analyzing...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}