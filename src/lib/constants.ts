/* eslint-disable @typescript-eslint/ban-types */
import { numberToHex, keccak256 } from 'web3-utils';
import { MethodData, Encoding, Method } from '../types/Method';

export const METHODS: Record<Method, MethodData> = {
  [Method.GET_DATA]: {
    sig: '0x54f6127f',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES,
  },
  [Method.DATA_COUNT]: {
    sig: '0x5da40c47',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.UINT256,
  },
  [Method.ALL_DATA]: {
    sig: '0xc559acef',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES32_ARRAY,
  },
  [Method.OWNER]: {
    sig: '0x8da5cb5b',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.ADDRESS,
  },
};

export enum SUPPORTED_HASH_FUNCTION_STRINGS {
  KECCAK256_UTF8 = 'keccak256(utf8)',
  KECCAK256_BYTES = 'keccak256(bytes)',
}

export enum SUPPORTED_HASH_FUNCTION_HASHES {
  HASH_KECCAK256_UTF8 = '0x6f357c6a',
  HASH_KECCAK256_BYTES = '0x8019f9b1',
}

export type SUPPORTED_HASH_FUNCTIONS =
  | SUPPORTED_HASH_FUNCTION_STRINGS
  | SUPPORTED_HASH_FUNCTION_HASHES;

export const SUPPORTED_HASH_FUNCTIONS_LIST = Object.values(
  SUPPORTED_HASH_FUNCTION_STRINGS,
);

function keccak256Utf8(data) {
  return keccak256(JSON.stringify(data));
}

const KECCAK256_UTF8 = {
  method: keccak256Utf8,
  name: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
  sig: SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_UTF8,
};

const KECCAK256_BYTES = {
  method: keccak256,
  name: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES,
  sig: SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_BYTES,
};

export const HASH_FUNCTIONS: {
  [key: string]: {
    method: Function;
    name: SUPPORTED_HASH_FUNCTION_STRINGS;
    sig: SUPPORTED_HASH_FUNCTIONS;
  };
} = {
  [SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8]: KECCAK256_UTF8,
  [SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_UTF8]: KECCAK256_UTF8,
  [SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES]: KECCAK256_BYTES,
  [SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_BYTES]: KECCAK256_BYTES,
};
