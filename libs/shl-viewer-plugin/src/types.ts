import type { ParserInitOption, VaccineCodeItemType, TranlateFunctionType } from 'parser-sdk'


type ValidateIssuerReturnType = any | null;
export interface ValidateIssuerFunction<T = unknown> {
  ( verifierKey: string, issuer: T ): ValidateIssuerReturnType;
}

export interface AsyncIssuerValidateFunction<T = unknown> extends ValidateIssuerFunction<T> {
  (...args: Parameters<ValidateIssuerFunction<T>>): Promise< ValidateIssuerReturnType >;
  $async: true;
}

export declare type AnyIssuerValidateFunction<T = any> = ValidateIssuerFunction<T> | AsyncIssuerValidateFunction<T>;

type CodesReturnType = string [];


export interface GetGetAcceptedVaccineCodesFunction {
  ( verifierKey: string ): CodesReturnType;
}

export interface AsyncGetAcceptedVaccineFunction extends GetGetAcceptedVaccineCodesFunction {
  (...args: Parameters<ValidateIssuerFunction>): Promise< CodesReturnType >;
  $async: true;
}

export declare type AnyGetAcceptedVaccineCodesFunction<T = any> = GetGetAcceptedVaccineCodesFunction | AsyncGetAcceptedVaccineFunction;



export interface useLegacyFunction{
  ( system: string, code: string ): boolean
} 

export interface isAcceptedLabResult{
  ( system: string, code: string ): boolean
} 

export interface getIsSmallScreenFunction{
  ():boolean
} 

export interface getAcceptedSystemCodeFunction{
 ( system: string, code: string ): any | null
}

export interface getSystemCodeLabelFunction {
  ( system: string, code: string ): string | null 
}

export interface getVaccineCodesHashFunction{
  (): { [key: string]: VaccineCodeItemType }
}


export interface getTranslationFunction{
  (): TranlateFunctionType
} 

export type SHLViewerOption = ParserInitOption;

export type ManifestItemType = {
    contentType: string
    location?: string
    embedded?: string
}

export type ManifestType = {
    files: ManifestItemType[]
}
