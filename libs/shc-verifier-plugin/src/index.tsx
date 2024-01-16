import type { IParserBase, BaseResponse } from 'parser-sdk'
import { validate  as qrValidate } from './qr' 
import type { SHCVerifierOption, SHCVerifierType } from './types'
import { setVerifierInitOption } from "./models/Config"
export  * from './types'




export class SHCVerifier implements IParserBase {

  constructor ( options: SHCVerifierType ) {
    setVerifierInitOption( options.shc as SHCVerifierOption )
    console.info("SHCVerifier: initialized")
  }
  
  canSupport( payloads: string[] ): Promise< IParserBase|null > {
    if ( payloads.length > 0 &&
         payloads[0].length > 4 && 
         payloads[0].startsWith("shc:/")) {
      return Promise.resolve( this )
    }
    return Promise.reject(null)
  }

  async validate(payloads: string[] ): Promise< null | BaseResponse > {
    return await qrValidate( payloads );
  }
}
