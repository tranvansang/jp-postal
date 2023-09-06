import assert from 'assert'

const postal = require('./index').default
const extendedPostalData = require('./index').extendedPostalData
const kana = require('./index').kana
const kanaExtended = require('./index').kanaExtended

const testPostal = [
  ['1130021', {"東京都":["文京区本駒込"]}],
  ['0040000', {"北海道":["札幌市厚別区","札幌市清田区"]}],
  ['4980000', {"愛知県":["弥富市"],"三重県":["桑名郡木曽岬町"]}]
]

const testExtendedPostal = [
  ['1130021', {"東京都":
    { "文京区": ["本駒込"] }
  }],
  ['0040000', {
    "北海道": {
     '札幌市厚別区': [],
     '札幌市清田区': []
    }
  }],
  ['4980000', {
    "愛知県":{
      "弥富市": []
    },
    "三重県":{
      "桑名郡木曽岬町": []
    }
  }]
]
describe('Postal data', () =>
  it('should return correct postal data', () =>
    testPostal.forEach(([postalCode, postalData]) =>
      assert.deepStrictEqual(postal[postalCode], postalData)
    )
  )
)

xdescribe('Extended postal data', () =>
  it('should return correct extended postal data', () =>
    testExtendedPostal.forEach(([postalCode, postalData]) =>
      assert.deepStrictEqual(extendedPostalData[postalCode], postalData)
    )
  )
)

xdescribe('kana', () => {
  it('should test kana', () => {
    [
      ['東京都', 'Toukyouto'],
      ['札幌市中央区双子山', 'Sapporoshichuuouku Futagoyama'],
      ['札幌市中央区大通西（２０〜２８丁目）', 'Sapporoshichuuouku Oodoorinishi(20-28choume)']
    ].forEach(([kanji, romaji]) => assert.deepStrictEqual(romaji, kana[kanji]))
    ;[
      ['東京都', 'Toukyouto'],
      ['札幌市中央区', 'Sapporoshichuuouku'],
      ['双子山', 'Futagoyama'],
      ['北一条西（１〜１９丁目）', 'Kita1jounishi(1-19choume)']
    ].forEach(([kanji, romaji]) => assert.deepStrictEqual(romaji, kanaExtended[kanji]))
  })
})
