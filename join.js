import path from 'path'
import fs from 'fs'

const join = () => {
  const geo = {}
  for(const fileName of [
    'geo_0-10000.json',
    'geo_10000-20000.json',
    'geo_20000-30000.json',
    'geo_30000-35000.json',
  ]) {
    const filePath = path.resolve(__dirname, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const json = JSON.parse(fileContent)
    for(const [key, val] of Object.entries(json))
      geo[key] = val
  }
  fs.writeFile(
    path.resolve(__dirname, 'geo-raw.json'),
    JSON.stringify(geo, null, 2),
    err => {
      if (err) throw err
    })
}
join()
