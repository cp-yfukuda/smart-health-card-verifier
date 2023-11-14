import { JWS } from './type'
import { jwsValidate } from './jws_validate'
const MAX_QR_CHUNK_LENGTH = 1191

export const getJWS =  async ( protocol: string, qr: string[] ): Promise<any> => {
  
  const jwsString: JWS | undefined = chunksToJws(protocol, qr)

  const isJwsExtracted = !!jwsString

  if (!isJwsExtracted) {
    console.log('ERROR: JWS was not extracted')
    return undefined
  }
  console.info(`validating payload: \r\n ${qr}`)
  let res =  await jwsValidate(jwsString)
  
  return res;
}

export const ErrorCode = {
  INVALID_NUMERIC_QR: "INVALID_NUMERIC_QR",
  INVALID_NUMERIC_QR_HEADER: "INVALID_NUMERIC_QR_HEADER",
  MISSING_QR_CHUNK: "MISSING_QR_CHUNK",
  INVALID_QR: "INVALID_QR",
  UNBALANCED_QR_CHUNKS: "UNBALANCED_QR_CHUNKS",
}

function chunksToJws (protocol:string, payloads: string[]): JWS | undefined {
  const chunkCount = payloads.length
  const jwsChunks = new Array<string>(chunkCount)

  for (let chunk of payloads) {
    chunk = chunk.trim()

    const chunkResult = decodeToJws(protocol, chunk, chunkCount)

    if (!chunkResult) return undefined // move on to next chunk

    const chunkIndex = chunkResult.chunkIndex
    if (chunkResult.result.length > MAX_QR_CHUNK_LENGTH) {
      console.log(
        `QR chunk ${chunkIndex} is larger than ${MAX_QR_CHUNK_LENGTH} bytes`,
        ErrorCode.INVALID_NUMERIC_QR,
      )
    }

    if (jwsChunks[chunkIndex - 1]) {
      // we have a chunk index collision
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.log(
        `we have two chunks with index ${chunkIndex}`,
        ErrorCode.INVALID_NUMERIC_QR_HEADER,
      )
      return undefined
    } else {
      jwsChunks[chunkIndex - 1] = chunkResult.result
    }
  }
  // make sure we have all chunks we expect
  for (let i = 0; i < chunkCount; i++) {
    if (!jwsChunks[i]) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.log('missing QR chunk ' + i, ErrorCode.MISSING_QR_CHUNK)
      return undefined
    }
  }

  if (payloads.length > 1) console.log('All parts decoded')

  const jws = jwsChunks.join('')

  if (chunkCount > 1 && jws.length <= MAX_QR_CHUNK_LENGTH) {
    console.log(
      `JWS of size ${jws.length} (<= ${MAX_QR_CHUNK_LENGTH}) didn't need to be split in ${chunkCount} chunks`,
      ErrorCode.INVALID_QR,
    )
  }

  // check if chunk sizes are balanced
  const expectedChunkSize = Math.floor(jws.length / chunkCount)
  const balancedSizeBuffer = Math.ceil(expectedChunkSize * (0.5 / 100)) // give some leeway to what we call "balanced", 0.5% away from expected size

  if (
    jwsChunks
      .map((jwsChunk) => jwsChunk.length)
      .reduce(
        (unbalanced, length) =>
          unbalanced ||
          length < expectedChunkSize - balancedSizeBuffer ||
          length > expectedChunkSize + balancedSizeBuffer,
        false,
      )
  ) {
    console.log(
      'QR chunk sizes are unbalanced: ' +
        jwsChunks.map((jwsChunk) => jwsChunk.length.toString()).join(),
      ErrorCode.UNBALANCED_QR_CHUNKS,
    )
  }

  return jws
}

