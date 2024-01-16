import type { FHIRBundleType } from 'parser-sdk';
import type { ManifestType } from './types';
declare type SHLData = {
    url: string;
    key: string;
    exp: number | null;
    label: string | null;
    v: number | null;
    flag: string | null;
};
declare type SHLParserResult = {
    original: string;
    shl: string;
    payload: string;
};
export default class SHLLoader {
    protocol: string;
    parserRegEx: RegExp;
    shl: SHLParserResult | null;
    shlData: SHLData | null;
    constructor();
    validateSHL(shl: string, passCode?: string | null): Promise<FHIRBundleType[]>;
    getSingleManifestFileInfo(): ManifestType;
    getSHLManifestFileInfo(passcode: string | null): Promise<ManifestType>;
    fetchFHIRBundle(manifestFileInfo: ManifestType): Promise<FHIRBundleType[]>;
    flagContains(flag: String): boolean;
    needsPasscode(): boolean;
    onlyOneData(): boolean;
    isExpired(): boolean;
    getIPSURL(shlURL: string): SHLParserResult | null;
    decodePayload(payload: String): SHLData;
    loadSHLContent(payloads: string[]): Promise<void>;
}
export {};
