import { useEffect, useState } from 'react'
import { client } from '../client'
import MapContainer from './MapContainer'
import { generateMapUrls } from '../utils'
import amapIcon from '../assets/amap.svg'
import bmapIcon from '../assets/bmap.svg'
import googleIcon from '../assets/google-map.svg'
import appleIcon from '../assets/apple-map.svg'

export default function ReceiveSection() {
  const [requestId, setRequestId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requesterLocation, setRequesterLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function fetchData(targetId: string) {
      try {
        const res = await client.api['get-location'].$get({ query: { id: targetId } })
        if (!res.ok) throw new Error('Failed to fetch data')

        const data = await res.json()
        // @ts-ignore
        if (data.lat && data.lng) {
          // @ts-ignore
          setRequesterLocation({ lat: data.lat, lng: data.lng })
        }
        // @ts-ignore
        if (data.message) {
          // @ts-ignore
          setMessage(data.message)
        }
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('无法加载请求信息')
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
        <div className="animate-pulse">正在获取请求信息...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="contents">
        <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl text-left">
          <p className="text-amber-800 font-medium mb-2">💡 提示</p>
          <p className="text-slate-800 font-medium mt-2">极有可能有人正在等您，请尽快到车上处理。</p>
        </div>

        {requestId && !confirmed && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-calm-primary text-white text-lg font-medium py-4 px-10 rounded-calm-lg hover:opacity-90 transition-opacity w-full disabled:opacity-50 cursor-pointer"
          >
            {confirming ? '尝试通知中...' : '我也正要过去'}
          </button>
        )}
        {confirmed && <p className="mt-4 text-sm text-green-600 font-medium">✨ 已收到，请注意安全。</p>}
      </div>
    )
  }

  const mapUrlsData = requesterLocation ? generateMapUrls(requesterLocation.lat, requesterLocation.lng) : null

  const getMapUrl = (mapId: string) => {
    if (!mapUrlsData) return ''
    // @ts-ignore
    const data = mapUrlsData[mapId]
    if (!data) return ''

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      const isIos = /iphone|ipad|ipod/.test(ua)
      const isAndroid = /android/.test(ua)

      if (isIos) return data.ios || data.web
      if (isAndroid) return data.android || data.web
    }
    return data.web
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-left">
      {message && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-xl italic text-slate-600 relative text-sm shrink-0">
          <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest"> 留言 </span>“{message}”
        </div>
      )}

      {requesterLocation && (
        <>
          <div className="flex-1 min-h-0 mb-4 overflow-hidden rounded-xl border-2 border-calm-primary/20">
            <MapContainer markerLocation={requesterLocation} />
          </div>
          {/* External Map Buttons */}
          <div className="flex justify-center gap-6 mb-6 shrink-0">
            {[
              { id: 'amap', name: '高德', icon: amapIcon },
              { id: 'bmap', name: '百度', icon: bmapIcon },
              { id: 'google', name: 'Google', icon: googleIcon },
              { id: 'apple', name: 'Apple', icon: appleIcon },
            ].map((mapItem) => {
              const url = getMapUrl(mapItem.id)
              return (
                url && (
                  <a
                    key={mapItem.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 group no-underline transition-all active:scale-95"
                    title={`在${mapItem.name}中打开`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center p-2.5 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all">
                      <img src={mapItem.icon.src} alt={mapItem.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{mapItem.name}</span>
                  </a>
                )
              )
            })}
          </div>
        </>
      )}

      <p className="text-base leading-relaxed mb-4 opacity-80 shrink-0 text-center">{requesterLocation ? '已经帮您生成了各个地图的导航链接，点击即可。' : '对方正在等待，请有空时前往处理。'}</p>

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="bg-calm-primary text-white text-lg font-medium py-3 px-8 rounded-xl hover:opacity-90 transition-opacity w-full disabled:opacity-50 cursor-pointer shrink-0"
        >
          {confirming ? '发送中...' : '我这就来'}
        </button>
      ) : (
        <p className="mt-2 text-sm text-center text-green-600 font-medium shrink-0">✨ 已通知对方，请注意安全，慢慢走。</p>
      )}
    </div>
  )
}
