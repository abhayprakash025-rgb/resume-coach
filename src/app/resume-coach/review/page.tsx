'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StepBar from '@/components/StepBar'

export default function ReviewPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('experience')

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId')
    if (!sessionId) { router.push('/resume-coach'); return }
    supabase.from('resume_sessions').select('parsed_bullets').eq('id', sessionId).single()
      .then(({ data: s }) => setData(s?.parsed_bullets))
  }, [])

  const weakCount = data?.experience?.flatMap((e: any) => e.bullets).filter((b: any) => b.strength === 'WEAK').length || 0

  async function handleContinue() {
    const sessionId = localStorage.getItem('sessionId')
    await supabase.from('resume_sessions').update({ step: 3 }).eq('id', sessionId!)
    router.push('/resume-coach/clarify')
  }

  if (!data) return <div className="p-8 text-center text-gray-400">Loading...</div>

  const tabs = ['experience', 'projects', 'skills', 'education']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepBar current={2} />
      <h1 className="text-2xl font-bold mb-1">Review what we found</h1>
      <p className="text-gray-500 mb-6">We extracted the highlights of your resume. Make quick edits before AI improves them.</p>

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-44 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize
                ${activeTab === tab ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeTab === 'experience' && data.experience?.map((exp: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{exp.company}</p>
                  <p className="text-sm text-amber-500">{exp.role} · {exp.year}</p>
                </div>
              </div>
              {exp.bullets.map((b: any, j: number) => (
                <div key={j} className={`flex justify-between items-start py-2 px-3 rounded-lg mb-1 ${b.strength === 'WEAK' ? 'bg-amber-50' : ''}`}>
                  <span className="text-sm">• {b.text}</span>
                  {b.strength === 'WEAK' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded ml-2 shrink-0">WEAK</span>}
                </div>
              ))}
            </div>
          ))}
          {activeTab === 'projects' && data.projects?.map((p: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold mb-2">{p.name}</p>
              {p.bullets.map((b: any, j: number) => (
                <p key={j} className="text-sm text-gray-600">• {b.text}</p>
              ))}
            </div>
          ))}
          {activeTab === 'skills' && (
            <div className="border border-gray-100 rounded-xl p-5 flex flex-wrap gap-2">
              {data.skills?.map((s: string, i: number) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {activeTab === 'education' && data.education?.map((e: any, i: number) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold">{e.institution}</p>
              <p className="text-sm text-gray-500">{e.degree} · {e.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">✦ AI found <strong>{weakCount} weak bullets</strong> to improve.</p>
        <button onClick={handleContinue} className="bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-full hover:bg-amber-500">
          Looks good — Continue
        </button>
      </div>
    </div>
  )
}