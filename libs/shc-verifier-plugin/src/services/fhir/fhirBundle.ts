import { ErrorCode, Utils, InvalidError } from 'parser-sdk'
import { validateSchema, objPathToSchema } from '../jws/schema'
import fhirSchema from '../../schemas/fhir-schema.json'
import { getPatientDataFromFhir } from './getPatiendDataFromFhir'
import getRecordData from './recordParser'
/* this entry needs to match with ValidationProfilesFunctions keys */
import { RecordType, getRecordTypeFromPayload } from './fhirTypes'
import validateBundleForRecordType from './recordValidator'
import { VerifierKey, getVerifierInitOption } from '../../models/Config'
import type { JWSPayload, FhirBundle } from './types'
import type { BaseResources } from 'parser-sdk'

const getIssuerFromFHIR = (payload: any): string => {
  const { iss: issuer } = payload
  return issuer
}

const getIssuedDateFromFHIR = ( payload: any  ): number | null => {
  const { nbf: nbf } = payload
  var res: number | null = null; 
  if( !isNaN(nbf) ) {
    res = nbf;
  }
  return res;
}

export async function getRecord (payload: JWSPayload ): Promise<BaseResources>{
  const issuer = getIssuerFromFHIR(payload)
  const issuedDate = getIssuedDateFromFHIR( payload );
  const notFoundIssuer = {
    message: 'Issuer not found'
  }
  const verifierOption = getVerifierInitOption();
  const issuerData = await verifierOption.getIssuer( VerifierKey, issuer) || notFoundIssuer
  const { message } = issuerData
  const isIssuerNotFound = message && message === 'Issuer not found'
  
  if (isIssuerNotFound) {
    issuerData.url = issuer
    issuerData.name = undefined
  }


  const patientData = getPatientDataFromFhir(payload)
  const recordType  = getRecordTypeFromPayload(payload)
  const tagKeys     = getTagKeys(payload)
  const recordEntries = await getRecordData(recordType, payload)
  if ( recordEntries?.length === 0 ) {
    throw new InvalidError(ErrorCode.NO_VALID_RECORD)
  }
  const document = {
    issuedDate,
    issuerData,
    patientData,
    recordType
  }
  if( tagKeys ) {
    document['tagKeys'] = tagKeys
  }
  if( recordEntries ) {
    document['recordEntries'] = recordEntries
  }
  return document
}

export function getTagKeys( payload: JWSPayload ): string[] {
  let res:string[] = []
  let types = payload?.vc?.type || []
  let tagMap = {
    "https://smarthealth.cards#covid19":"Covid19",
  }
  for( const key in tagMap){
    if( types.indexOf(key) >= 0 ) {
      res.push(tagMap[key])
    }
  }
  return res
}

export async function validate ( recordType: RecordType, fhirBundleJSON: object | undefined): Promise<boolean> {
  let isFhirBundleValid = false
  if ( typeof fhirBundleJSON !== 'undefined') {
    const fhirBundle = fhirBundleJSON as FhirBundle

    if ( fhirBundle ) {
      isFhirBundleValid = validateFhirBundle(fhirBundle)
    }

    if (!isFhirBundleValid) {
      console.info("FHIR invalid")
      return Promise.reject(false)
    }
    // Validate each resource of .entry[]
    for (const [index, entry] of fhirBundle.entry.entries()) {
      validateFhirBundleEntry(entry, index)
      // walks the property tree of this resource object
      // the callback receives the child property and it's path objPathToSchema() maps a schema property to a property path
      // currently, oneOf types will break this system
      Utils.walkProperties(
        entry.resource as unknown as Record<string, unknown>,
        [entry.resource.resourceType],
        (o: Record<string, unknown>, path: string[]) => {
          const propType = objPathToSchema(path.join('.'))
          validatePropType(propType, index, path, o)
        },
      )

      // with Bundle.entry.fullUrl populated with short resource-scheme URIs (e.g., {'fullUrl': 'resource:0})
      if (typeof entry.fullUrl !== 'string' || !/resource:\d+/.test(entry.fullUrl)) {
        console.log(
          'fhirBundle.entry.fullUrl should be short resource-scheme URIs (e.g., {"fullUrl": "resource:0"}',
          ErrorCode.FHIR_SCHEMA_ERROR,
        )
      }
    }
    return validateBundleForRecordType( recordType, fhirBundle )
      
  }
  return false
}

