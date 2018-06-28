const csv = require('csv')
const fs = require('fs')
const path = require('path')

fs.readFile(path.resolve(__dirname, 'KEN_ALL-utf8.CSV'), 'utf8', (err, rawString) =>{
  if (err) throw err
  csv.parse(rawString, (err, csvData) => {
    if (err) throw err
    const postalData = {}
    csvData.forEach(row => {
      const postalCode = row[2]
      if (!/^[0-9]{7}$/.test(postalCode))
        throw new Error(`Postal code ${postalCode} has invalid format`)
      const prefecture = row[6]
      const region = row[7] + (row[8] === '以下に掲載がない場合' ? '' : row[8])
      const currentData = postalData[postalCode]
      if (currentData)
        postalData[postalCode] = {
          ...currentData,
          [prefecture] : [
            ...(currentData[prefecture] ? currentData[prefecture] : []),
            region
          ]
        }
      else postalData[postalCode] = {[prefecture]: [region]}
    }, {})
    // Do some statistics
    let maxRegionCount = 0
    let maxRegionPostal
    let maxPrefectureCount = 0
    let maxPrefecturePostal
    Object.keys(postalData).forEach(postalCode => {
      const prefectureCount = Object.keys(postalData[postalCode]).length
      if (prefectureCount > maxPrefectureCount){
        maxPrefectureCount = prefectureCount
        maxPrefecturePostal = postalCode
      }
      const regionCount = Object.keys(postalData[postalCode]).reduce((acc, cur) =>
        acc + postalData[postalCode][cur].length
        , 0)
      if (regionCount > maxRegionCount){
        maxRegionCount = regionCount
        maxRegionPostal = postalCode
      }
    })
    console.log(`Postal code ${maxRegionPostal} is associated with ${maxRegionCount} regions`)
    console.log(`Postal code ${maxPrefecturePostal} is associated with ${maxPrefectureCount} prefectures`)
    const postalCodeCount = Object.keys(postalData).length
    console.log(`${csvData.length} records has been procceed to obtain ${postalCodeCount} postal code`)
    fs.writeFile(path.resolve(__dirname, 'postal.json'), JSON.stringify(postalData), err => {
      if (err)
        throw err
    })
  })
})
