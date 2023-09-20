"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeysStore = void 0;
var _nodeJose = require("node-jose");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class KeysStore {}
exports.KeysStore = KeysStore;
_defineProperty(KeysStore, "store", _nodeJose.JWK.createKeyStore());
_defineProperty(KeysStore, "resetStore", () => {
  KeysStore.store = _nodeJose.JWK.createKeyStore();
});
//# sourceMappingURL=keys.js.map