function decodeToJws ( protocol:string, jws: string, chunkCount = 1): { result: JWS, chunkIndex: number } | undefined {
  let chunked = chunkCount > 1
  const qrHeader = protocol
  const positiveIntRegExp = '[1-9][0-9]*'
  let chunkIndex = 1

  // check numeric QR header
  const isChunkedHeader = new RegExp(`^${qrHeader}${positiveIntRegExp}/${chunkCount}/.*$`).test(jws)

  if (chunked && !isChunkedHeader) {
    // should have been a valid chunked header, check if we are missing one
    const hasBadChunkCount = new RegExp(`^${qrHeader}${positiveIntRegExp}/[1-9][0-9]*/.*$`).test(
      jws,
    )
    const found = jws.match(
      new RegExp(`^${qrHeader}${positiveIntRegExp}/(?<expectedChunkCount2>[1-9][0-9]*)/.*$`),
    )

    if (found) console.log(`${found}`)
    if (hasBadChunkCount) {
      const expectedChunkCount = parseInt(jws.substring(7, 8))
      console.log(
        `Missing QR code chunk: received ${chunkCount}, expected ${expectedChunkCount}`,
        ErrorCode.MISSING_QR_CHUNK,
      )
      return undefined
    }
  }
  if (chunked && isChunkedHeader) {
    console.log(
      `Single-chunk numeric QR code should have a header ${qrHeader}, not ${qrHeader}1/1/`,
      ErrorCode.INVALID_NUMERIC_QR_HEADER,
    )
    chunked = true // interpret the code as chunked even though it shouldn't
  }

  const validQrHeader = new RegExp(
    chunked ? `^${qrHeader}${positiveIntRegExp}/${chunkCount}/.*$` : `^${qrHeader}.*$`,
    'g',
  ).test(jws)
  if (!validQrHeader) {
    const expectedHeader = chunked
      ? `${qrHeader}${positiveIntRegExp}/${positiveIntRegExp}/`
      : `${qrHeader}`
    console.log(
      `Invalid numeric QR header: expected ${expectedHeader}`,
      ErrorCode.INVALID_NUMERIC_QR_HEADER,
    )
    return undefined
  }

  // check numeric QR encoding
  const validQrEncoding = new RegExp(
    chunked ? `^${qrHeader}${positiveIntRegExp}/${chunkCount}/[0-9]+$` : `^${qrHeader}[0-9]+$`,
    'g',
  ).test(jws)
  if (!validQrEncoding) {
    const expectedBody = chunked
      ? `${qrHeader}${positiveIntRegExp}/${positiveIntRegExp}/[0-9]+`
      : `${qrHeader}[0-9]+`
    console.log(`data = ${jws}`)
    console.log(`Invalid numeric QR: expected ${expectedBody}`, ErrorCode.INVALID_NUMERIC_QR)
    return undefined
  }

  // get the chunk index
  if (chunked) {
    const found = jws.match(new RegExp(`^${protocol}(?<chunkIndex>${positiveIntRegExp})`))
    chunkIndex =
      found && found.groups && found.groups.chunkIndex
        ? parseInt(found.groups.chunkIndex)
        : -1
    if (chunkIndex < 1 || chunkIndex > chunkCount) {
      console.log('Invalid QR chunk index: ' + chunkIndex, ErrorCode.INVALID_NUMERIC_QR_HEADER)
      return undefined
    }
  }

  const bodyIndex = jws.lastIndexOf('/') + 1
  const b64Offset = '-'.charCodeAt(0)
  const digitPairs = jws.substring(bodyIndex).match(/(\d\d?)/g)

  if (digitPairs == null || digitPairs[digitPairs.length - 1].length == 1) {
    console.log(
      "Invalid numeric QR code, can't parse digit pairs. Numeric values should have even length.\n" +
        'Make sure no leading 0 are deleted from the encoding.',
      ErrorCode.INVALID_NUMERIC_QR,
    )
    return undefined
  }

  // since source of numeric encoding is base64url-encoded data (A-Z, a-z, 0-9, -, _, =), the lowest
  // expected value is 0 (ascii(-) - 45) and the biggest one is 77 (ascii(z) - 45), check that each pair
  // is no larger than 77
  if (Math.max(...digitPairs.map((d) => Number.parseInt(d))) > 77) {
    console.log(
      "Invalid numeric QR code, one digit pair is bigger than the max value 77 (encoding of 'z')." +
        'Make sure you followed the encoding rules.',
      ErrorCode.INVALID_NUMERIC_QR,
    )
    return undefined
  }

  // breaks string array of digit pairs into array of numbers: 'protocol:/123456...' = [12,34,56,...]
  const resultjws: string = digitPairs
    // for each number in array, add an offset and convert to a char in the base64 range
    .map((c: string) => String.fromCharCode(Number.parseInt(c) + b64Offset))
    // merge the array into a single base64 string
    .join('')

  return { result: resultjws, chunkIndex: chunkIndex }
}
