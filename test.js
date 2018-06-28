var assert = require('assert')
const postal = require('./postal.json')

const testPostal = [
  ['1130021', {"東京都":["文京区本駒込"]}],
  ['0040000', {"北海道":["札幌市厚別区","札幌市清田区"]}],
  ['4980000', {"愛知県":["弥富市"],"三重県":["桑名郡木曽岬町"]}]
]
describe('Postal data', () =>
  testPostal.forEach(([postalCode, postalData]) =>
    describe(`Test postal code ${postalCode}`, () =>
      it('should return correct postal data', () =>
        assert.deepStrictEqual(postal[postalCode], postalData)
      )
    )
  )
)