function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { getJWS } from 'jws-utils';
import SHLLoader from './shlLoader';
export * from './types';
export class SHLViewer {
  constructor() {
    _defineProperty(this, "shlLoader", void 0);
    this.shlLoader = new SHLLoader();
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
        let jws = await getJWS(this.shlLoader.protocol, [shlURL]);
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
//# sourceMappingURL=index.js.map