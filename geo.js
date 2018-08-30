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
const startIndex = process.env.START_INDEX
const endIndex = process.env.END_INDEX
console.log(`From ${startIndex} to ${endIndex}`)
const errCountMax = 10
const googleMapsClient = googleMaps.createClient({
  // key: process.env.GOOGLE_MAPS_API_KEY,
  key,
  Promise,
  rate: {limit: 120000},
})

const geoFilePath = path.resolve(__dirname, `geo_${startIndex}-${endIndex}.json`)

// const test = async () => {
//   try {
//     const response = await googleMapsClient.geocode({address: '東京都荒川区東尾久'}).asPromise()
//     console.log(response.json.results[0].geometry.location)
//   } catch (err) {
//     console.error(err)
//   }
// }
//
// test().catch(console.error)

let index = 0
let errCount = 0
const getGeo = async () => {
  const geo = {}
  for (const [postalCode, postalData] of Object.entries(jpPostal)) {
    const singlePostal = geo[postalCode] = {}
    for (const [prefecture, regions] of Object.entries(postalData)) {
      const singlePrefecture = singlePostal[prefecture] = {}
      for (const region of regions) {
        index += 1
        if (index - 1 < startIndex)
          continue
        if (index - 1 === endIndex)
          return geo
        try {
          console.log(`${index - 1} fetch ${postalCode} ${prefecture}${region}...`)
          const response = await googleMapsClient.geocode({address: prefecture + region}).asPromise()
          singlePrefecture[region] = response.json.results[0].geometry.location
          console.log(`got ${JSON.stringify(singlePrefecture[region])}`)
        } catch (err) {
          console.error(err)
          errCount += 1
          if (errCount >= errCountMax)
            return geo
        }
      }
      if (!Object.keys(singlePrefecture).length)
        delete singlePostal[prefecture]
    }
    if (!Object.keys(singlePostal).length)
      delete geo[postalCode]
  }
  return geo
}

getGeo().then(geo =>
  fs.writeFile(geoFilePath, JSON.stringify(geo), err => {
    if (err) throw err
  })
).catch(console.error)
/**
 * fetch 1006506 東京都千代田区丸の内新丸の内ビルディング（６階）...
 timeout
 fetch 1006625 東京都千代田区丸の内グラントウキョウサウスタワー（２５階）...
 fetch 1006626 東京都千代田区丸の内グラントウキョウサウスタワー（２６階）...
 timeout
 */
