const steps = ['Upload', 'Review', 'Clarify', 'Optimize', 'Download']

export default function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
              ${done ? 'bg-purple-600 text-white' : active ? 'bg-amber-400 text-black' : 'bg-gray-100 text-gray-400'}`}>
              {num}
            </div>
            <span className={`text-sm ${active ? 'font-semibold text-black' : 'text-gray-400'}`}>{step}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}