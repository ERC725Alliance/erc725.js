import { DynamicKeyPartInput } from './dynamicKeys';
import { EncodeDataType } from './encodeData/JSONURL';

export type DecodeDataInput = Record<
  string,
  string | { key: string; value: string } | DynamicKeyPartInput
>;

export interface DataInput {
  keyName: string; // can be the name or the hex/hash
  value;
  dynamicKeyParts?: string | string[];
}

export interface EncodeDataInput extends DataInput {
  value: EncodeDataType;
}

// export interface DecodeDataInput extends DataInput {
//   value: string;
// }

// decodeData
// fetchData
// getData
