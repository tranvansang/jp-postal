const csv = require('csv')
const fs = require('fs')
const path = require('path')
// const wanakana = require('wanakana')
// const fullwidth = require('fullwidth').default

const INPUT_FILENAME = 'KEN_ALL-utf8.CSV'
const STANDARD_OUTPUT_FILENAME = 'postal.json'
// const EXTENDED_OUTPUT_FILENAME = 'postal-extended.json'
// const KANA_OUTPUT_FILENAME = 'kana.json'
// const KANA_EXTENDED_OUTPUT_FILENAME = 'kana-extended.json'

// function toHalfWidth (str) {
//     return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)}).replace('－', '-')
// }

// function toFullWidth (str) {
//     return str.replace(/[A-Za-z0-9]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) + 0xFEE0)})
// }
// function capitalize(str){
//   if (!str.length) return str
//   return str[0].toUpperCase() + str.slice(1)
// }
// function toRomaji(str){
//   return capitalize(toHalfWidth(wanakana.toRomaji(fullwidth(str))))
// }

const index = {
  postalCode: 2,
  prefectureKana: 3,
  regionKana: 4,
  subregionKana: 5,
  prefecture: 6,
  region: 7,
  subregion: 8
}

// const kana = {}
// const kanaExtended = {}

const writeFile = (fileName, data) => fs.writeFile(path.resolve(__dirname, fileName), JSON.stringify(data, null, 2), err => {
    if (err) throw err
  })
