import type { VerifierInitOption, IScannerBase, IScannerBaseCls } from '~/types'

export class ScannerFactory {
  static Scanners: Record<string, IScannerBase> = {}
  static register ( key: string, ScannerCls: IScannerBaseCls, option: VerifierInitOption  ) {
    if ( !!!this.Scanners[key] ){
      this.Scanners[key] = new ScannerCls( option )
    }
  }
  static getScanner():Record<string, IScannerBase>  {
    return this.Scanners;
  }
}
