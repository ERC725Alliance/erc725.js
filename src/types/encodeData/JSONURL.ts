import { SUPPORTED_HASH_FUNCTIONS } from '../../constants/constants';

export interface KeyValuePair {
  key: string;
  value: any;
}

interface URLData {
  url: string;
}

export interface URLDataWithHash extends URLData {
  hash: string;
  hashFunction: SUPPORTED_HASH_FUNCTIONS | string; // | string is to allow use of string directly without importing the enum
  json?: never;
}

export interface URLDataWithJson extends URLData {
  hash?: never;
  hashFunction?: never;
  json: Record<string, any>;
}

export type JSONURLDataToEncode = URLDataWithHash | URLDataWithJson;

export type EncodeDataType = string | string[] | JSONURLDataToEncode | boolean;

export interface EncodeDataReturn {
  keys: string[];
  values: string[];
}
