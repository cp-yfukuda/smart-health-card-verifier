export default class SHLLoader {
    protocol: string = "shlink:/"
    parserRegEx: RegExp = RegExp(`.*((${this.protocol})(.+))$`)
    constructor(){

    }
    getIPSURL( shlURL: String ): string| null {
        const match = shlURL.match(this.parserRegEx);
        if( match ){
            return  match[1]
        } 
        return null
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

    async resolveSHLJWS( shlURL: String ): string | null {
        
    }
}