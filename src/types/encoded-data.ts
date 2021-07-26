export interface KeyValuePair {
  key: string;
  value: unknown;
}

export interface DataToEncode {
  [key: string]: unknown;
}

export type EncodedData = KeyValuePair;
