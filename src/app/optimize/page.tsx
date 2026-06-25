'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StepBar from '@/components/StepBar'

const ROLES = [
  { id: 'product-manager', label: 'Product Manager', sub: 'Discovery, roadmaps, metrics' },
  { id: 'business-analyst', label: 'Business Analyst', sub: 'SQL, dashboards, insights' },
  { id: 'financial-analyst', label: 'Financial Analyst', sub: 'Modeling, valuation, Excel' },
  { id: 'marketing-manager', label: 'Marketing Manager', sub: 'Brand, growth, campaigns' },
  { id: 'sales-manager', label: 'Sales Manager', sub: 'Pipeline, quota, closing' },
  { id: 'hr-business-partner', label: 'HR Business Partner', sub: 'People ops, hiring, culture' },
]

export default function OptimizePage() {
  const router = useRouter()
  const [selected, setSelected] = useState('product-manager')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleOptimize() {
    setLoading(true)
    const sessionId = localStorage.getItem('sessionId')
    const { data: s } = await supabase.from('resume_sessions')
      .select('parsed_bullets, clarify_qa').eq('id', sessionId!).single()

    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsedBullets: s?.parsed_bullets, clarifyQA: s?.clarify_qa, targetRole: selected })
    })
    const data = await res.json()
    setResult(data)

    await supabase.from('resume_sessions').update({
      target_role: selected, optimized_bullets: data.optimizedBullets,
      match_score: data.matchScore, recommendations: data.recommendations, step: 5
    }).eq('id', sessionId!)
    setLoading(false)
  }

  async function handleContinue() {
    router.push('/resume-coach/download')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StepBar current={4} />
      <h1 className="text-2xl font-bold mb-1">Which role are you targeting?</h1>
      <p className="text-gray-500 mb-6">We'll re-rank your bullets, surface relevant skills, and score the fit.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map(role => (
          <button key={role.id} onClick={() => setSelected(role.id)}
            className={`text-left p-4 rounded-xl border transition-all
              ${selected === role.id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{role.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{role.sub}</p>
              </div>
              {selected === role.id && <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {!result ? (
        <button onClick={handleOptimize} disabled={loading}
          className="w-full bg-amber-400 text-black font-semibold py-3 rounded-full hover:bg-amber-500 disabled:opacity-40">
          {loading ? 'Analyzing with Gemini...' : '✦ Optimize for this role'}
        </button>
      ) : (
        <div className="border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#grad)" strokeWidth="3"
                  strokeDasharray={`${result.matchScore} ${100 - result.matchScore}`} strokeLinecap="round" />
                <defs><linearGradient id="grad"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#f59e0b" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{result.matchScore}%</span>
                <span className="text-xs text-gray-400">Role Match</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Recommendations</h3>
              <p className="text-xs text-amber-600 mb-2">Small changes that move your match score the most.</p>
              {result.recommendations?.map((r: string, i: number) => (
                <p key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{r}</p>
              ))}
            </div>
          </div>
          <p className="text-xs text-center text-green-600 font-medium mb-4">{result.matchLabel}</p>
          <button onClick={handleContinue} className="w-full bg-amber-400 text-black font-semibold py-3 rounded-full hover:bg-amber-500">
            Continue to Download →
          </button>
        </div>
      )}
    </div>
  )
}