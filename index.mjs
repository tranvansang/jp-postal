import path from 'node:path'
import fs from 'node:fs'

const postalRaw = fs.readFileSync(path.resolve(__dirname, 'postal.json'), 'utf8')
export default JSON.parse(postalRaw)

// const postalExtendedRaw = fs.readFileSync(path.resolve(__dirname, 'postal-extended.json'), 'utf8')
// export const extendedPostalData = JSON.parse(postalExtendedRaw)

// const kanaRaw = fs.readFileSync(path.resolve(__dirname, 'kana.json'), 'utf8')
// export const kana = JSON.parse(kanaRaw)

// const kanaExtendedRaw = fs.readFileSync(path.resolve(__dirname, 'kana-extended.json'), 'utf8')
// export const kanaExtended = JSON.parse(kanaExtendedRaw)
