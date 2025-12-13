import fs from 'node:fs'
import path from 'node:path'

fs.writeFileSync(path.resolve(import.meta.dirname, 'postal.json'), JSON.stringify(
	fs.readFileSync(path.resolve(import.meta.dirname, 'KEN_ALL-utf8.CSV'), 'utf8')
		.split('\n')
		.filter(Boolean)
		.map(line => line.trim().split(',').map(field => field.replace(/^"|"$/g, '')))
		.map(({
						2: postalCode,
						3: prefectureKana,
						4: regionKana,
						5: subregionKana,
						6: prefecture,
						7: region,
						8: subregion,
					}) => ({
			postalCode,
			prefectureKana,
			regionKana,
			subregionKana: subregionKana.toLowerCase() === 'ｲｶﾆｹｲｻｲｶﾞﾅｲﾊﾞｱｲ' ? '' : subregionKana.replace('ﾉﾂｷﾞﾆﾊﾞﾝﾁｶﾞｸﾙﾊﾞｱｲ', ''),
			prefecture,
			region,
			subregion: subregion === '以下に掲載がない場合' ? '' : subregion.replace('の次に番地がくる場合', ''),
		}))
		.reduce(
			(byPostalCode, {postalCode, prefecture, prefectureKana, region, regionKana, subregion, subregionKana}) => {
				if (!/^[0-9]{7}$/.test(postalCode)) throw new Error(`Postal code ${postalCode} has an invalid format`)
				void (byPostalCode[postalCode] ??= []).push([
					prefecture, region, subregion, prefectureKana, regionKana, subregionKana
				])
				return byPostalCode
			},
			{}
		)
	, null, 2))
