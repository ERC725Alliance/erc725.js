// Put types / interfaces related to dynamic keys here

import { EncodeDataType } from './encodeData/JSONURL';

export type DynamicKeyParts = string | string[];

export interface DynamicKeyPartInput {
  dynamicKeyParts: DynamicKeyParts;
  value: EncodeDataType;
}
