import type { IParserBase, BaseResponse, SetCustomViewType, TranlateFunctionType, ParserInitOption } from 'parser-sdk';
import SHLLoader from './shlLoader';
export * from './types';
export declare let getText: TranlateFunctionType;
export declare class SHLViewer implements IParserBase {
    shlLoader: SHLLoader;
    constructor(option: ParserInitOption);
    canSupport(payloads: string[]): Promise<IParserBase | null>;
    requestPassCode(setCustomViews: SetCustomViewType): Promise<string | null>;
    validate(payloads: string[], setCustomViews: SetCustomViewType): Promise<null | BaseResponse>;
}