function validateFhirBundle (fhirBundle: FhirBundle) {
  if (fhirBundle === undefined) {
    return false
  }

  // failures will be recorded in the console.log
  if (!validateSchema(fhirSchema, fhirBundle)) {
    return false
  }

  // to continue validation, we must have a list of resources in .entry[]
  if (!fhirBundle.entry || !(fhirBundle.entry instanceof Array) || fhirBundle.entry.length === 0) {
    // The schema check above will list the expected properties/type
    console.log('FhirBundle.entry[] required to continue.', ErrorCode.CRITICAL_DATA_MISSING)
    return false
  }

  return true
}

function validateFhirBundleEntry (entry: any, i: number) {
  const resource = entry.resource
  if (resource == null) {
    console.log(`Schema: entry[${i.toString()}].resource missing`)
  }

  if (!resource.resourceType) {
    console.log(`Schema: entry[${i.toString()}].resource.resourceType missing`)
  }

  if (!(fhirSchema.definitions as Record<string, unknown>)[resource.resourceType]) {
    console.log(
      `Schema: entry[${i.toString()}].resource.resourceType '${String( resource.resourceType )}' unknown`,
    )
  }

  // validateSchema({ $ref: 'https://smarthealth.cards/schema/fhir-schema.json#/definitions/' + resource.resourceType }, resource, ['', 'entry', i.toString(), resource.resourceType].join('/'))
  if (resource.id) {
    console.log(
      `Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}]\
       should not include .id elements`,
      ErrorCode.FHIR_SCHEMA_ERROR,
    )
  }

  if (resource.meta) {
    // resource.meta.security allowed as special case, however, no other properties may be included on .meta
    if (!resource.meta.security || Object.keys(resource.meta).length > 1) {
      console.log(
        `Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}].meta \
       should only include .security property with an array of identity assurance codes`,
        ErrorCode.FHIR_SCHEMA_ERROR,
      )
    }
  }

  if (resource.text) {
    console.log(
      `Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}] \
         should not include .text elements`,
      ErrorCode.FHIR_SCHEMA_ERROR,
    )
  }
}

function validatePropType (propType: string, i: number, path: string[], o: Record<string, unknown>) {
  if (propType === 'CodeableConcept' && o.text) {
    console.log(
      'fhirBundle.entry[' +
        i.toString() +
        ']' +
        '.resource.' +
        path.join('.') +
        ' (CodeableConcept) should not include .text elements',
      ErrorCode.FHIR_SCHEMA_ERROR,
    )
  }

  if (propType === 'Coding' && o.display) {
    console.log(
      'fhirBundle.entry[' +
        i.toString() +
        ']' +
        '.resource.' +
        path.join('.') +
        ' (Coding) should not include .display elements',
      ErrorCode.FHIR_SCHEMA_ERROR,
    )
  }

  if (propType === 'Reference' && o.reference && !/[^:]+:\d+/.test(o.reference as string)) {
    console.log(
      'fhirBundle.entry[' +
        i.toString() +
        ']' +
        '.resource.' +
        path.join('.') +
        ' (Reference) should be short resource-scheme URIs (e.g., {“patient”: {“reference”: “resource:0”}})',
      ErrorCode.SCHEMA_ERROR,
    )
  }

  if (
    // on empty string, empty object, empty array
    (o instanceof Array && o.length === 0) ||
    (typeof o === 'string' && o === '') ||
    (o instanceof Object && Object.keys(o).length === 0)
  ) {
    console.log(
      'fhirBundle.entry[' +
        i.toString() +
        ']' +
        '.resource.' +
        path.join('.') +
        ' is empty. Empty elements are invalid.',
      ErrorCode.FHIR_SCHEMA_ERROR,
    )
  }
}
