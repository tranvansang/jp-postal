const csv = require('csv')
const fs = require('fs')
const path = require('path')

const INPUT_FILENAME = 'KEN_ALL-utf8.CSV'
const STANDARD_OUTPUT_FILENAME = 'postal.json'
const EXTENDED_OUTPUT_FILENAME = 'postal-extended.json'

fs.readFile(path.resolve(__dirname, INPUT_FILENAME), 'utf8', (err, rawString) => {
  if (err) throw err
  csv.parse(rawString, (err, csvData) => {
    if (err) throw err
    const postalData = {}
    const extendedPostalData = {}
    csvData.forEach(row => {
      const postalCode = row[2]
      if (!/^[0-9]{7}$/.test(postalCode))
        throw new Error(`Postal code ${postalCode} has invalid format`)
      if (postalCode === '6028019') {
        postalData[postalCode] = {
          '京都府':
            ['京都市上京区近衛町（下長者町通室町西入、下長者町通室町東入、出水通烏丸西京都市上京区入、出水通室町東入、室町通下長者町下る、室町通出水上る、室町通出水上る京都市上京区東入）']
        }
        return
      }
      const prefecture = row[6]
      const region = row[7]
      const subregion = row[8] === '以下に掲載がない場合' ? '' : row[8]
      const conbinedRegion = region + subregion
      postalData[postalCode] = {
        ...(postalData[postalCode] || {}),
        [prefecture]: [
          ...(postalData[postalCode] && postalData[postalCode][prefecture] || []),
          conbinedRegion
        ]
      }
      extendedPostalData[postalCode] = {
        ...(extendedPostalData[postalCode] || {}),
        [prefecture]: {
          ...(extendedPostalData[postalCode] && extendedPostalData[postalCode][prefecture] || {}),
          [region]: [
            ...(extendedPostalData[postalCode] && extendedPostalData[postalCode][prefecture] && extendedPostalData[postalCode][prefecture][region] || []),
            ...(subregion ? [subregion] : [])
          ]
        }
      }
    }, {})
    // Do some statistics
    let maxRegionCount = 0
    let maxRegionPostal
    let maxPrefectureCount = 0
    let maxPrefecturePostal
    Object.keys(postalData).forEach(postalCode => {
      const prefectureCount = Object.keys(postalData[postalCode]).length
      if (prefectureCount > maxPrefectureCount) {
        maxPrefectureCount = prefectureCount
        maxPrefecturePostal = postalCode
      }
      const regionCount = Object.keys(postalData[postalCode]).reduce((acc, cur) =>
        acc + postalData[postalCode][cur].length
        , 0)
      if (regionCount > maxRegionCount) {
        maxRegionCount = regionCount
        maxRegionPostal = postalCode
      }
    })
    console.log(`Postal code ${maxRegionPostal} is associated with ${maxRegionCount} regions`)
    console.log(`Postal code ${maxPrefecturePostal} is associated with ${maxPrefectureCount} prefectures`)
    const postalCodeCount = Object.keys(postalData).length
    console.log(`${csvData.length} records has been proceed to obtain ${postalCodeCount} postal code`)
    fs.writeFile(path.resolve(__dirname, STANDARD_OUTPUT_FILENAME), JSON.stringify(postalData), err => {
      if (err) throw err
    })
    fs.writeFile(path.resolve(__dirname, EXTENDED_OUTPUT_FILENAME), JSON.stringify(extendedPostalData), err => {
      if (err) throw err
    })
  })
})
