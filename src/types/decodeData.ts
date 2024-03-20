import { EncodeDataType, URLDataWithHash } from './encodeData/JSONURL';

export interface DataInput {
  keyName: string; // can be the name or the hex/hash
  value;
  dynamicKeyParts?: string | string[];
  arrayLength?: number;
  startingIndex?: number;
}

export interface EncodeDataInput extends DataInput {
  value: EncodeDataType;
}

export interface DecodeDataInput extends DataInput {
  value: string | { key: string; value: string | null }[];
}

export type Data = string | number | boolean | null;

export interface DecodeDataOutput {
  value: Data | Data[] | URLDataWithHash | null;
  name: string;
  key: string;
}

export interface FetchDataOutput {
  value:
    | null
    | string
    | string[]
    | { LSP3Profile: Record<string, any> }
    | Record<string, any>;
  name: string;
  key: string;
}

export interface GetDataExternalSourcesOutput extends DecodeDataOutput {
  value: any;
}
