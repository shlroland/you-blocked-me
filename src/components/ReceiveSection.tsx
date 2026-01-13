import { useEffect, useState } from 'react'
import { client } from '../client'
import MapContainer from './MapContainer'

export default function ReceiveSection() {
  const [requestId, setRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requesterLocation, setRequesterLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function fetchData(targetId: string) {
      try {
        const res = await client.api['get-location'].$get({ query: { id: targetId } })
        if (!res.ok) throw new Error('Failed to fetch location')

        const data = await res.json()
        // @ts-ignore
        setRequesterLocation({ lat: data.lat, lng: data.lng })
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('无法加载位置信息')
        setLoading(false)
      }
    }

    const id = new URLSearchParams(window.location.search).get('id')
    setRequestId(id)

    if (id) {
      fetchData(id)
    } else {
      setError('缺少请求 ID')
      setLoading(false)
    }
  }, [])

  const handleConfirm = async () => {
    if (!requestId) return

    setConfirming(true)

    try {
      const res = await client.api['owner-confirm'].$post({
        json: { id: requestId },
      })

      if (res.ok) {
        setConfirmed(true)
      } else {
        throw new Error('Confirm failed')
      }
    } catch (err) {
      console.error(err)
      alert('发送失败，请重试')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="text-lg leading-relaxed mb-6 opacity-80">
        <div className="animate-pulse">正在获取位置信息...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 mb-6">{error}</div>
  }

  return (
    <div className="contents">
      <div className="mb-6 overflow-hidden rounded-xl border-2 border-calm-primary/20">{requesterLocation && <MapContainer markerLocation={requesterLocation} />}</div>

      <p className="text-lg leading-relaxed mb-8 opacity-80">对方在上述位置等待，请有空时前往处理。</p>

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="bg-calm-primary text-white text-lg font-medium py-4 px-10 rounded-calm-lg hover:opacity-90 transition-opacity w-full disabled:opacity-50 cursor-pointer"
        >
          {confirming ? '发送中...' : '我这就来'}
        </button>
      ) : (
        <p className="mt-4 text-sm text-green-600">已通知对方，慢慢走，注意安全 ✨</p>
      )}
    </div>
  )
}
