/* eslint @typescript-eslint/no-empty-interface: "off" */

export type VerifierInitOption = {[key: string]: any | undefined };

export type IScannerBaseCls = new ( options: VerifierInitOption ) => IScannerBase

export interface VaccineCodeItemType {
  'system': string
  'code': string
  'display': string | null
  'manufacturerName'?: string | null 
  'groupDisplay'?: string | null
} 

export interface BaseResources {
  issuedDate: number | null
  issuerData: issuerData
  patientData: patientData
  recordType: string
  recordEntries?: RecordEntry[]
  tagKeys?: string []
}

export interface BaseResponse extends BaseResources {
  isValid: boolean 
  errorCode: number
}


export interface  IScannerBase {
  canSupport: ( payloads: string[] ) => Promise<null|IScannerBase>
  validate: (payloads: string[]) => Promise< null | BaseResponse >
}



export interface Result {
  result: boolean
}

export interface RecordEntry {
  index?: unknown
  resourceType: string
  systemKey?: string
  systemCode?: string
  /* immunization */
  lotNumber?: unknown
  vaccinator?: unknown
  vaccineName?: unknown
  manufacturerName?: unknown
  groupName?: unknown
  vaccinationDate?: unknown
  /* labResult */
  securityCode?: string
  performer?: string
  effectiveDateTime?: string
  systemName?: string

  systemShortDefault?: string | null
  codableConseptLabel?: string
  codableConseptKey?: string
  codableConseptCode?: string
  codeableShortDefault?: string | null

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

