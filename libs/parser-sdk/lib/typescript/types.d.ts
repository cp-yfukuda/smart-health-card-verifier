import type { ReactElement } from 'react';
import type { FHIRBundleType } from './fhirTypes';
export type OriginalParserInitOption = {
    [key: string]: any | undefined;
};
export interface TranlateFunctionType {
    (key: string, defaultText: string, option: any | null): string;
}
export type ParserInitOption = {
    getTranslationFunction: () => TranlateFunctionType;
} & OriginalParserInitOption;
export type VerifierInitOption = {
    [key: string]: any | undefined;
};
export type IParserBaseCls = new (options: ParserInitOption) => IParserBase;
export interface VaccineCodeItemType {
    'system': string;
    'code': string;
    'display': string | null;
    'manufacturerName'?: string | null;
    'groupDisplay'?: string | null;
}
export interface BaseResources {
    issuedDate: number | null;
    issuerData: issuerData;
    patientData: patientData;
    recordType: string;
    recordEntries?: RecordEntry[];
    tagKeys?: string[];
    bundle?: FHIRBundleType[];
}
export interface BaseResponse extends BaseResources {
    isValid: boolean;
    errorCode: number;
}
export type SetCustomViewType = (element: ReactElement[]) => void;
export interface IParserBase {
    canSupport: (payloads: string[]) => Promise<null | IParserBase>;
    validate: (payloads: string[], setCustomViews: SetCustomViewType) => Promise<null | BaseResponse>;
}
export interface Result {
    result: boolean;
}
export interface RecordEntry {
    index?: unknown;
    resourceType: string;
    systemKey?: string;
    systemCode?: string;
    lotNumber?: unknown;
    vaccinator?: unknown;
    vaccineName?: unknown;
    manufacturerName?: unknown;
    groupName?: unknown;
    vaccinationDate?: unknown;
    securityCode?: string;
    performer?: string;
    effectiveDateTime?: string;
    systemName?: string;
    systemShortDefault?: string | null;
    codableConseptLabel?: string;
    codableConseptKey?: string;
    codableConseptCode?: string;
    codeableShortDefault?: string | null;
}
interface issuerData {
    iss: string;
    logo_uri: string;
    name: string;
    updated_at: number;
    url: string;
}
interface patientData {
    dateOfBirth: string;
    names: string[];
}
export {};
//# sourceMappingURL=types.d.ts.map