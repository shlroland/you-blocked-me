import { useEffect, useState } from 'react'
import { client } from '../client'

export default function StatusSection() {
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'unknown'>('waiting')
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    setRequestId(id)

    if (id) {
      const poll = async () => {
        try {
          const res = await client.api['check-status'].$get({ query: { id } })
          if (res.ok) {
            const data = await res.json()
            if (data.status === 'confirmed') {
              setStatus('confirmed')
            } else {
              setStatus('waiting')
            }
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }

      const interval = setInterval(poll, 3000)
      poll() // Initial check
      return () => clearInterval(interval)
    }
  }, [])

  if (!requestId) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
        <p className="text-xl opacity-60">无效的请求 ID</p>
        <a href="/notify" className="mt-4 text-furious-primary underline decoration-dotted underline-offset-4">
          返回发送通知
        </a>
      </div>
    )
  }

  return (
    <section className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full min-h-0 justify-center items-center text-center p-4">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl animate-bounce">{status === 'confirmed' ? '✨' : '⏳'}</div>

      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-furious-primary mb-2">{status === 'confirmed' ? '车主来了！' : '通知已发送'}</h2>
        <p className="text-xl opacity-80">{status === 'confirmed' ? '车主已确认正在赶来，请稍等。' : '正在等待车主查看并回复...'}</p>
      </div>

      {status === 'waiting' && (
        <div className="flex items-center gap-2 text-furious-primary/60 text-sm italic">
          <div className="w-2 h-2 bg-furious-primary rounded-full animate-ping"></div>
          实时同步中
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 w-full">
        <button type="button" onClick={() => (window.location.href = '/notify')} className="text-white/40 text-sm hover:text-white/60 underline decoration-dotted underline-offset-4 cursor-pointer">
          返回重新发送
        </button>
      </div>
    </section>
  )
}
