"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  getText: true,
  SHLViewer: true
};
exports.getText = exports.SHLViewer = void 0;
var _react = _interopRequireDefault(require("react"));
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
var _errors = require("./errors");
var _PasscodeRequestView = _interopRequireDefault(require("./views/PasscodeRequestView"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// type Manifest = {
//   url: string 
//   key: string
//   exp?: string
//   flag?: string
//   v?: string
// }

let getText;
exports.getText = getText;
class SHLViewer {
  constructor(option) {
    _defineProperty(this, "shlLoader", void 0);
    this.shlLoader = new _shlLoader.default();
    exports.getText = getText = option.getTranslationFunction();
  }
  canSupport(payloads) {
    if (payloads.length > 0 && payloads[0].indexOf(this.shlLoader.protocol) >= 0) {
      return Promise.resolve(this);
    }
    return Promise.reject(null);
  }
  async requestPassCode(setCustomViews) {
    return new Promise((resolve, reject) => {
      const onEntered = number => {
        setCustomViews([]);
        resolve(number);
      };
      const onCancel = () => {
        setCustomViews([]);
        reject(null);
      };
      const view = /*#__PURE__*/_react.default.createElement(_PasscodeRequestView.default, {
        key: 1,
        onEntered: onEntered,
        onCancel: onCancel
      });
      console.info("#YF Requesting with" + JSON.stringify([view]));
      setCustomViews([view]);
    });
  }
  async validate(payloads, setCustomViews) {
    let bundle = null;
    try {
      bundle = await this.shlLoader.validateSHL(payloads[0], null);
    } catch (error) {
      console.info(`error 1 ${error}`);
      if (error instanceof _errors.SHLError) {
        console.info(`error ${error}`);
        if (error.isError(_errors.ErrorCode.SHL_PASSCODE_NEEDED)) {
          /* #TODO Make it repeatable */
          const passCode = await this.requestPassCode(setCustomViews);
          if (passCode) {
            bundle = await this.shlLoader.validateSHL(payloads[0], passCode);
          }
        }
      }
    }
    /* #TODO find out where to get this */
    const fillerData = {
      isValid: true,
      errorCode: 0,
      issuedDate: new Date().getTime(),
      issuerData: {
        iss: "NA",
        logo_uri: "NA",
        name: "NA",
        updated_at: new Date().getTime(),
        url: "NA"
      },
      recordType: "IPS",
      patientData: {
        dateOfBirth: "00/00/00",
        names: ["test"]
      }
    };
    return Promise.resolve(bundle ? {
      ...fillerData,
      bundle
    } : null);
  }
}
exports.SHLViewer = SHLViewer;
//# sourceMappingURL=index.js.map