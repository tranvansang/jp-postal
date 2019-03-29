import path from 'path'
import fs from 'fs'
import jpPostal from './index.es'

const join = () => {
  let found = 0
  let notFound = 0
  const fileName = 'geo-raw.json'
  const filePath = path.resolve(__dirname, fileName)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const rawGeo = JSON.parse(fileContent)
  let cnt = 0
  for (const [postalCode, postalData] of Object.entries(jpPostal)) {
    for (const [prefecture, regions] of Object.entries(postalData)) {
      const singlePrefecture = postalData[prefecture] = {}
      for (const region of regions) {
        const place = prefecture + region
        if (rawGeo[place].results.length === 0){
          console.log(place, rawGeo[place])
          continue
        }
        singlePrefecture[region] = rawGeo[place].results[0].geometry.location
      }
    }
  }
  fs.writeFile(
    path.resolve(__dirname, 'geo.json'),
    JSON.stringify(jpPostal, null, 2),
    err => {
      if (err) throw err
    })
}
join()
