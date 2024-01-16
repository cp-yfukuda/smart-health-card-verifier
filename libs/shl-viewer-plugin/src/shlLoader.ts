import type { FHIRBundleType } from 'parser-sdk'
import { fetchWithTimeout } from './utils/utils'
import { ErrorCode, SHLError} from './errors'
import SMARTDataLoader from './SMARTDataLoader'
import type { ManifestType } from './types'

type SHLData = {
    url: string,
    key: string,
    exp: number | null,
    label: string | null,
    v: number | null
    flag: string | null
}

const JWSTimeout = 5000;

const SHL_RECIPIENT = 'SMART Health Card Verifier';
const INFER_CONTENTTYPE = '___INFER___';

const FLAG_PASSWORD_NEEDED="P"
const FLAG_ONEDATA="U"

type SHLParserResult = {
    original: string
    shl: string
    payload: string,
};

export default class SHLLoader {
    protocol: string = "shlink:/"
    parserRegEx: RegExp = RegExp(`.*((${this.protocol})(.+))$`)
    shl: SHLParserResult | null = null;
    shlData:SHLData|null = null;
    constructor(){
    }

    async validateSHL( shl: string, passCode: string | null = null ) : Promise<FHIRBundleType[]>{
      const shlResult = this.getIPSURL( shl );
      if( shlResult ) {
        this.shl = shlResult;
        this.shlData = this.decodePayload( this.shl.payload );
        if( this.isExpired() ) {
            throw new SHLError( ErrorCode.SHL_EXPIRED )
        }
        if( this.needsPasscode() && passCode == null ) {
            console.info("throwing error")
            throw new SHLError( ErrorCode.SHL_PASSCODE_NEEDED )
        }
        const manifestFileInfo = await this.getSHLManifestFileInfo( passCode )
        const bundle = await this.fetchFHIRBundle( manifestFileInfo )
        return Promise.resolve(bundle);
      } else {
        throw new SHLError( ErrorCode.JWS_RETRIEVAL_ERROR )
      }
    }


    getSingleManifestFileInfo(): ManifestType {
      const url = this.shlData!.url as string
      const location = url +
            (url.indexOf("?") === -1 ? "?" : "&") +
            "recipient=" +
            encodeURIComponent(SHL_RECIPIENT);

      const manifest = { files: [ {
        "contentType": INFER_CONTENTTYPE,
        "location": location
      } ] };

      return manifest;

    }

    async getSHLManifestFileInfo( passcode: string | null): Promise<ManifestType> {
        if (this.onlyOneData() ) {
            return this.getSingleManifestFileInfo() ;
        }
        const body = { recipient: SHL_RECIPIENT } as any;
        if ( passcode ) body.passcode = passcode;
        try {
            const response = await fetchWithTimeout(
                this.shlData!.url as string, 
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(body)
                }, JWSTimeout, "Fetch Manifest error" );
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
                if( responseBody.remainingAttempts ){
                    console.error(`response attempt ${responseBody.remainingAttempts}`);
                }

                throw new Error(`Manifest: ${response.status}`);
            }
            return Promise.resolve( responseBody );
        }catch( error ){
            console.error( `Error Retrieving manifest ${error}` )
            throw new SHLError( ErrorCode.SHL_MANIFEST_RETRIEVAL_ERROR )
        }

    }

    async fetchFHIRBundle( manifestFileInfo: ManifestType ): Promise<FHIRBundleType[]> {
        let dataLoader = await SMARTDataLoader.init( 
            this.shlData!.key as string, 
            manifestFileInfo )
        let bundle = await dataLoader.load();
        return bundle;
    }

    flagContains( flag: String ): boolean{
        return ( this.shlData !== null && 
            this.shlData.flag !== null && 
            ( this.shlData.flag.toUpperCase() as string ).indexOf(flag.toUpperCase()) >= 0 );
    }

    needsPasscode():boolean {
        return this.flagContains(FLAG_PASSWORD_NEEDED)
    }
    onlyOneData():boolean {
        return this.flagContains(FLAG_ONEDATA)
    }
    
    isExpired(): boolean {
      if( this.shlData === null || 
         this.shlData.exp === null ) {
        return false;
      }
      const expires = new Date(Number(this.shlData.exp )* 1000).getTime();
      const now = new Date().getTime()
      return ( expires < now ) 
    }



    getIPSURL( shlURL: string ): SHLParserResult| null {
        const match = shlURL.match(this.parserRegEx);
        if( match ){
            return  {
                original: shlURL,
                shl: match[1],
                payload: match[3]
            }
        } 
        return null
    }


    decodePayload( payload: String ): SHLData {
        const decodedBuffer = Buffer.from(payload, 'base64')
        const data =  JSON.parse( decodedBuffer.toString('utf-8'));
        try{ 
            const defaultData = {
                url: null,
                key: null,
                exp: null,
                v: null,
                label: null,
                flag: null
            }
            return {
                ...defaultData,
                ...data

            }        
        } catch( e ) {
            console.error(e)
            throw new Error( ErrorCode.SHL_DECODE_FAILED )
        }

    }

    async loadSHLContent( payloads: string[] ) {
        console.info("payloads = " + payloads)


        const url = "https://ips.tcpdev.org/view/c4ec43ddab0c4c3eafd7e36ffc8e7e1e"
        const data = { passcode: "123456"}
        const res = await fetch( url, { method: "POST", body: JSON.stringify(data) })
            .then( ( res ) => res.json() )
            .then( ( res ) => console.info(`JSON Viewer = ${JSON.stringify( res )}`))
        return res;
    }

}