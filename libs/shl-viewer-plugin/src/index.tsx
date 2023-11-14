import type { IParserBase, BaseResponse } from 'parser-sdk'
import { getJWS } from 'jws-utils'
import SHLLoader from './shlLoader';
export  * from './types'




export class SHLViewer implements IParserBase {
  shlLoader: SHLLoader
  constructor () {
    this.shlLoader = new SHLLoader();
  }
  
  canSupport( payloads: string[] ): Promise< IParserBase|null > {
    if ( payloads.length > 0 &&
         payloads[0].indexOf(this.shlLoader.protocol) >= 0 ) {
       return Promise.resolve( this )
    }
    return Promise.reject(null)
  }

  async validate(payloads: string[]): Promise< null | BaseResponse > {
    try {
      let shlURL = this.shlLoader.getIPSURL(payloads[0])
      if( shlURL ) {
        let jws = await getJWS( this.shlLoader.protocol, [shlURL] )
        Promise.resolve({jws});
      }
    } catch ( e ) {
      console.info( e )
    }
    // let ipsContent  = await this.shlLoader.loadSHLContent(payloads);
    // return await getRecord( ipsContent );
    return Promise.reject(null)
  }

}
