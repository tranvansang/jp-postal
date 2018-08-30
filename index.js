import path from 'path';
import fs from 'fs';

const postalRaw = fs.readFileSync(path.resolve(__dirname, 'postal.json'), 'utf8');
export default JSON.parse(postalRaw);

const postalExtendedRaw = fs.readFileSync(path.resolve(__dirname, 'postal-extended.json'), 'utf8');
export const extendedPostalData = JSON.parse(postalExtendedRaw);

export const geoFilePath = path.resolve(__dirname, 'geo.json');
if (fs.existsSync(geoFilePath)) {
  const geoRaw = fs.readFileSync(geoFilePath, 'utf8');
  module.exports.postalGeo = JSON.parse(geoRaw);
} else {
  module.exports.postalGeo = {};
}
