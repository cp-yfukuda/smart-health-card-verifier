import { validate as qrValidate } from './qr';
import { setVerifierInitOption } from "./models/Config";
export * from './types';
export class SHCVerifier {
  constructor(options) {
    setVerifierInitOption(options.shc);
    console.info("SHCVerifier: initialized");
  }
  canSupport(payloads) {
    if (payloads.length > 0 && payloads[0].length > 4 && payloads[0].startsWith("shc:/")) {
      return Promise.resolve(this);
    }
    return Promise.reject(null);
  }
  async validate(payloads) {
    console.info("#YF index validate 1");
    let res1 = await qrValidate(payloads);
    console.info("#YF index validate res = " + JSON.stringify(res1));
    return res1;
  }
}
//# sourceMappingURL=index.js.map