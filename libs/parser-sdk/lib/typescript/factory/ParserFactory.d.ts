import type { ParserInitOption, IParserBase, IParserBaseCls } from '~/types';
export declare class ParserFactory {
    static Scanners: Record<string, IParserBase>;
    static register(key: string, ScannerCls: IParserBaseCls, option: ParserInitOption): void;
    static getParsers(): Record<string, IParserBase>;
}
//# sourceMappingURL=ParserFactory.d.ts.map