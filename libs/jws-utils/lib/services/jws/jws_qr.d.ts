export declare const getJWS: (protocol: string, qr: string[]) => Promise<any>;
export declare const ErrorCode: {
    INVALID_NUMERIC_QR: string;
    INVALID_NUMERIC_QR_HEADER: string;
    MISSING_QR_CHUNK: string;
    INVALID_QR: string;
    UNBALANCED_QR_CHUNKS: string;
};
