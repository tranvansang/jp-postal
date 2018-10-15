import jpPostal from './index.es'
import * as fs from 'fs'
import 'dotenv/config'
import googleMaps from '@google/maps'
import * as path from 'path'

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('Please set GOOGLE_MAP_API_KEY in .env before fetching geo data')
  process.exit()
}
const key = process.env.GOOGLE_MAPS_API_KEY
let startIndex = parseInt(process.env.START_INDEX)
let endIndex = parseInt(process.env.END_INDEX)
const errCountMax = 10
const googleMapsClient = googleMaps.createClient({
  key,
  Promise,
  rate: {limit: 120000},
})

function getBoundsZoomLevel(bounds, mapDim) {
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 21

  function latRad(lat) {
    const sin = Math.sin(lat * Math.PI / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const ne = bounds.northeast
  const sw = bounds.southwest

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI

  const lngDiff = ne.lng - sw.lng
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

  return Math.min(latZoom, lngZoom, ZOOM_MAX)
}

const regionMaps = {
  '富山県中新川郡上市町三杉町': '富山県中新川郡上市町',
  '岐阜県岐阜市石原（１〜３丁目）': '岐阜県岐阜市石原',
  '京都府京都市上京区近衛町（下長者町通室町西入、下長者町通室町東入、出水通烏丸西京都市上京区入、出水通室町東入、室町通下長者町下る、室町通出水上る、室町通出水上る京都市上京区東入）':
    '京都府京都市上京区近衛町',
  '山口県下松市東豊井（花垣）': '山口県下松市東豊井',
  '山口県下松市温見（後山）': '山口県下松市温見',
  '鹿児島県奄美市名瀬浦上（その他）': '鹿児島県奄美市名瀬浦上',
  '北海道札幌市東区北五条東（４〜７丁目）': '北海道札幌市東区北五条東',
  '北海道小樽市銭函（４〜５丁目）': '北海道小樽市銭函',
  '北海道深川市音江町（１〜２丁目）': '北海道深川市音江町',
  '北海道河東郡士幌町士幌（南一区１８号〜２１号南）': '北海道河東郡士幌町士幌',
  '北海道河東郡士幌町士幌（南一区２１号北〜２９号）': '北海道河東郡士幌町士幌',
  '岩手県九戸郡洋野町種市第２２地割〜第２３地割（一区、二区、三区、四区、大町、小橋、住吉町）': '岩手県九戸郡洋野町種市第２２地割〜第２３地割',
  //not fetched
  '東京都品川区北品川（１〜４丁目）': '東京都品川区北品川',
  '東京都新宿区西新宿新宿野村ビル（地階・階層不明）': '東京都新宿区西新宿新宿野村ビル',
  '東京都新宿区西新宿小田急第一生命ビル（地階・階層不明）': '東京都新宿区西新宿小田急第一生命ビル',
  '神奈川県横浜市西区桜木町（４〜７丁目）': '神奈川県横浜市西区桜木町',
  '神奈川県横浜市西区花咲町（４〜７丁目）': '神奈川県横浜市西区花咲町',
  '長野県須坂市仁礼町（その他）': '長野県須坂市仁礼町',
  '長野県東御市県': '東御市県',
  '愛知県豊川市御津町下佐脇浜道': '愛知県豊川市御津町下佐脇浜道',
  '愛知県名古屋市中村区名駅ＪＲゲートタワー（２２階）': '愛知県名古屋市中村区名駅ＪＲゲートタワー',
}
const getPlaceNames = () => {
  const names = []
  for (const [postalCode, postalData] of Object.entries(jpPostal)) {
    for (const [prefecture, regions] of Object.entries(postalData)) {
      for (const region of regions) {
        names.push(prefecture + region)
      }
    }
  }
  return names
}
const timeoutPromise = (cb, delay = 0) => new Promise((resolve, reject) =>
  setTimeout(() => Promise.resolve(cb()).then(resolve).catch(reject) , delay)
)

const RATE_LIMIT = 50
const crawl = async () => {
  const geo = {}
  try {
    const placeNames = getPlaceNames()
    startIndex = Math.min(startIndex, placeNames.length)
    endIndex = Math.min(endIndex, placeNames.length)
    console.log(`(All) From ${startIndex} to ${endIndex}`)
    const run = start => async () => {
      if (start >= endIndex) return
      const end = Math.min(endIndex, start + RATE_LIMIT)
      console.log(`From ${start} to ${end}`)
      const promises = placeNames
        .slice(start, end)
        .map(place => googleMapsClient.geocode({address: regionMaps[place] || place}).asPromise())
      const responses = await Promise.all(promises)
      for(let i = start; i < end; i++)
        geo[placeNames[i]] = responses[i - start].json
      await timeoutPromise(run(start + RATE_LIMIT), 1000)
    }
    await timeoutPromise(run(startIndex))
  }catch(err){
    console.error(err)
    throw err
  }finally {
    fs.writeFile(
      path.resolve(__dirname, `geo_${startIndex}-${endIndex}.json`),
      JSON.stringify(geo, null, 2),
      err => {
        if (err) throw err
      }
    )
  }
}

crawl()
