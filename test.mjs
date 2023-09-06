import assert from 'node:assert'
import postal from './index.mjs'
import test from 'node:test'

const testPostal = [
	['1130021', {'東京都': ['文京区本駒込']}],
	['0040000', {'北海道': ['札幌市厚別区', '札幌市清田区']}],
	['4980000', {'愛知県': ['弥富市'], '三重県': ['桑名郡木曽岬町']}]
]

test('Postal data should return correct postal data', () => {
		for (const [postalCode, postalData] of testPostal)
			assert.deepStrictEqual(postal[postalCode], postalData)
	}
)
