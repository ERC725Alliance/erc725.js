import { SUPPORTED_HASH_FUNCTIONS } from '../../lib/constants';

export interface KeyValuePair {
  key: string;
  value: any;
}

interface URLData {
  url: string;
}

export interface URLDataWithHash extends URLData {
  hash: string;
  hashFunction: SUPPORTED_HASH_FUNCTIONS;
  json?: never;
}

export interface URLDataWithJson extends URLData {
  hash?: never;
  hashFunction?: never;
  json: unknown;
}

export type JSONURLDataToEncode = URLDataWithHash | URLDataWithJson;
