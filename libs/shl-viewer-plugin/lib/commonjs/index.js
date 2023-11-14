"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  SHLViewer: true
};
exports.SHLViewer = void 0;
var _jwsUtils = require("jws-utils");
var _shlLoader = _interopRequireDefault(require("./shlLoader"));
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class SHLViewer {
  constructor() {
    _defineProperty(this, "shlLoader", void 0);
    this.shlLoader = new _shlLoader.default();
  }
  canSupport(payloads) {
    if (payloads.length > 0 && payloads[0].indexOf(this.shlLoader.protocol) >= 0) {
      return Promise.resolve(this);
    }
    return Promise.reject(null);
  }
  async validate(payloads) {
    try {
      let shlURL = this.shlLoader.getIPSURL(payloads[0]);
      if (shlURL) {
        let jws = await (0, _jwsUtils.getJWS)(this.shlLoader.protocol, [shlURL]);
        Promise.resolve({
          jws
        });
      }
    } catch (e) {
      console.info(e);
    }
    // let ipsContent  = await this.shlLoader.loadSHLContent(payloads);
    // return await getRecord( ipsContent );
    return Promise.reject(null);
  }
}
exports.SHLViewer = SHLViewer;
//# sourceMappingURL=index.js.map