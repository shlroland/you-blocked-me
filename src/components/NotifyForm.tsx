import { useActionState, useState } from 'react'
import MapContainer from './MapContainer'
import * as Exit from 'effect/Exit'

type State = {
  error?: string
  success: boolean
  requestId?: string
}

// Mock server action
import { useAtomSet } from '@effect-atom/atom-react'
import { notifyActionAtom } from '../atoms'

// Server action

export default function NotifyForm() {
  const notifyAction = useAtomSet(notifyActionAtom, { mode: 'promiseExit' })
  const [msgText, setMsgText] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleQuickMsg = (text: string) => {
    setMsgText(text)
  }

  const sendMessage = async (_prevState: State | null, formData: FormData): Promise<State> => {
    const message = formData.get('message') as string
    const latStr = formData.get('lat') as string
    const lngStr = formData.get('lng') as string

    const location = latStr && lngStr ? { lat: parseFloat(latStr), lng: parseFloat(lngStr) } : null

    const result = await notifyAction({
      message,
      location,
    })

    const state: State = Exit.isSuccess(result)
      ? {
          success: true,
          requestId: result.value,
        }
      : {
          success: false,
          error: result.pipe(Exit.getOrElse(() => 'Unknown error')),
        }

    setTimeout(() => {
      if (state?.success && state?.requestId) {
        window.location.href = `/status?id=${state.requestId}`
      }
    }, 1000)
    return state
  }

  const [state, formAction, isPending] = useActionState(sendMessage, null)

  return (
    <form action={formAction} className="contents">
      {location && (
        <>
          <input type="hidden" name="lat" value={location.lat} />
          <input type="hidden" name="lng" value={location.lng} />
        </>
      )}

      {/* Message Form Section */}
      <section className="flex-1 flex flex-col gap-3 max-w-2xl mx-auto w-full min-h-0 justify-center">
        <label className="flex flex-col min-h-0 shrink-0">
          <span className="text-sm font-bold uppercase tracking-wide opacity-80 mb-2 block shrink-0"> 📝 留言给车主 </span>
          <textarea
            name="message"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            className="w-full h-40 short:h-24 bg-white/10 border-2 border-furious-primary/50 text-furious-text p-4 short:p-2 text-base resize-none focus:outline-none focus:border-furious-primary placeholder:text-white/30 rounded-lg"
            placeholder="例如：您好，您的车挡住了我的车道，麻烦尽快挪一下，谢谢！"
          />
        </label>

        {/* Quick Messages */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { label: '🚨 紧急！', value: '十万火急！家中有急事，请速速挪车！🚗💨' },
            { label: '🙏 麻烦您了', value: '不好意思打扰了，您的车挡路了，辛苦挪一下🙏✨' },
            { label: '⏰ 我赶时间', value: '赶时间上班/办事，麻烦您快点挪车，万分感谢！⌚️🏃‍♂️' },
          ].map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickMsg(value)}
              className="bg-white/10 px-3 py-2 short:py-1 text-sm border border-white/20 hover:bg-white/20 transition-colors rounded-lg flex-1 text-center whitespace-nowrap cursor-pointer hover:border-white/40"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Location Map */}
        <div className="border-2 border-furious-primary/30 rounded-xl">
          <MapContainer onLocationChange={setLocation} />
        </div>
      </section>

      {/* Send Button Footer */}
      <footer className="py-4 short:py-2 max-w-2xl mx-auto w-full shrink-0">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-furious-primary text-white font-black text-xl short:text-lg py-4 short:py-3  uppercase tracking-wider hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-furious-primary/30 disabled:opacity-70 disabled:grayscale disabled:scale-100 cursor-pointer"
        >
          {isPending ? '🚀 发送中...' : '📣 发送通知'}
        </button>
        <p className="text-center text-xs opacity-40 mt-3">点击后将立即通知车主</p>

        {state?.error && <div className="text-center text-red-400 mt-2 font-bold animate-pulse">{state.error}</div>}
      </footer>
    </form>
  )
}
