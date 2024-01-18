"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SHLPassCodeNotCorrectError = exports.SHLError = exports.ErrorCode = void 0;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const ErrorCode = {
  JWS_RETRIEVAL_ERROR: "JWS_RETRIEVAL_ERROR",
  SHL_DECODE_FAILED: "SHL_DECODE_FAILED",
  SHL_EXPIRED: "SHL_EXPIRED",
  SHL_PASSCODE_NEEDED: "SHL_PASSCODE_NEEDED",
  SHL_PASSCODE_NOTCORRECT: "SHL_PASSCODE_NOTCORRECT",
  SHL_MANIFEST_RETRIEVAL_ERROR: "SHL_MANIFEST_RETRIEVAL_ERROR",
  SHL_JWS_RETRIEVAL_ERROR: "SHL_JWS_RETRIEVAL_ERROR"
};
exports.ErrorCode = ErrorCode;
class SHLError extends Error {
  constructor(error) {
    super(error);
    _defineProperty(this, "code", void 0);
    this.code = error;
  }
  isError(error) {
    return this.code === error;
  }
}
exports.SHLError = SHLError;
class SHLPassCodeNotCorrectError extends SHLError {
  constructor(error, attempt) {
    super(error);
    _defineProperty(this, "attempt", void 0);
    this.attempt = attempt;
  }
}
exports.SHLPassCodeNotCorrectError = SHLPassCodeNotCorrectError;
//# sourceMappingURL=errors.js.map