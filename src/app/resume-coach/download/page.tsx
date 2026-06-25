'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StepBar from '@/components/StepBar'

export default function DownloadPage() {
  const router = useRouter()
  const [resume, setResume] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sessionId = localStorage.getItem('sessionId')
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: s }, { data: st }] = await Promise.all([
        supabase.from('resume_sessions').select('*').eq('id', sessionId!).single(),
        supabase.from('students').select('*').eq('id', user!.id).single()
      ])
      setSession(s)
      setStudent(st)

      // Generate final resume
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData: st, optimizedData: s?.optimized_bullets, targetRole: s?.target_role })
      })
      const { resumeText } = await res.json()
      setResume(resumeText)

      await supabase.from('resume_sessions').update({ final_resume_text: resumeText }).eq('id', sessionId!)
      setLoading(false)
    }
    load()
  }, [])

  function downloadTxt() {
    const blob = new Blob([resume], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${student?.name?.replace(' ', '_')}_Resume.txt`; a.click()
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Generating your optimized resume...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <StepBar current={5} />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">You're recruiter-ready</h1>
          <p className="text-gray-500 text-sm">Preview your optimized resume and download in your preferred format.</p>
        </div>
        <button onClick={() => router.push('/resume-coach/optimize')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to optimization
        </button>
      </div>

      <div className="flex gap-6">
        {/* Resume preview */}
        <div className="flex-1 border border-gray-100 rounded-2xl p-8 bg-white">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{resume}</pre>
        </div>

        {/* Score panel */}
        <div className="w-72 space-y-4">
          <div className="border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#g2)" strokeWidth="3"
                    strokeDasharray={`${session?.match_score} ${100 - session?.match_score}`} strokeLinecap="round" />
                  <defs><linearGradient id="g2"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#f59e0b" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{session?.match_score}%</span>
                  <span className="text-xs text-gray-400">Readiness</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Resume Readiness</p>
                <p className="text-xs text-gray-500 mt-1">Strong impact and structure. A couple of tweaks could push you to a 90+.</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="font-semibold text-sm mb-3">Suggested improvements</p>
            {session?.recommendations?.map((r: string, i: number) => (
              <p key={i} className="text-xs text-gray-600 flex gap-2 mb-2"><span className="text-amber-500">•</span>{r}</p>
            ))}
          </div>

          <button onClick={downloadTxt}
            className="w-full bg-amber-400 text-black font-semibold py-3 rounded-full hover:bg-amber-500 text-sm">
            ↓ Download Resume
          </button>
        </div>
      </div>
    </div>
  )
}