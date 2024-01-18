export declare const ErrorCode: {
    JWS_RETRIEVAL_ERROR: string;
    SHL_DECODE_FAILED: string;
    SHL_EXPIRED: string;
    SHL_PASSCODE_NEEDED: string;
    SHL_PASSCODE_NOTCORRECT: string;
    SHL_MANIFEST_RETRIEVAL_ERROR: string;
    SHL_JWS_RETRIEVAL_ERROR: string;
};
export declare class SHLError extends Error {
    code: string;
    constructor(error: string);
    isError(error: string): boolean;
}
export declare class SHLPassCodeNotCorrectError extends SHLError {
    attempt: number;
    constructor(error: string, attempt: number);
}
