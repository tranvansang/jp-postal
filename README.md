# Japanese postal data from official database

There are instructions to download, rebuild and obtain the latest data from official source

Latest database update: December 12, 2025

更新日：2025年12月13日

## Data source and explanation

- General page: [http://www.post.japanpost.jp/zipcode/download.html](http://www.post.japanpost.jp/zipcode/download.html)
- Download page: [http://www.post.japanpost.jp/zipcode/dl/kogaki-zip.html](http://www.post.japanpost.jp/zipcode/dl/kogaki-zip.html)
- Explanation: [http://www.post.japanpost.jp/zipcode/dl/readme.html](http://www.post.japanpost.jp/zipcode/dl/readme.html)

## Usage

```bash
npm i jp-postal
```

```javascript
import postal from 'jp-postal'


console.log(postal['1130021'])
// [ [ '東京都', '文京区', '本駒込', 'ﾄｳｷｮｳﾄ', 'ﾌﾞﾝｷｮｳｸ', 'ﾎﾝｺﾏｺﾞﾒ' ] ]

console.log(postal['0040000'])
// [
// [ '北海道', '札幌市厚別区', '', 'ﾎｯｶｲﾄﾞｳ', 'ｻｯﾎﾟﾛｼｱﾂﾍﾞﾂｸ', '' ],
// 	[ '北海道', '札幌市清田区', '', 'ﾎｯｶｲﾄﾞｳ', 'ｻｯﾎﾟﾛｼｷﾖﾀｸ', '' ]
// ]

console.log(postal['4980000'])
// [
// [ '愛知県', '弥富市', '', 'ｱｲﾁｹﾝ', 'ﾔﾄﾐｼ', '' ],
// 	[ '三重県', '桑名郡木曽岬町', '', 'ﾐｴｹﾝ', 'ｸﾜﾅｸﾞﾝｷｿｻｷﾁｮｳ', '' ]
// ]
```

- Default export maps 7 digits postal code (string format) into an array whose elements are array of \[prefecture, region, subregion, prefecture kana, region kana, subregion kana\]

## How to rebuild

To rebuild to obtain the latest database

```bash
npm i
npm run rebuild
```

## Test

```bash
npm run test
```
