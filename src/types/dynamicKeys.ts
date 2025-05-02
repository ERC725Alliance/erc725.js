// Put types / interfaces related to dynamic keys here

import type { EncodeDataType } from './encodeData/JSONURL';

export type DynamicKeyParts = string | string[] | number;

export interface DynamicKeyPartInput {
  dynamicKeyParts: DynamicKeyParts;
  value: EncodeDataType;
}

export interface DynamicKeyPart {
  type: string;
  value: string | boolean | number;
}
