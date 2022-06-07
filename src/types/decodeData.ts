import { DynamicKeyPartInput } from './dynamicKeys';

export type DecodeDataInput = Record<
  string,
  string | { key: string; value: string } | DynamicKeyPartInput
>;
