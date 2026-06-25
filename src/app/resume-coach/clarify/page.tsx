'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import StepBar from '@/components/StepBar'

export default function ClarifyPage() {
  const router = useRouter()
  const [weakBullets, setWeakBullets] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [qaLog, setQaLog] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [improving, setImproving] = useState(false)

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId')
    supabase.from('resume_sessions').select('parsed_bullets').eq('id', sessionId!).single()
      .then(async ({ data: s }) => {
        const bullets = s?.parsed_bullets?.experience?.flatMap((e: any) =>
          e.bullets.filter((b: any) => b.strength === 'WEAK').map((b: any) => b.text)
        ) || []
        setWeakBullets(bullets)
        if (bullets.length > 0) {
          await fetchQuestion(bullets[0])
        }
      })
  }, [])

  async function fetchQuestion(bullet: string) {
    setLoading(true)
    const res = await fetch('/api/clarify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet })
    })
    const { response } = await res.json()
    setQuestion(response)
    setLoading(false)
  }

  async function handleSubmit() {
    if (!answer.trim()) return
    setImproving(true)
    const bullet = weakBullets[currentIndex]

    const res = await fetch('/api/clarify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet, userAnswer: answer })
    })
    const { response: improved } = await res.json()
    const newLog = [...qaLog, { bullet, question, answer, improved }]
    setQaLog(newLog)

    if (currentIndex + 1 < weakBullets.length) {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      await fetchQuestion(weakBullets[currentIndex + 1])
    } else {
      const sessionId = localStorage.getItem('sessionId')
      await supabase.from('resume_sessions').update({ clarify_qa: newLog, step: 4 }).eq('id', sessionId!)
      router.push('/resume-coach/optimize')
    }
    setImproving(false)
  }

  const total = weakBullets.length
  const current = currentIndex + 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <StepBar current={3} />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Let's sharpen your impact</h1>
          <p className="text-gray-500 text-sm">A short back-and-forth so every bullet is something you can defend.</p>
        </div>
        <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Step {current} of {total}</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 min-h-64">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Thinking...</div>
        ) : (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0 text-purple-600 text-lg">✦</div>
            <div className="bg-purple-50 rounded-xl p-4 flex-1">
              <p className="text-sm text-amber-600 bg-amber-50 rounded px-2 py-1 mb-3 inline-block">
                Current: {weakBullets[currentIndex]}
              </p>
              <p className="text-sm text-gray-700">{question}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Type your answer..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <button onClick={handleSubmit} disabled={improving || !answer.trim()}
          className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center disabled:opacity-40">
          →
        </button>
      </div>

      <button onClick={() => router.push('/resume-coach/optimize')}
        className="mt-6 w-full bg-amber-400 text-black font-semibold py-3 rounded-full hover:bg-amber-500">
        Generate Better Bullet ✦
      </button>
    </div>
  )
}