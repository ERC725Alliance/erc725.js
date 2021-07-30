import { SUPPORTED_HASH_FUNCTIONS } from '../../lib/constants';

export interface KeyValuePair {
  key: string;
  value: any;
}

interface JSONURLData {
  url: string;
}

export interface JSONURLDataWithHash extends JSONURLData {
  hash: string;
  hashFunction: SUPPORTED_HASH_FUNCTIONS;
  json?: never;
}

export interface JSONURLDataWithJson extends JSONURLData {
  hash?: never;
  hashFunction?: never;
  json: unknown;
}

export type JSONURLDataToEncode = JSONURLDataWithHash | JSONURLDataWithJson;
