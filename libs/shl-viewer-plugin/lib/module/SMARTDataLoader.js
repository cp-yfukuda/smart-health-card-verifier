function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
//import { KeysStore } from 'jws-utils'

import jose from 'node-jose';
import { fetchWithTimeout } from './utils/utils';
import { ErrorCode, SHLError } from './errors';
var ManifestContentTypeEnum = /*#__PURE__*/function (ManifestContentTypeEnum) {
  ManifestContentTypeEnum["SHC_CONTENTTYPE"] = "application/smart-health-card";
  ManifestContentTypeEnum["FHIR_CONTENTTYPE"] = "application/fhir+json";
  ManifestContentTypeEnum["INFER_CONTENTTYPE"] = "___INFER___";
  return ManifestContentTypeEnum;
}(ManifestContentTypeEnum || {});
;
const requestedOrigin = 'https://example.org'; // request bogus origin to test CORS response
const JWS_FETCH_TIMEOUT = 5000;
class SMARTDataLoader {
  constructor(key, manifestFileInfo) {
    _defineProperty(this, "key", void 0);
    _defineProperty(this, "verifiableCredentials", []);
    _defineProperty(this, "rawBundles", void 0);
    _defineProperty(this, "manifestFileInfo", void 0);
    this.key = key;
    this.rawBundles = [];
    this.manifestFileInfo = manifestFileInfo;
  }
  async load() {
    try {
      const shlFiles = this.manifestFileInfo.files;
      const keyBuffer = jose.util.base64url.decode(this.key);
      console.info("#YF keyBuffer = " + keyBuffer);
      for (const i in shlFiles) {
        const contentType = shlFiles[i].contentType;
        if (!this.isKnownContent(contentType)) {
          continue;
        }
        const shlEncrypted = await this.fetchSHLContent(shlFiles[i]);
        // KeysStore.resetStore();

        const keyStore = {
          keys: [{
            kty: 'oct',
            use: 'enc',
            alg: 'A256GCM',
            k: keyBuffer
          }]
        };
        const ks = await jose.JWK.asKeyStore(keyStore);
        const decrypter = await jose.JWE.createDecrypt(ks);
        const decrypted = await decrypter.decrypt(shlEncrypted);

        // const decrypted = await jose.JWE.createDecrypt(keyBuffer)
        //                             .decrypt(shlEncrypted);
        // var decrypter = jose.JWE.createDecrypt(this.key);
        // const decrypted =  decrypter.decrypt(shlEncrypted)
        const shlJson = JSON.parse(decrypted.payload.toString("utf8"));
        console.info("#YF data =======");
        console.info(shlJson);
        //    #TODO support SHL in case of SHC
        if (shlJson.verifiableCredential) {
          // looks like an shc to me
          for (const j in shlJson.verifiableCredential) {
            this.pushSHC(shlJson.verifiableCredential[j]);
          }
        } else if (shlJson.resourceType) {
          this.pushRawBundle(shlJson);
        }
      }
    } catch (e) {
      console.error(`#YF Error decrypting ${e}`);
    }
    return this.rawBundles;
  }
  pushSHC(data) {
    this.verifiableCredentials.push(data);
  }
  pushRawBundle(fhir) {
    if (fhir.resourceType === "Bundle") {
      // already a bundle
      this.rawBundles.push(fhir);
    } else {
      // put it into a bundle
      this.rawBundles.push({
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [{
          "fullUrl": "resource:0",
          "resource": fhir
        }]
      });
    }
  }
  async fetchJWS(shlURL) {
    const responseRaw = await fetchWithTimeout(shlURL, {
      headers: {
        Origin: requestedOrigin
      }
    }, JWS_FETCH_TIMEOUT, "ERROR Fetching JWS").catch(_ => {
      throw new SHLError(ErrorCode.SHL_JWS_RETRIEVAL_ERROR);
    });
    return responseRaw;
  }
  async fetchSHLContent(file) {
    if (file.embedded) return Promise.resolve(file.embedded);
    const response = await this.fetchJWS(file.location);
    return response.text();
  }
  isKnownContent(contentType) {
    if (contentType === ManifestContentTypeEnum.SHC_CONTENTTYPE || contentType === ManifestContentTypeEnum.FHIR_CONTENTTYPE || contentType === ManifestContentTypeEnum.INFER_CONTENTTYPE) {
      return true;
    }
    return false;
  }
  static init(key, manifestFileInfo) {
    return new SMARTDataLoader(key, manifestFileInfo);
  }
}
export default SMARTDataLoader;
//# sourceMappingURL=SMARTDataLoader.js.map