fs.readFile(path.resolve(__dirname, INPUT_FILENAME), 'utf8', (err, rawString) => {
  if (err) throw err
  csv.parse(rawString, (err, csvData) => {
    if (err) throw err
    const postalData = {}
    // const extendedPostalData = {}
    for (const row of csvData) {
      const postalCode = row[index.postalCode]
      if (!/^[0-9]{7}$/.test(postalCode))
        throw new Error(`Postal code ${postalCode} has an invalid format`)
      const prefectureKana = row[index.prefectureKana]
      const regionKana = row[index.regionKana]
      const subregionKana = row[index.subregionKana].toLowerCase() === 'ikanikeisaiganaibaai' ? '' : row[index.subregionKana].replace('notsuginibanchigakurubaai', '')
      const prefecture = row[index.prefecture]
      const region = row[index.region]
      const subregion = row[index.subregion] === '以下に掲載がない場合' ? '' : row[index.subregion].replace('の次に番地がくる場合', '')
      const combinedRegion = region + subregion
      // kana[prefecture] = toRomaji(prefectureKana)
      // kana[combinedRegion] = toRomaji(regionKana) + ' ' + toRomaji(subregionKana)
      // kanaExtended[prefecture] = toRomaji(prefectureKana)
      // kanaExtended[region] = toRomaji(regionKana)
      // kanaExtended[subregion] = toRomaji(subregionKana)

      postalData[postalCode] = {
        ...(postalData[postalCode] || {}),
        [prefecture]: [
          ...(postalData[postalCode] && postalData[postalCode][prefecture] || []),
          combinedRegion
        ]
      }
      // extendedPostalData[postalCode] = {
      //   ...(extendedPostalData[postalCode] || {}),
      //   [prefecture]: {
      //     ...(extendedPostalData[postalCode] && extendedPostalData[postalCode][prefecture] || {}),
      //     [region]: [
      //       ...(extendedPostalData[postalCode] && extendedPostalData[postalCode][prefecture] && extendedPostalData[postalCode][prefecture][region] || []),
      //       ...(subregion ? [subregion] : [])
      //     ]
      //   }
      // }
    }
    // Do some statistics
    let maxRegionCount = 0
    let maxRegionPostal
    let maxPrefectureCount = 0
    let maxPrefecturePostal
		for (const [postalCode, prefectures] of Object.entries(postalData)) {
      const prefectureCount = Object.keys(prefectures).length
      if (prefectureCount > maxPrefectureCount) {
        maxPrefectureCount = prefectureCount
        maxPrefecturePostal = postalCode
      }
      if (prefectureCount > 1) {
        console.log(`Postal code ${postalCode} is associated with ${prefectureCount} prefectures.`)
        for (const prefecture of Object.keys(prefectures))
        	console.log(prefecture)
      }
      const regionCount = Object.keys(prefectures).reduce(
        (acc, cur) => acc + prefectures[cur].length, 0
      )
      if (regionCount > maxRegionCount) {
        maxRegionCount = regionCount
        maxRegionPostal = postalCode
      }
      const countMatches = (haystack, needle) => (haystack.match(new RegExp(needle, 'g')) || []).length
      const endWithANumber = str => {
        for (const needle of [
        	'０', '１', '２', '３', '４', '５', '６', '７', '８', '９',
        ]) if (str.endsWith(needle)) return true
        return false
      }
      const logOnlyConversionWithSuffix = false //toggle this variable to debug the suffix smart conversion
      for (const regions of Object.values(prefectures)) {
        const newRegions = []
        const smartSubRegions = str => {
          if (str.includes('「')) {
            newRegions.push(str)
            return
          }
          const fullSubRegions = []
          const prefix = str.substring(0, str.indexOf('（'))
          const subRegions = str.substring(str.indexOf('（') + 1, str.length - 1).split('、')
          if (!subRegions.length) throwError()
          const lastSubRegion = subRegions[subRegions.length - 1]
          let suffix = ''
          const suffixList = ['番地', '丁目']
					for (const sf of suffixList) if (lastSubRegion.endsWith(sf)) {
            suffix = sf
					  break
          }
          for (const subRegion of subRegions) {
            fullSubRegions.push(`${prefix}（${subRegion}${subRegion.includes(suffix) || !endWithANumber(subRegion) ? '' : suffix}）`)
          }
          if (!logOnlyConversionWithSuffix || suffix) {
            console.log(`Successfully did the smart conversion of postal code ${postalCode}. From ${str} to`)
            for (const fullSubRegion of fullSubRegions)
              console.log(fullSubRegion)
          }
          newRegions.push(...fullSubRegions)
        }
        const throwError = () => {
          console.log(`Regions of ${postalCode}`)
          for (const region of regions) console.log(region)
          throw new Error(`Suspected region found with postal code ${postalCode}, but not able to support conversion`)
        }
        let acc = ''
        for (const region of regions) {
          if (region.includes('（') && region.includes('）')) {
            if (acc) throwError()
            if (region.includes('、')) {
              if (countMatches(region, '）') !== 1 || countMatches(region, '（') !== 1) throwError()
              if (!region.length || region[region.length - 1] !== '）') throwError()
              smartSubRegions(region)
            }
            else newRegions.push(region)
            continue
          }
          if (region.includes('（')) {
            if (acc || countMatches(region, '（') !== 1) throwError()
            acc = region
            continue
          }
          if (region.includes('）')) {
            if (countMatches(region, '）') !== 1) throwError()
            if (!region.length || region[region.length - 1] !== '）') throwError()
            acc += region
            //separate here
            smartSubRegions(acc)
            acc = ''
            continue
          }
          if (acc) {
            acc += region
            continue
          }
          if (acc.includes('、')) throwError()
          newRegions.push(acc)
        }
        if (acc) throwError()
        regions.splice(0, regions.length, ...newRegions)
      }
    }
    console.log(`Postal code ${maxRegionPostal} is associated with ${maxRegionCount} regions`)
    console.log(`Postal code ${maxPrefecturePostal} is associated with ${maxPrefectureCount} prefectures`)
    const postalCodeCount = Object.keys(postalData).length
    console.log(`${csvData.length} records have been proceed to obtain ${postalCodeCount} postal codes`)
    writeFile(STANDARD_OUTPUT_FILENAME, postalData)
		//remove support to other data
    // writeFile(EXTENDED_OUTPUT_FILENAME, extendedPostalData)
    // writeFile(KANA_OUTPUT_FILENAME, kana)
    // writeFile(KANA_EXTENDED_OUTPUT_FILENAME, kanaExtended)
  })
})
