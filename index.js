"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var postalRaw = _fs["default"].readFileSync(_path["default"].resolve(__dirname, 'postal.json'), 'utf8');
var _default = JSON.parse(postalRaw); // const postalExtendedRaw = fs.readFileSync(path.resolve(__dirname, 'postal-extended.json'), 'utf8')
// export const extendedPostalData = JSON.parse(postalExtendedRaw)
// const kanaRaw = fs.readFileSync(path.resolve(__dirname, 'kana.json'), 'utf8')
// export const kana = JSON.parse(kanaRaw)
// const kanaExtendedRaw = fs.readFileSync(path.resolve(__dirname, 'kana-extended.json'), 'utf8')
// export const kanaExtended = JSON.parse(kanaExtendedRaw)
exports["default"] = _default;
