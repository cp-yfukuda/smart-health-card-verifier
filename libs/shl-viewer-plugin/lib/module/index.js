function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
import React from 'react';
import SHLLoader from './shlLoader';
export * from './types';
import { SHLError, ErrorCode } from './errors';
import PasscodeRequestView from './views/PasscodeRequestView';

// type Manifest = {
//   url: string 
//   key: string
//   exp?: string
//   flag?: string
//   v?: string
// }

export let getText;
export class SHLViewer {
  constructor(option) {
    _defineProperty(this, "shlLoader", void 0);
    this.shlLoader = new SHLLoader();
    getText = option.getTranslationFunction();
  }
  canSupport(payloads) {
    console.info("#YF ----- SHL--------");
    if (payloads.length > 0 && payloads[0].indexOf(this.shlLoader.protocol) >= 0) {
      return Promise.resolve(this);
    }
    return Promise.reject(null);
  }
  async requestPassCode(setCustomViews) {
    console.info("Requesting passcode");
    return new Promise((resolve, reject) => {
      const onEntered = number => {
        setCustomViews([]);
        resolve(number);
      };
      const onCancel = () => {
        setCustomViews([]);
        reject(null);
      };
      const view = /*#__PURE__*/React.createElement(PasscodeRequestView, {
        key: 1,
        onEntered: onEntered,
        onCancel: onCancel
      });
      setCustomViews([view]);
    });
  }
  async validate(payloads, setCustomViews) {
    console.info("#YF ------------Validating.... ");
    let bundle = null;
    try {
      bundle = await this.shlLoader.validateSHL(payloads[0], null);
    } catch (error) {
      console.info(`error 1 ${error}`);
      if (error instanceof SHLError) {
        console.info(`error ${error}`);
        if (error.isError(ErrorCode.SHL_PASSCODE_NEEDED)) {
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
//# sourceMappingURL=index.js.map