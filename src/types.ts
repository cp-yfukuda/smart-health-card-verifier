import { StackNavigationProp } from '@react-navigation/stack'

export interface RootStackParamList {
  Welcome: undefined
  ScanQR: undefined
  VerificationResult: undefined | { validationResult: BaseResponse }
  Error: undefined
}

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>

export interface Props {
  navigation: ProfileScreenNavigationProp
  route: any
}

export interface Data {
  data: ValidationResult
}

export interface ValidationResult {
  validationResult: BaseResponse
}

export interface RecordEntry {
  index?: unknown
  resourceType: string
  /* immunization */
  lotNumber?: unknown
  vaccinator?: unknown
  vaccineName?: unknown
  vaccinationDate?: unknown
  /* labResult */
  securityCode?: string
  performer?: string
  observationDate?: string
  systemName?:string
  systemKey?:string
  systemCode?:string
  codableConseptLabel?:string
  codableConseptKey?:string
  codableConseptCode?:string


}

export interface BaseResponse {
  isValid: boolean | string
  errorCode: number
  issuerData: issuerData
  patientData: patientData
  recordType: string
  recordEntries?: RecordEntry[]
}

export declare class Timer {
  constructor ();
  start (): void;
  stop (): number;
}

export interface localeType {
  language: string
  region: string
}

interface issuerData {
  iss: string
  logo_uri: string
  name: string
  updated_at: number
  url: string
}

interface patientData {
  dateOfBirth: string
  names: string[]
}

interface VaccinationData {
  index: number
  lotNumber: string
  vaccinationDate: string
  vaccinator: string
  vaccineName: string
}

interface LabResultData {
  index: number
}
