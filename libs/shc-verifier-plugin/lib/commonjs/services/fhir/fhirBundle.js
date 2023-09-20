"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRecord = getRecord;
exports.getTagKeys = getTagKeys;
exports.validate = validate;
var _parserSdk = require("parser-sdk");
var _schema = require("../jws/schema");
var _fhirSchema = _interopRequireDefault(require("../../schemas/fhir-schema.json"));
var _getPatiendDataFromFhir = require("./getPatiendDataFromFhir");
var _recordParser = _interopRequireDefault(require("./recordParser"));
var _fhirTypes = require("./fhirTypes");
var _recordValidator = _interopRequireDefault(require("./recordValidator"));
var _Config = require("../../models/Config");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* this entry needs to match with ValidationProfilesFunctions keys */

const getIssuerFromFHIR = payload => {
  const {
    iss: issuer
  } = payload;
  return issuer;
};
const getIssuedDateFromFHIR = payload => {
  const {
    nbf: nbf
  } = payload;
  var res = null;
  if (!isNaN(nbf)) {
    res = nbf;
  }
  return res;
};
async function getRecord(payload) {
  const issuer = getIssuerFromFHIR(payload);
  const issuedDate = getIssuedDateFromFHIR(payload);
  const notFoundIssuer = {
    message: 'Issuer not found'
  };
  const verifierOption = (0, _Config.getVerifierInitOption)();
  const issuerData = (await verifierOption.getIssuer(_Config.VerifierKey, issuer)) || notFoundIssuer;
  const {
    message
  } = issuerData;
  const isIssuerNotFound = message && message === 'Issuer not found';
  if (isIssuerNotFound) {
    issuerData.url = issuer;
    issuerData.name = undefined;
  }
  const patientData = (0, _getPatiendDataFromFhir.getPatientDataFromFhir)(payload);
  const recordType = (0, _fhirTypes.getRecordTypeFromPayload)(payload);
  const tagKeys = getTagKeys(payload);
  const recordEntries = await (0, _recordParser.default)(recordType, payload);
  if ((recordEntries === null || recordEntries === void 0 ? void 0 : recordEntries.length) === 0) {
    throw new _parserSdk.InvalidError(_parserSdk.ErrorCode.NO_VALID_RECORD);
  }
  const document = {
    issuedDate,
    issuerData,
    patientData,
    recordType
  };
  if (tagKeys) {
    document['tagKeys'] = tagKeys;
  }
  if (recordEntries) {
    document['recordEntries'] = recordEntries;
  }
  return document;
}
function getTagKeys(payload) {
  var _payload$vc;
  let res = [];
  let types = (payload === null || payload === void 0 ? void 0 : (_payload$vc = payload.vc) === null || _payload$vc === void 0 ? void 0 : _payload$vc.type) || [];
  let tagMap = {
    "https://smarthealth.cards#covid19": "Covid19"
  };
  for (const key in tagMap) {
    if (types.indexOf(key) >= 0) {
      res.push(tagMap[key]);
    }
  }
  return res;
}
async function validate(recordType, fhirBundleJSON) {
  let isFhirBundleValid = false;
  if (typeof fhirBundleJSON !== 'undefined') {
    const fhirBundle = fhirBundleJSON;
    if (fhirBundle) {
      isFhirBundleValid = validateFhirBundle(fhirBundle);
    }
    if (!isFhirBundleValid) {
      console.info("FHIR invalid");
      return Promise.reject(false);
    }
    // Validate each resource of .entry[]
    for (const [index, entry] of fhirBundle.entry.entries()) {
      validateFhirBundleEntry(entry, index);
      // walks the property tree of this resource object
      // the callback receives the child property and it's path objPathToSchema() maps a schema property to a property path
      // currently, oneOf types will break this system
      _parserSdk.Utils.walkProperties(entry.resource, [entry.resource.resourceType], (o, path) => {
        const propType = (0, _schema.objPathToSchema)(path.join('.'));
        validatePropType(propType, index, path, o);
      });

      // with Bundle.entry.fullUrl populated with short resource-scheme URIs (e.g., {'fullUrl': 'resource:0})
      if (typeof entry.fullUrl !== 'string' || !/resource:\d+/.test(entry.fullUrl)) {
        console.log('fhirBundle.entry.fullUrl should be short resource-scheme URIs (e.g., {"fullUrl": "resource:0"}', _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
      }
    }
    return (0, _recordValidator.default)(recordType, fhirBundle);
  }
  return false;
}
function validateFhirBundle(fhirBundle) {
  if (fhirBundle === undefined) {
    return false;
  }

  // failures will be recorded in the console.log
  if (!(0, _schema.validateSchema)(_fhirSchema.default, fhirBundle)) {
    return false;
  }

  // to continue validation, we must have a list of resources in .entry[]
  if (!fhirBundle.entry || !(fhirBundle.entry instanceof Array) || fhirBundle.entry.length === 0) {
    // The schema check above will list the expected properties/type
    console.log('FhirBundle.entry[] required to continue.', _parserSdk.ErrorCode.CRITICAL_DATA_MISSING);
    return false;
  }
  return true;
}
function validateFhirBundleEntry(entry, i) {
  const resource = entry.resource;
  if (resource == null) {
    console.log(`Schema: entry[${i.toString()}].resource missing`);
  }
  if (!resource.resourceType) {
    console.log(`Schema: entry[${i.toString()}].resource.resourceType missing`);
  }
  if (!_fhirSchema.default.definitions[resource.resourceType]) {
    console.log(`Schema: entry[${i.toString()}].resource.resourceType '${String(resource.resourceType)}' unknown`);
  }

  // validateSchema({ $ref: 'https://smarthealth.cards/schema/fhir-schema.json#/definitions/' + resource.resourceType }, resource, ['', 'entry', i.toString(), resource.resourceType].join('/'))
  if (resource.id) {
    console.log(`Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}]\
       should not include .id elements`, _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
  }
  if (resource.meta) {
    // resource.meta.security allowed as special case, however, no other properties may be included on .meta
    if (!resource.meta.security || Object.keys(resource.meta).length > 1) {
      console.log(`Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}].meta \
       should only include .security property with an array of identity assurance codes`, _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
    }
  }
  if (resource.text) {
    console.log(`Bundle.entry[${i.toString()}].resource[${String(resource.resourceType)}] \
         should not include .text elements`, _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
  }
}
function validatePropType(propType, i, path, o) {
  if (propType === 'CodeableConcept' && o.text) {
    console.log('fhirBundle.entry[' + i.toString() + ']' + '.resource.' + path.join('.') + ' (CodeableConcept) should not include .text elements', _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
  }
  if (propType === 'Coding' && o.display) {
    console.log('fhirBundle.entry[' + i.toString() + ']' + '.resource.' + path.join('.') + ' (Coding) should not include .display elements', _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
  }
  if (propType === 'Reference' && o.reference && !/[^:]+:\d+/.test(o.reference)) {
    console.log('fhirBundle.entry[' + i.toString() + ']' + '.resource.' + path.join('.') + ' (Reference) should be short resource-scheme URIs (e.g., {“patient”: {“reference”: “resource:0”}})', _parserSdk.ErrorCode.SCHEMA_ERROR);
  }
  if (
  // on empty string, empty object, empty array
  o instanceof Array && o.length === 0 || typeof o === 'string' && o === '' || o instanceof Object && Object.keys(o).length === 0) {
    console.log('fhirBundle.entry[' + i.toString() + ']' + '.resource.' + path.join('.') + ' is empty. Empty elements are invalid.', _parserSdk.ErrorCode.FHIR_SCHEMA_ERROR);
  }
}
//# sourceMappingURL=fhirBundle.js.map