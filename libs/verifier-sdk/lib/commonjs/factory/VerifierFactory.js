"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VerifierFactory = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class VerifierFactory {
  static register(key, VerifierCls) {
    if (this.Verifiers[key]) {
      const option = {};
      this.Verifiers[key] = new VerifierCls(option);
    }
  }

}

exports.VerifierFactory = VerifierFactory;

_defineProperty(VerifierFactory, "Verifiers", void 0);
//# sourceMappingURL=VerifierFactory.js.map