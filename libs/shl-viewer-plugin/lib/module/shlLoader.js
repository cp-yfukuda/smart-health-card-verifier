function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
import { fetchWithTimeout } from './utils/utils';
import { ErrorCode, SHLError } from './errors';
import SMARTDataLoader from './SMARTDataLoader';
const JWSTimeout = 5000;
const SHL_RECIPIENT = 'SMART Health Card Verifier';
const INFER_CONTENTTYPE = '___INFER___';
const FLAG_PASSWORD_NEEDED = "P";
const FLAG_ONEDATA = "U";
export default class SHLLoader {
  constructor() {
    _defineProperty(this, "protocol", "shlink:/");
    _defineProperty(this, "parserRegEx", RegExp(`.*((${this.protocol})(.+))$`));
    _defineProperty(this, "shl", null);
    _defineProperty(this, "shlData", null);
  }
  async validateSHL(shl) {
    let passCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const shlResult = this.getIPSURL(shl);
    if (shlResult) {
      this.shl = shlResult;
      this.shlData = this.decodePayload(this.shl.payload);
      if (this.isExpired()) {
        throw new SHLError(ErrorCode.SHL_EXPIRED);
      }
      if (this.needsPasscode() && passCode == null) {
        console.info("throwing error");
        throw new SHLError(ErrorCode.SHL_PASSCODE_NEEDED);
      }
      const manifestFileInfo = await this.getSHLManifestFileInfo(passCode);
      const bundle = await this.fetchFHIRBundle(manifestFileInfo);
      return Promise.resolve(bundle);
    } else {
      throw new SHLError(ErrorCode.JWS_RETRIEVAL_ERROR);
    }
  }
  getSingleManifestFileInfo() {
    const url = this.shlData.url;
    const location = url + (url.indexOf("?") === -1 ? "?" : "&") + "recipient=" + encodeURIComponent(SHL_RECIPIENT);
    const manifest = {
      files: [{
        "contentType": INFER_CONTENTTYPE,
        "location": location
      }]
    };
    return manifest;
  }
  async getSHLManifestFileInfo(passcode) {
    if (this.onlyOneData()) {
      return this.getSingleManifestFileInfo();
    }
    const body = {
      recipient: SHL_RECIPIENT
    };
    if (passcode) body.passcode = passcode;
    try {
      const response = await fetchWithTimeout(this.shlData.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }, JWSTimeout, "Fetch Manifest error");
      let responseBody;
      try {
        responseBody = await response.json();
      } catch (error) {
        // If JSON parsing fails, log the error and throw a generic error
        console.error(`error:${error}`);
        throw new Error('There was an error processing the passcode.');
      }
      if (response.status === 404) {
        throw new Error("The SHL is no longer active.");
      }
      if (response.status !== 200) {
        if (responseBody.remainingAttempts) {
          console.error(`response attempt ${responseBody.remainingAttempts}`);
        }
        throw new Error(`Manifest: ${response.status}`);
      }
      return Promise.resolve(responseBody);
    } catch (error) {
      console.error(`Error Retrieving manifest ${error}`);
      throw new SHLError(ErrorCode.SHL_MANIFEST_RETRIEVAL_ERROR);
    }
  }
  async fetchFHIRBundle(manifestFileInfo) {
    let dataLoader = await SMARTDataLoader.init(this.shlData.key, manifestFileInfo);
    let bundle = await dataLoader.load();
    return bundle;
  }
  flagContains(flag) {
    return this.shlData !== null && this.shlData.flag !== null && this.shlData.flag.toUpperCase().indexOf(flag.toUpperCase()) >= 0;
  }
  needsPasscode() {
    return this.flagContains(FLAG_PASSWORD_NEEDED);
  }
  onlyOneData() {
    return this.flagContains(FLAG_ONEDATA);
  }
  isExpired() {
    if (this.shlData === null || this.shlData.exp === null) {
      return false;
    }
    const expires = new Date(Number(this.shlData.exp) * 1000).getTime();
    const now = new Date().getTime();
    return expires < now;
  }
  getIPSURL(shlURL) {
    const match = shlURL.match(this.parserRegEx);
    if (match) {
      return {
        original: shlURL,
        shl: match[1],
        payload: match[3]
      };
    }
    return null;
  }
  decodePayload(payload) {
    const decodedBuffer = Buffer.from(payload, 'base64');
    const data = JSON.parse(decodedBuffer.toString('utf-8'));
    try {
      const defaultData = {
        url: null,
        key: null,
        exp: null,
        v: null,
        label: null,
        flag: null
      };
      return {
        ...defaultData,
        ...data
      };
    } catch (e) {
      console.error(e);
      throw new Error(ErrorCode.SHL_DECODE_FAILED);
    }
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
//# sourceMappingURL=shlLoader.js.map