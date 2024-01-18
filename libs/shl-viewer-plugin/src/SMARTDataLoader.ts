import type { FHIRBundleType } from 'parser-sdk'
//import { KeysStore } from 'jws-utils'
import type { ManifestItemType,  ManifestType } from './types'
import jose from 'node-jose'
import { fetchWithTimeout } from './utils/utils'
import { ErrorCode, SHLError} from './errors'

enum ManifestContentTypeEnum {
    SHC_CONTENTTYPE = 'application/smart-health-card',
    FHIR_CONTENTTYPE = 'application/fhir+json',
    INFER_CONTENTTYPE = '___INFER___'
};

const requestedOrigin = 'https://example.org'; // request bogus origin to test CORS response
const JWS_FETCH_TIMEOUT = 5000;
class SMARTDataLoader {
    key: string
    verifiableCredentials: any[] = [];
    rawBundles: FHIRBundleType[]
    manifestFileInfo: ManifestType
    constructor( key: string, manifestFileInfo: ManifestType ) {
        this.key = key;
        this.rawBundles = [];
        this.manifestFileInfo = manifestFileInfo;
    }

    async load(): Promise<FHIRBundleType[]>{


        try {

          const shlFiles = this.manifestFileInfo.files;

          const keyBuffer = jose.util.base64url.decode(this.key);
          console.info("#YF keyBuffer = " + keyBuffer )
          for (const i in shlFiles) {

            const contentType = shlFiles[i].contentType;

            if( ! this.isKnownContent( contentType ) ) {
                continue;
            }
            const shlEncrypted = await this.fetchSHLContent(shlFiles[i]);
            // KeysStore.resetStore();

            const keyStore = { keys: [{
                kty: 'oct',
                use: 'enc',
                alg: 'A256GCM',
                k: keyBuffer
            }] };

            const ks = await jose.JWK.asKeyStore(keyStore)
            const decrypter = await jose.JWE.createDecrypt(ks);
            const decrypted =  await decrypter.decrypt(shlEncrypted)

            // const decrypted = await jose.JWE.createDecrypt(keyBuffer)
            //                             .decrypt(shlEncrypted);
            // var decrypter = jose.JWE.createDecrypt(this.key);
            // const decrypted =  decrypter.decrypt(shlEncrypted)
            const shlJson = JSON.parse(decrypted.payload.toString("utf8"),);
            console.info("#YF data =======")
            console.info(shlJson)
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

        } catch ( e ) {
            console.error(`#YF Error decrypting ${e}`)

        }
        return this.rawBundles

    }

    pushSHC( data ) {
        this.verifiableCredentials.push( data )
    }

    pushRawBundle( fhir ) {
  
      if (fhir.resourceType === "Bundle") {
        // already a bundle
        this.rawBundles.push(fhir);
      }
      else {
        // put it into a bundle
        this.rawBundles.push({
          "resourceType": "Bundle",
          "type": "collection",
          "entry": [ {
            "fullUrl": "resource:0",
            "resource": fhir
          } ]
        });
      }
    }

    async fetchJWS( shlURL: string): Promise<Response>{
        const responseRaw = await fetchWithTimeout(shlURL, {
        headers: {
            Origin: requestedOrigin
          }
        }, JWS_FETCH_TIMEOUT, "ERROR Fetching JWS").catch(_ => {
          throw new SHLError(ErrorCode.SHL_JWS_RETRIEVAL_ERROR);
        });
        return responseRaw;
    }

    async fetchSHLContent( file: ManifestItemType ) {
      if (file.embedded) return Promise.resolve(file.embedded);
      const response = await this.fetchJWS(file.location!);
      return(response.text());
    }

    isKnownContent( contentType: string  ) {
        if (contentType === ManifestContentTypeEnum.SHC_CONTENTTYPE ||
            contentType === ManifestContentTypeEnum.FHIR_CONTENTTYPE ||
            contentType === ManifestContentTypeEnum.INFER_CONTENTTYPE) {
          return true;
        }
        return false;
    }

    static init( key: string, manifestFileInfo: ManifestType  ) {
        return new SMARTDataLoader( key, manifestFileInfo )

    }
}

export default SMARTDataLoader;