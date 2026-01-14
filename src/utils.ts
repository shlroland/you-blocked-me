export function wgs84ToGcj02(lat: number, lng: number) {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  if (outOfChina(lat, lng)) return { lat, lng };

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
  return { lat: lat + dLat, lng: lng + dLng };
}

function outOfChina(lat: number, lng: number) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(x: number, y: number) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
}

export function gcj02ToBd09(lat: number, lng: number) {
  const xPi = 3.14159265358979324 * 3000.0 / 180.0;
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPi);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPi);
  const bd_lng = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  return { lat: bd_lat, lng: bd_lng };
}

export function generateMapUrls(lat: number, lng: number) {
  const gcj = wgs84ToGcj02(lat, lng)
  const bd = gcj02ToBd09(gcj.lat, gcj.lng)

  return {
    amap: {
      web: `https://uri.amap.com/marker?position=${gcj.lng},${gcj.lat}&name=位置`,
      ios: `iosamap://viewMap?sourceApplication=you-blocked-me&poiname=位置&lat=${gcj.lat}&lon=${gcj.lng}&dev=0`,
      android: `androidamap://viewMap?sourceApplication=you-blocked-me&poiname=位置&lat=${gcj.lat}&lon=${gcj.lng}&dev=0`,
    },
    bmap: {
      web: `https://api.map.baidu.com/marker?location=${bd.lat},${bd.lng}&title=位置&content=位置&output=html`,
      ios: `baidumap://map/marker?location=${bd.lat},${bd.lng}&title=位置&content=位置&src=ios.baidu.openAPIdemo`,
      android: `bdapp://map/marker?location=${bd.lat},${bd.lng}&title=位置&content=位置&src=and.baidu.openAPIdemo`,
    },
    google: {
      web: `https://www.google.com/maps/search/?api=1&query=${gcj.lat},${gcj.lng}`,
      ios: `comgooglemaps://?q=${gcj.lat},${gcj.lng}`,
      android: `geo:${gcj.lat},${gcj.lng}?q=${gcj.lat},${gcj.lng}`,
    },
    apple: {
      web: `https://maps.apple.com/?ll=${lat},${lng}&q=位置`,
      ios: `maps://?ll=${lat},${lng}&q=位置`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`, // Android fallback to geo for apple link click
    },
  }
}
