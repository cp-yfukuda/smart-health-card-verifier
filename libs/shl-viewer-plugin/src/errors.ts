
export const ErrorCode = {
   JWS_RETRIEVAL_ERROR : "JWS_RETRIEVAL_ERROR",
   SHL_DECODE_FAILED : "SHL_DECODE_FAILED",
   SHL_EXPIRED : "SHL_EXPIRED",
   SHL_PASSCODE_NEEDED : "SHL_PASSCODE_NEEDED",
   SHL_PASSCODE_NOTCORRECT : "SHL_PASSCODE_NOTCORRECT",
   SHL_MANIFEST_RETRIEVAL_ERROR : "SHL_MANIFEST_RETRIEVAL_ERROR",
   SHL_JWS_RETRIEVAL_ERROR : "SHL_JWS_RETRIEVAL_ERROR",

}


export class SHLError extends Error {
  code: string
  constructor(error:  string ) {
    super(error);
    this.code = error;
  }
  isError( error: string ) {
    return this.code === error
  }
}

export class SHLPassCodeNotCorrectError extends SHLError {
  attempt: number
  constructor(error:  string, attempt: number ) {
    super(error);
    this.attempt = attempt;
  }

}