import type { VerifierInitOption, IParserBase, IParserBaseCls } from '~/types'

export class ParserFactory {
  static Scanners: Record<string, IParserBase> = {}
  static register ( key: string, ScannerCls: IParserBaseCls, option: VerifierInitOption  ) {
    if ( !!!this.Scanners[key] ){
      this.Scanners[key] = new ScannerCls( option )
    }
  }
  static getParsers():Record<string, IParserBase>  {
    return this.Scanners;
  }
}
