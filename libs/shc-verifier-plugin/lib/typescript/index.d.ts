import type { IParserBase, BaseResponse } from 'parser-sdk';
import type { SHCVerifierType } from './types';
export * from './types';
export declare class SHCVerifier implements IParserBase {
    constructor(options: SHCVerifierType);
    canSupport(payloads: string[]): Promise<IParserBase | null>;
    validate(payloads: string[]): Promise<null | BaseResponse>;
}
