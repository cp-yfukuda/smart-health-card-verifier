import { ScannerFactory, IScannerBase, VerifierInitOption } from 'verifier-sdk'
import { SHCVerifier } from 'shc-verifier-plugin'
var promiseAny = require('promise.any');

var moduleService: null| ModuleService;

export class ModuleService {

  static getModuleService(): ModuleService{
    moduleService = moduleService || new ModuleService();
    return moduleService;
  }

  initialize( option: VerifierInitOption ): Promise<boolean> {
    ScannerFactory.register( "shc", SHCVerifier, option );
    return Promise.resolve( true )
  }

  getScanner(payloads: string[] ): Promise< null| IScannerBase >{
    const verifiers = ScannerFactory.getScanners();
    const promises = Object.keys( verifiers ).map((key:string)=>
      verifiers[key].canSupport( payloads )
    );
    return promiseAny(promises)
  }
}
