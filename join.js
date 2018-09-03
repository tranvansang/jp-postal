import * as path from 'path'
import fs from 'fs'
import jpPostal from './index.es'
import googleMaps from '@google/maps/lib'
import 'dotenv/config'

const key = process.env.GOOGLE_MAPS_API_KEY
const googleMapsClient = googleMaps.createClient({
  key,
  Promise,
  rate: {limit: 120000},
})

const regionMaps = {
  '富山県中新川郡上市町三杉町': '富山県中新川郡上市町',
  '岐阜県岐阜市石原（１〜３丁目）': '岐阜県岐阜市石原',
  '京都府京都市上京区近衛町（下長者町通室町西入、下長者町通室町東入、出水通烏丸西':
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
}
const resultMaps = {
  '神奈川県横浜市神奈川区神奈川': {
    lat: 35.4728424,
    lng: 139.635123
  },
  '長野県東御市県': {
    lat: 36.3595502,
    lng: 138.3256686
  },
  '福井県南条郡南越前町新道': {
    lat: 35.7556303,
    lng: 136.1330434,
  },
  '福井県三方上中郡若狭町新道': {
    lat: 35.4600153,
    lng: 135.8914154
  },
  '福島県大沼郡会津美里町権現堂甲': {
    lat: 37.45845515,
    lng: 139.88293232
  },
  '宮城県加美郡加美町鶴喰': {
    lat: 37.45845515,
    lng: 139.88293232
  },
  '山形県鶴岡市新斎部': {
    lat: 38.734405,
    lng: 139.815971
  }
}

const join = () => {
  let found = 0
  let notFound = 0
  const jsons = [
    'geo_0-10000.json',
    'geo_10000-15000.json',
    'geo_100000-105000.json',
    'geo_105000-110000.json',
    'geo_110000-115000.json',
    'geo_115000-119090.json',
    'geo_15000-19500.json',
    'geo_19500-30000.json',
    'geo_30000-39900.json',
    'geo_40000-45000.json',
    'geo_45000-50000.json',
    'geo_50000-55000.json',
    'geo_55000-60000.json',
    'geo_60000-65000.json',
    'geo_65000-70000.json',
    'geo_70000-75000.json',
    'geo_75000-79500.json',
    'geo_80000-85000.json',
    'geo_85000-90000.json',
    'geo_90000-95000.json',
    'geo_95000-100000.json',
    'geo.json'
  ].map(fileName => path.resolve(__dirname, fileName))
    .map(filePath => fs.readFileSync(filePath, 'utf8'))
    .map(rawContent => JSON.parse(rawContent))
  const geo = {}
  const promises = []
  let cnt = 0
  for (const [postalCode, postalData] of Object.entries(jpPostal)) {
    const singlePostal = geo[postalCode] = {}
    for (const [prefecture, regions] of Object.entries(postalData)) {
      const singlePrefecture = singlePostal[prefecture] = {}
      for (const region of regions) {
        for (const json of jsons) {
          if (json[postalCode] && json[postalCode][prefecture] && json[postalCode][prefecture][region]) {
            singlePrefecture[region] = json[postalCode][prefecture][region]
            found += 1
            break
          }
        }
        if (!singlePrefecture[region] && resultMaps.hasOwnProperty(prefecture + region)){
          singlePrefecture[region] = resultMaps[prefecture + region]
        }
        notFound += !singlePrefecture[region]
        if (!singlePrefecture[region] && cnt < 100) {
          cnt += 1
          console.log(`fetch ${postalCode} ${prefecture}${region}...`)
          promises.push(
            googleMapsClient
              .geocode({address: regionMaps[prefecture + region] ||( prefecture + region)})
              .asPromise()
              .then(response => {
                try {
                  singlePrefecture[region] = response.json.results[0].geometry.location
                  console.log(`got ${JSON.stringify(singlePrefecture[region])}`)
                } catch (err) {
                  console.log(err)
                  console.log(`postal ${postalCode} ${prefecture} ${region} not found`)
                  console.log(response.json)
                }
              }).catch(err => {
              console.error(err)
            })
          )
        }
      }
    }
  }
  Promise.all(promises).then(() => {
    console.log(`found: ${found}, not found: ${notFound}`)
    fs.writeFile(path.resolve(__dirname, 'geo.json'), JSON.stringify(geo), err => {
      if (err) throw err
    })
  })
  return geo
}
join()