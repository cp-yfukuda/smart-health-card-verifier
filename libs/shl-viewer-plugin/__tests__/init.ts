import { before } from 'lodash'
import { setVerifierInitOption } from '~/models/Config'
import type { SHCVerifierOption } from '~/types'


function initializeConfig(){
  console.info("Setting up intial SHL Config ")
  const shcOption: SHCVerifierOption = {
      useLegacy: ()=>false,
      getIssuer: ()=>[], 
      getVaccineCodesHash: ()=>{ return {} },
      getSystemCodeLabel: ( system: string, code: string ) => "Test Label",
      getAcceptedVaccineCodes: ()=>["208"],
      isAcceptedLabResult: ( system:string, code:string )=> {
        if( acceptableSystem.indexOf(system) >=0　&&
            acceptableLoincFromFixtures.indexOf(code) >= 0  
        ) {
          return true
        }
        console.info("wrong  system : " + system + "   code: " + code );
        return false
      } ,
      getAcceptedSystemCode: ( system: string, code: string ) => labResultSystem, 
  }
  setVerifierInitOption( shcOption )
}

beforeAll( initializeConfig )
