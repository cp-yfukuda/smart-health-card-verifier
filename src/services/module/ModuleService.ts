import { ParserInitOption, ParserFactory, IParserBase } from 'parser-sdk'
import { SHCVerifier } from 'shc-verifier-plugin'
import { SHLViewer } from 'shl-viewer-plugin'

var promiseAny = require('promise.any');

var moduleService: null| ModuleService;

export class ModuleService {

  static getModuleService(): ModuleService{
    moduleService = moduleService || new ModuleService();
    return moduleService;
  }

  initialize( option: ParserInitOption ): Promise<boolean> {
    ParserFactory.register( "shc", SHCVerifier, option );
    ParserFactory.register( "shl", SHLViewer, option );
    return Promise.resolve( true )
  }

  getParser(payloads: string[] ): Promise< null| IParserBase >{
    const parsers = ParserFactory.getParsers();
    const promises = Object.keys( parsers ).map((key:string)=>
      parsers[key].canSupport( payloads )
    );
    return promiseAny(promises)
  }
}
