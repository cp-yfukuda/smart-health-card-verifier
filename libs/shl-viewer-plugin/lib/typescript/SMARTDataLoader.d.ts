/// <reference types="node" />
/// <reference types="react-native" />
import type { FHIRBundleType } from 'parser-sdk';
import type { ManifestItemType, ManifestType } from './types';
declare class SMARTDataLoader {
    key: string;
    verifiableCredentials: any[];
    rawBundles: FHIRBundleType[];
    manifestFileInfo: ManifestType;
    constructor(key: string, manifestFileInfo: ManifestType);
    load(): Promise<FHIRBundleType[]>;
    pushSHC(data: any): void;
    pushRawBundle(fhir: any): void;
    fetchJWS(shlURL: string): Promise<Response>;
    fetchSHLContent(file: ManifestItemType): Promise<string>;
    isKnownContent(contentType: string): boolean;
    static init(key: string, manifestFileInfo: ManifestType): SMARTDataLoader;
}
export default SMARTDataLoader;
