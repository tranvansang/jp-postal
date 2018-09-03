"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postalGeo = exports.extendedPostalData = exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var postalRaw = _fs.default.readFileSync(_path.default.resolve(__dirname, 'postal.json'), 'utf8');

var _default = JSON.parse(postalRaw);

exports.default = _default;

var postalExtendedRaw = _fs.default.readFileSync(_path.default.resolve(__dirname, 'postal-extended.json'), 'utf8');

var extendedPostalData = JSON.parse(postalExtendedRaw);
exports.extendedPostalData = extendedPostalData;

var geoFilePath = _path.default.resolve(__dirname, 'geo.json');

var postalGeo = {};
exports.postalGeo = postalGeo;

if (_fs.default.existsSync(geoFilePath)) {
  var geoRaw = _fs.default.readFileSync(geoFilePath, 'utf8');

  var _arr = Object.entries(JSON.parse(geoRaw));

  for (var _i = 0; _i < _arr.length; _i++) {
    var _arr$_i = _slicedToArray(_arr[_i], 2),
        key = _arr$_i[0],
        val = _arr$_i[1];

    postalGeo[key] = val;
  }
}
