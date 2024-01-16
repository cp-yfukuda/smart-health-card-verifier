import type { SHCVerifierOption } from '../types'

export const VerifierKey = "SHC"
const defaultOption = {
    useLegacy: ()=>true,
    getIssuer: ()=>null, 
    getAcceptedVaccineCodes: ()=>[],
    isAcceptedLabResult: ()=>false,
    isAccgetAcceptedSystemCode: ()=> null,
    getAcceptedSystemCode: ()=> null, 
    getSystemCodeLabel: ()=> null,
    getVaccineCodesHash: ()=> { return {}} 
}

var _verifierInitOption: SHCVerifierOption  = {
    ...defaultOption
}

export function setVerifierInitOption( option: SHCVerifierOption ): void {
    _verifierInitOption = option
}

export function getVerifierInitOption(): SHCVerifierOption {
    return _verifierInitOption
}