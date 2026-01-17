import * as Option from 'effect/Option'
import { Result, useAtom, useAtomValue } from '@effect-atom/atom-react'
import { checkStatusAtom, notifyIdSearchParamAtom } from '../atoms'
import { CheckStatusEnum, type NotifyId } from '../functions/schema'

export default function StatusSection() {
  const notifyId = useAtomValue(notifyIdSearchParamAtom)

  if (Option.isNone(notifyId)) {
    return <InvalidNotifyId />
  }

  return <RealStatusSection id={notifyId.value} />
}

function InvalidNotifyId() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
      <p className="text-xl opacity-60">无效的请求 ID</p>
      <a href="/notify" className="mt-4 text-furious-primary underline decoration-dotted underline-offset-4">
        返回发送通知
      </a>
    </div>
  )
}

function RealStatusSection({ id }: { id: NotifyId }) {
  const result = useAtomValue(checkStatusAtom(id))
  return (
    <section className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full min-h-0 justify-center items-center text-center p-4">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl animate-bounce">{status === 'confirmed' ? '✨' : '⏳'}</div>

      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-furious-primary mb-2">
          {Result.builder(result)
            .onSuccess((status) => (status === CheckStatusEnum.Confirmed ? '车主来了！' : '通知已发送'))
            .onFailure(() => '查询失败，请稍后重试')
            .onInitial(() => '查询中，请稍后重试')
            .onDefect(() => '查询失败2，请稍后重试')
            .onWaiting(() => '查询中2，请稍后重试')
            .orNull()}
        </h2>
        <p className="text-xl opacity-80">
          {Result.builder(result)
            .onSuccess((status) => (status === CheckStatusEnum.Confirmed ? '车主已确认正在赶来，请稍等。' : '正在等待车主查看并回复...'))
            .onFailure(() => '查询失败，请稍后重试')
            .onInitial(() => '查询中，请稍后重试')
            .onDefect(() => '查询失败2，请稍后重试')
            .onWaiting(() => '查询中2，请稍后重试')
            .orNull()}
        </p>
      </div>

      {Result.builder(result)
        .onSuccess((status) => {
          return status === CheckStatusEnum.Waiting ? (
            <div className="flex items-center gap-2 text-furious-primary/60 text-sm italic">
              <div className="w-2 h-2 bg-furious-primary rounded-full animate-ping"></div>
              实时同步中
            </div>
          ) : null
        })
        .onFailure(() => {
          return (
            <div className="flex items-center gap-2 text-furious-primary/60 text-sm italic">
              <div className="w-2 h-2 bg-furious-primary rounded-full animate-ping"></div>
              实时同步中
            </div>
          )
        })
        .render()}

      <div className="mt-8 flex flex-col gap-4 w-full">
        <button type="button" onClick={() => (window.location.href = '/notify')} className="text-white/40 text-sm hover:text-white/60 underline decoration-dotted underline-offset-4 cursor-pointer">
          返回重新发送
        </button>
      </div>
    </section>
  )
}
