# Japanese postal data from official database

There are instructions to download, rebuild and obtain the latest data from official source

Latest database update: November 2, 2022

更新日：2022年11月2日

## Data source and explanation

- General page: [http://www.post.japanpost.jp/zipcode/download.html](http://www.post.japanpost.jp/zipcode/download.html)
- Download page: [http://www.post.japanpost.jp/zipcode/dl/kogaki-zip.html](http://www.post.japanpost.jp/zipcode/dl/kogaki-zip.html)
- Explanation: [http://www.post.japanpost.jp/zipcode/dl/readme.html](http://www.post.japanpost.jp/zipcode/dl/readme.html)

## Usage

- Directly download and use `postal.json`
- Or install module `jp-postal` via `npm install --save jp-postal` or `yarn add jp-postal`
- Default export (`postal.json`) maps 7 digits postal code (string format) into a map whose key is prefecture name and value is array of regions under the prefecture
- Some regions have same postal code. For example: postal code `4520961` is associated with 66 regions, 2 regions in different prefectures have same postal code `4980000` (July 1, 2020)
- Usage example:

```javascript
const postal = require('jp-postal')
console.log(JSON.stringify(postal['1130021']))
console.log(JSON.stringify(postal['0040000']))
console.log(JSON.stringify(postal['4980000']))
```
Output
```
{"東京都":["文京区本駒込"]}
{"北海道":["札幌市厚別区","札幌市清田区"]}
{"愛知県":["弥富市"],"三重県":["桑名郡木曽岬町"]}
```

## How to rebuild

To rebuild to obtain the latest database

```bash
yarn
yarn rebuild
```
or
```bash
npm install
npm run rebuild
```

See `package.json` for the detailed commands

## Test

```bash
yarn test
```
