import { useEffect, useState } from 'react'
import { wgs84ToGcj02 } from '../utils'
import AMapLoader from '@amap/amap-jsapi-loader'

export default function MapContainer({
  onLocationChange,
  markerLocation,
  initialCenter,
}: {
  onLocationChange?: (location: { lat: number; lng: number }) => void
  markerLocation?: { lat: number; lng: number }
  initialCenter?: { lat: number; lng: number }
}) {
  useEffect(() => {
    ;(window as any)._AMapSecurityConfig = {
      serviceHost: import.meta.env.PROD ? '/_AMapService' : 'http://localhost:8787/_AMapService',
    }
    AMapLoader.load({
      key: '982216c931916da3e84ffbcc5b9203b3',
      version: '2.0',
    })
    const loadMap = (lat: number, lng: number, isRequester: boolean) => {
      const gcj = wgs84ToGcj02(lat, lng)
      AMapLoader.load({
        key: '982216c931916da3e84ffbcc5b9203b3',
        version: '2.0',
      }).then((res) => {
        const map = new res.Map('map-frame', {
          zoom: 16,
          center: [gcj.lng, gcj.lat],
        })

        const markerContent = document.createElement('div')
        markerContent.className = 'custom-content-marker'
        markerContent.innerHTML = `
          <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/dir-via-marker.png">
          ${isRequester ? '<div class="close-btn">X</div>' : ''}
        `
        const marker = new res.Marker({
          position: [gcj.lng, gcj.lat],
          content: markerContent,
          offset: new res.Pixel(-13, -30),
        })

        if (isRequester) {
          const closeBtn = markerContent.querySelector('.close-btn')
          closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation()
            map.remove(marker)
          })
        }

        map.add(marker)
      })
    }

    if (markerLocation) {
      loadMap(markerLocation.lat, markerLocation.lng, false)
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          onLocationChange?.({ lat: latitude, lng: longitude })
          loadMap(latitude, longitude, true)
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    }
  }, [markerLocation])

  // if (!mapUrl) {
  //   return null
  // }

  return (
    <div id="map-container" className="rounded-xl overflow-hidden short:h-36 h-48  shrink-0 relative transition-all duration-300">
      <div id="map-frame" className="w-full h-full border-0" title="Location Map" />
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">当前位置</div>
    </div>
  )
}
