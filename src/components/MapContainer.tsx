import { useEffect, useState } from 'react'
import { wgs84ToGcj02 } from '../utils'
import AMapLoader from '@amap/amap-jsapi-loader'

export default function MapContainer({ onLocationChange }: { onLocationChange?: (location: { lat: number; lng: number }) => void }) {
  useEffect(() => {
    ;(window as any)._AMapSecurityConfig = {
      serviceHost: import.meta.env.PROD ? '/_AMapService' : 'http://localhost:8787/_AMapService',
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          console.log('Latitude:', latitude)
          console.log('Longitude:', longitude)
          onLocationChange?.({ lat: latitude, lng: longitude })

          // Convert to GCJ-02 for Amap
          const gcj = wgs84ToGcj02(latitude, longitude)

          AMapLoader.load({
            key: '982216c931916da3e84ffbcc5b9203b3', // 申请好的Web端开发者Key，首次调用 load 时必填
            version: '2.0',
          }).then((res) => {
            const map = new res.Map('map-frame', {
              zoom: 16, //初始化地图级别
              center: [gcj.lng, gcj.lat], //初始化地图中心点位置
            })
            const markerContent = document.createElement('div')
            markerContent.className = 'custom-content-marker'
            markerContent.innerHTML = `
              <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png">
              <div class="close-btn">X</div>
            `
            const marker = new res.Marker({
              position: [gcj.lng, gcj.lat],
              content: markerContent,
              offset: new res.Pixel(-13, -30),
            })

            const closeBtn = markerContent.querySelector('.close-btn')
            closeBtn?.addEventListener('click', (e) => {
              e.stopPropagation()
              map.remove(marker)
            })

            map.add(marker)
          })

          // Using Amap URI API for a simple marker map
          // const url = `https://uri.amap.com/marker?position=${gcj.lng},${gcj.lat}&name=My%20Location&src=mypage&coordinate=gaode&callnative=0`
          // setMapUrl(url)
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }, [])

  // if (!mapUrl) {
  //   return null
  // }

  return (
    <div id="map-container" className="mt-1 rounded-xl overflow-hidden border-2 border-furious-primary/30 short:h-36 h-48  shrink-0 relative transition-all duration-300">
      <div id="map-frame" className="w-full h-full border-0" title="Location Map" />
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">当前位置</div>
    </div>
  )
}
