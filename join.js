import * as path from 'path'
import jpPostal from './index.es'

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
  ].map(fileName => path.resolve(__dirname, fileName))
    .map(filePath => fs.readFileSync(filePath, 'utf8'))
    .map(rawContent => JSON.parse(rawContent))
  const geo = {}
  for (const [postalCode, postalData] of Object.entries(jpPostal)) {
    const singlePostal = geo[postalCode] = {}
    for (const [prefecture, regions] of Object.entries(postalData)) {
      const singlePrefecture = singlePostal[prefecture] = {}
      for (const region of regions) {
        for(const json of jsons){
          if (json[postalCode] && json[postalCode][prefecture] && json[postalCode][prefecture][region]) {
            singlePrefecture[region] = json[postalCode][prefecture][region]
            found += 1
            break
          }
        }
        if (!singlePrefecture[region]){
          notFound += 1
        }
      }
    }
  }
  console.log(`found: ${found}, not found: ${notFound}`)
  fs.writeFile(path.resolve(__dirname, 'geo.json'), JSON.stringify(geo), err => {
    if (err) throw err
  })
  return geo
}
join()