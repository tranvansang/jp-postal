const csv = require('csv')
const fs = require('fs')
const path = require('path')
const wanakana = require('wanakana')
const fullwidth = require('fullwidth').default

const INPUT_FILENAME = 'KEN_ALL-utf8.CSV'
const STANDARD_OUTPUT_FILENAME = 'postal.json'
const EXTENDED_OUTPUT_FILENAME = 'postal-extended.json'
const KANA_OUTPUT_FILENAME = 'kana.json'
const KANA_EXTENDED_OUTPUT_FILENAME = 'kana-extended.json'

function toHalfWidth (str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)}).replace('－', '-')
}

function toFullWidth (str) {
    return str.replace(/[A-Za-z0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0)})
}
function capitalize(str){
  if (!str.length) return str
  return str[0].toUpperCase() + str.slice(1)
}
function toRomaji(str){
  return capitalize(toHalfWidth(wanakana.toRomaji(fullwidth(str))))
}

const index = {
  postalCode: 2,
  prefectureKana: 3,
  regionKana: 4,
  subregionKana: 5,
  prefecture: 6,
  region: 7,
  subregion: 8
}

const kana = {}
const kanaExtended = {}

const writeFile = (fileName, data) => fs.writeFile(path.resolve(__dirname, fileName), JSON.stringify(data, null, 2), err => {
    if (err) throw err
  })
fs.readFile(path.resolve(__dirname, INPUT_FILENAME), 'utf8', (err, rawString) => {
  if (err) throw err
  csv.parse(rawString, (err, csvData) => {
    if (err) throw err
    const postalData = {}
    const extendedPostalData = {}
    csvData.forEach(row => {
      const postalCode = row[index.postalCode]
      if (!/^[0-9]{7}$/.test(postalCode))
        throw new Error(`Postal code ${postalCode} has invalid format`)
      if (postalCode === '6028019') {
        postalData[postalCode] = {
          '京都府':
            ['京都市上京区近衛町（下長者町通室町西入、下長者町通室町東入、出水通烏丸西京都市上京区入、出水通室町東入、室町通下長者町下る、室町通出水上る、室町通出水上る京都市上京区東入）']
        }
        return
      }
      const prefectureKana = row[index.prefectureKana]
      const regionKana = row[index.regionKana]
      const subregionKana = row[index.subregionKana].toLowerCase() === 'ikanikeisaiganaibaai' ? '' : row[index.subregionKana].replace('notsuginibanchigakurubaai', '')
      const prefecture = row[index.prefecture]
      const region = row[index.region]
      const subregion = row[index.subregion] === '以下に掲載がない場合' ? '' : row[index.subregion].replace('の次に番地がくる場合', '')
      const combinedRegion = region + subregion
      kana[prefecture] = toRomaji(prefectureKana)
      kana[combinedRegion] = toRomaji(regionKana) + ' ' + toRomaji(subregionKana)
      kanaExtended[prefecture] = toRomaji(prefectureKana)
      kanaExtended[region] = toRomaji(regionKana)
      kanaExtended[subregion] = toRomaji(subregionKana)

      postalData[postalCode] = {
        ...(postalData[postalCode] || {}),
        [prefecture]: [
          ...(postalData[postalCode] && postalData[postalCode][prefecture] || []),
          combinedRegion
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
    writeFile(STANDARD_OUTPUT_FILENAME, postalData)
    writeFile(EXTENDED_OUTPUT_FILENAME, extendedPostalData)
    writeFile(KANA_OUTPUT_FILENAME, kana)
    writeFile(KANA_EXTENDED_OUTPUT_FILENAME, kanaExtended)
  })
})
