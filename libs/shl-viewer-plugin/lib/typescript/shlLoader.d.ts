export default class SHLLoader {
    protocol: string;
    parserRegEx: RegExp;
    constructor();
    getIPSURL(shlURL: String): string | null;
    loadSHLContent(payloads: string[]): Promise<void>;
}
