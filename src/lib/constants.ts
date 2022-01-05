/* eslint-disable @typescript-eslint/ban-types */
import { numberToHex, keccak256 } from 'web3-utils';

import { MethodData, Encoding, Method } from '../types/Method';

// https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
export const INTERFACE_IDS = {
  ERC725Y_LEGACY: '0x2bd57b73',
  ERC725Y: '0x5a988c0f',
};

export enum ERC725_VERSION {
  ERC725 = 'ERC725', // https://github.com/ERC725Alliance/ERC725/commit/cca7f98cdf243f1ebf1c0a3ae89b1e46931481b0
  ERC725_LEGACY = 'ERC725_LEGACY',
  NOT_ERC725 = 'NOT_ERC725',
}

export const METHODS: Record<Method, MethodData> = {
  [Method.GET_DATA_LEGACY]: {
    sig: '0x54f6127f',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES,
  },
  [Method.GET_DATA]: {
    sig: '0x4e3e6e9c',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES_ARRAY,
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
  [Method.SUPPORTS_INTERFACE]: {
    sig: '0x01ffc9a7',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BOOL,
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

// TODO: These values can be imported from lsp-smartcontracts lib after release
export const LSP6_DEAFULT_PERMISSIONS = {
  CHANGEOWNER:
    '0x0000000000000000000000000000000000000000000000000000000000000001',

  CHANGEPERMISSIONS:
    '0x0000000000000000000000000000000000000000000000000000000000000002',

  ADDPERMISSIONS:
    '0x0000000000000000000000000000000000000000000000000000000000000004',

  SETDATA: '0x0000000000000000000000000000000000000000000000000000000000000008',

  CALL: '0x0000000000000000000000000000000000000000000000000000000000000010',

  STATICCALL:
    '0x0000000000000000000000000000000000000000000000000000000000000020',
  DELEGATECALL:
    '0x0000000000000000000000000000000000000000000000000000000000000040',
  DEPLOY: '0x0000000000000000000000000000000000000000000000000000000000000080',
  TRANSFERVALUE:
    '0x0000000000000000000000000000000000000000000000000000000000000100',
  SIGN: '0x0000000000000000000000000000000000000000000000000000000000000200',
};

export const LSP6_ALL_PERMISSIONS =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
