"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class SHLLoader {
  constructor() {
    _defineProperty(this, "protocol", "shlink:/");
    _defineProperty(this, "parserRegEx", RegExp(`.*((${this.protocol})(.+))$`));
  }
  getIPSURL(shlURL) {
    const match = shlURL.match(this.parserRegEx);
    if (match) {
      return match[1];
    }
    return null;
  }
  async loadSHLContent(payloads) {
    console.info("payloads = " + payloads);
    const url = "https://ips.tcpdev.org/view/c4ec43ddab0c4c3eafd7e36ffc8e7e1e";
    const data = {
      passcode: "123456"
    };
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(res => res.json()).then(res => console.info(`JSON Viewer = ${JSON.stringify(res)}`));
    return res;
  }
}
exports.default = SHLLoader;
//# sourceMappingURL=shlLoader.js.map