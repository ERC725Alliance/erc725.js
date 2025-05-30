import type { DynamicKeyParts } from './dynamicKeys';
import type { EncodeDataType, URLDataWithHash } from './encodeData/JSONURL';

export interface DataInput {
  keyName: string; // can be the name or the hex/hash
  value: unknown;
  dynamicKeyParts?: string | string[] | number | bigint;
  totalArrayLength?: number;
  startingIndex?: number;
}

export interface EncodeDataInput extends DataInput {
  value: EncodeDataType;
}

export interface DecodeDataInput extends DataInput {
  value: string | { key: string; value: string | null }[];
}

export type Data = string | bigint | boolean | null;

export interface DecodeDataOutput {
  value: Data | Data[] | URLDataWithHash | null;
  name: string;
  key: string;
  dynamicName?: string;
}

export interface FetchDataOutput {
  value:
    | null
    | string
    | string[]
    | { LSP3Profile: Record<string, any> }
    | Record<string, any>;
  error?: Error;
  dynamicKeyParts?: DynamicKeyParts;
  dynamicName?: string;
  name: string;
  key: string;
}

export interface GetDataExternalSourcesOutput extends DecodeDataOutput {
  value: any;
}
