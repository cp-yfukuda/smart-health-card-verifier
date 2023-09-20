import { RecordType } from '../fhirTypes';
import type { RecordEntry } from 'parser-sdk';
import type { JWSPayload } from '../types';
export default function getRecordData(recordType: RecordType, jwsPayload: JWSPayload): Promise<RecordEntry[] | null>;
