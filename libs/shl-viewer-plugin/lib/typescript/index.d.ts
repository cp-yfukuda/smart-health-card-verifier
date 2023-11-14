import type { IParserBase, BaseResponse } from 'parser-sdk';
import SHLLoader from './shlLoader';
export * from './types';
export declare class SHLViewer implements IParserBase {
    shlLoader: SHLLoader;
    constructor();
    canSupport(payloads: string[]): Promise<IParserBase | null>;
    validate(payloads: string[]): Promise<null | BaseResponse>;
}
