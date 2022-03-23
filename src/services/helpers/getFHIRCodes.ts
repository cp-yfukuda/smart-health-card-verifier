import { ErrorCode } from '../error'
import { vaccineCodesURl, ApiTimeout } from '../constants'
import { getInstallationIdManually } from '../../utils/utils'
import { DataKeys, loadDataOrRetrieveLocally } from '../../services/data/DataService'
import RemoteConfig from '../RemoteConfig'
import defaultCodesData from '../../../resources/public/vaccine-codes/accepted_code.json'

interface VaccineCodeItemType {
  'system': string
  'code': string
  'display': string
} 

interface SystemCodeItemType {
  'system': string
  'code': string
  'display': string
} 


interface VaccineCodesTypes {
  covid_19_vaccine_codes?: VaccineCodeItemType[]
  covid_19_lab_test_codes?:SystemCodeItemType[]
} 

let vaccineCodesData   = defaultCodesData.covid_19_vaccine_codes
let labResultCodesData = defaultCodesData.covid_19_lab_test_codes
let labResultSystemCodes = []

let vaccineCodesHash: { [key: string]: string } = {}
let acceptedVaccineCodes: string[] = []

let labResultCodesHash: { [key: string]: {
  code: string
  display: string
} } = {}
let acceptedSystemCodes: string[] = []
let acceptedLabResultSystemCodes = []


export const loadVaccineCodes = async (): Promise<boolean>=> {
  const appUuid: string = await getInstallationIdManually()
  const appUuidParameter = `appUUID=${appUuid}`
  const url = `${vaccineCodesURl}?${appUuidParameter}`
  const res = await loadDataOrRetrieveLocally<VaccineCodesTypes| null>( url, DataKeys.VACCINECODE )
  if ( res != null ) {
    vaccineCodesData   = res.covid_19_vaccine_codes ?? vaccineCodesData
    labResultCodesData = res.covid_19_lab_test_codes ?? labResultCodesData
    updateCodes()
  } else {
    console.log('using default vaccineCodes')
  }
  return ( res != null )
}

const updateCodes = () => {
    updateVaccineCode()
    updateLabResultSystemCode()

}

const updateVaccineCode = ()=>{
  vaccineCodesHash = {}
  acceptedVaccineCodes = []
  for (const vaccineCode of vaccineCodesData) {
    const { code, display } = vaccineCode
    acceptedVaccineCodes.push( code )
    vaccineCodesHash[code] = display

  }
}

const getLabResultSystemKey = (system: string, code: string ):string => {
  return `${system}#${code}`
}

const updateLabResultSystemCode = ()=>{
  labResultCodesHash = {}
  for (const vaccineCode of labResultCodesData) {
    const { code, display, system } = vaccineCode
    labResultCodesHash[ getLabResultSystemKey( system, code )] = {
      code, 
      display
    }
  }
}



updateCodes()


export const getVaccineCodesHash = (): { [key: string]: string } => {
  return vaccineCodesHash
}

export const getAcceptedVaccineCodes = (): string [] => {
  return acceptedVaccineCodes;
}

export const getSystemCodeLabel = ( system: string, code: string ): string | null => {
  return ( labResultCodesHash[getLabResultSystemKey( system, code ) ] ?? null ).display;
}


export const isAcceptedLabResult =( system: string, code: string ): boolean => {
  return !!labResultCodesHash[getLabResultSystemKey( system, code)]
}
