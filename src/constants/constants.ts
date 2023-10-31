/*
    This file is part of @erc725/erc725.js.
    @erc725/erc725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    @erc725/erc725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with @erc725/erc725.js.  If not, see <http://www.gnu.org/licenses/>.
*/

/* eslint-disable @typescript-eslint/ban-types */
import { numberToHex, keccak256 } from 'web3-utils';

import { MethodData, Encoding, Method } from '../types/Method';

// https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
export const ERC725Y_INTERFACE_IDS = {
  // interface functions:
  //     - getData(bytes32)
  //     - setData(bytes32,bytes)
  legacy: '0x2bd57b73',
  // interface functions:
  //     - getData(bytes32[])
  //     - setData(bytes32[],bytes[])
  '2.0': '0x5a988c0f',
  // version 3.0.0 introduced function overloading
  // interface functions:
  //     - getData(bytes32)
  //     - setData(bytes32,bytes)
  //     - getData(bytes32[])
  //     - setData(bytes32[],bytes[])
  '3.0': '0x714df77c',
  // InterfaceId of version 3 == interfaceId of version 4
  // version 5.0.0 removed function overloading
  // interface functions:
  //     - getData(bytes32)
  //     - setData(bytes32,bytes)
  //     - getDataBatch(bytes32[])
  //     - setDataBatch(bytes32[],bytes[])
  '5.0': '0x629aa694',
};

export enum ERC725_VERSION {
  NOT_ERC725 = 'NOT_ERC725',
  // The ERC725Y_LEGACY version uses getData(bytes32) function
  ERC725_LEGACY = 'ERC725_LEGACY',
  // The ERC725_v2 version uses getData(bytes32[]) function, as well as v3 and v4
  ERC725_v2 = 'ERC725_v2', // https://github.com/ERC725Alliance/ERC725/releases/tag/v2.2.0
  // The ERC725_v5 version uses getDataBatch(bytes32[]) function
  ERC725_v5 = 'ERC725_v5', // https://github.com/ERC725Alliance/ERC725/releases/tag/v5.0.0
}

export const METHODS: Record<Method, MethodData> = {
  [Method.GET_DATA_LEGACY]: {
    // Legacy version of ERC725Y - before v0.3.0
    sig: '0x54f6127f',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES,
  },
  [Method.GET_DATA]: {
    // https://github.com/ERC725Alliance/ERC725/blob/v4.0.0/docs/ERC-725.md#erc725y
    sig: '0x4e3e6e9c',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES_ARRAY,
  },
  [Method.GET_DATA_BATCH]: {
    // https://github.com/ERC725Alliance/ERC725/blob/v5.1.0/docs/ERC-725.md#erc725y
    sig: '0xdedff9c6',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES_ARRAY,
  },
  [Method.OWNER]: {
    sig: '0x8da5cb5b',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.ADDRESS,
  },
  [Method.SUPPORTS_INTERFACE]: {
    // https://eips.ethereum.org/EIPS/eip-165
    sig: '0x01ffc9a7',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BOOL,
  },
  [Method.IS_VALID_SIGNATURE]: {
    // https://eips.ethereum.org/EIPS/eip-1271
    sig: '0x1626ba7e',
    gas: numberToHex(2000000),
    gasPrice: numberToHex(100000000),
    value: numberToHex(0),
    returnEncoding: Encoding.BYTES4,
  },
};

export enum SUPPORTED_VERIFICATION_FUNCTION_STRINGS {
  KECCAK256_UTF8 = 'keccak256(utf8)',
  KECCAK256_BYTES = 'keccak256(bytes)',
}

export enum SUPPORTED_VERIFICATION_FUNCTION_HASHES {
  HASH_KECCAK256_UTF8 = '0x6f357c6a',
  HASH_KECCAK256_BYTES = '0x8019f9b1',
}

export type SUPPORTED_VERIFICATION_FUNCTIONS =
  | SUPPORTED_VERIFICATION_FUNCTION_STRINGS
  | SUPPORTED_VERIFICATION_FUNCTION_HASHES;

export const SUPPORTED_VERIFICATION_FUNCTIONS_LIST = Object.values(
  SUPPORTED_VERIFICATION_FUNCTION_STRINGS,
);

function keccak256Utf8(data) {
  return keccak256(JSON.stringify(data));
}

const KECCAK256_UTF8 = {
  method: keccak256Utf8,
  name: SUPPORTED_VERIFICATION_FUNCTION_STRINGS.KECCAK256_UTF8,
  sig: SUPPORTED_VERIFICATION_FUNCTION_HASHES.HASH_KECCAK256_UTF8,
};

const KECCAK256_BYTES = {
  method: keccak256,
  name: SUPPORTED_VERIFICATION_FUNCTION_STRINGS.KECCAK256_BYTES,
  sig: SUPPORTED_VERIFICATION_FUNCTION_HASHES.HASH_KECCAK256_BYTES,
};

export const HASH_FUNCTIONS: {
  [key: string]: {
    method: Function;
    name: SUPPORTED_VERIFICATION_FUNCTION_STRINGS;
    sig: SUPPORTED_VERIFICATION_FUNCTIONS;
  };
} = {
  [SUPPORTED_VERIFICATION_FUNCTION_STRINGS.KECCAK256_UTF8]: KECCAK256_UTF8,
  [SUPPORTED_VERIFICATION_FUNCTION_HASHES.HASH_KECCAK256_UTF8]: KECCAK256_UTF8,
  [SUPPORTED_VERIFICATION_FUNCTION_STRINGS.KECCAK256_BYTES]: KECCAK256_BYTES,
  [SUPPORTED_VERIFICATION_FUNCTION_HASHES.HASH_KECCAK256_BYTES]:
    KECCAK256_BYTES,
};

// TODO: These values can be imported from lsp-smartcontracts lib after release
// prettier-ignore
export const LSP6_DEFAULT_PERMISSIONS = {
  CHANGEOWNER                      : "0x0000000000000000000000000000000000000000000000000000000000000001",
  ADDCONTROLLER                    : "0x0000000000000000000000000000000000000000000000000000000000000002",
  EDITPERMISSIONS                  : "0x0000000000000000000000000000000000000000000000000000000000000004",
  ADDEXTENSIONS                    : "0x0000000000000000000000000000000000000000000000000000000000000008",
  CHANGEEXTENSIONS                 : "0x0000000000000000000000000000000000000000000000000000000000000010",
  ADDUNIVERSALRECEIVERDELEGATE     : "0x0000000000000000000000000000000000000000000000000000000000000020",
  CHANGEUNIVERSALRECEIVERDELEGATE  : "0x0000000000000000000000000000000000000000000000000000000000000040",
  REENTRANCY                       : "0x0000000000000000000000000000000000000000000000000000000000000080",
  SUPER_TRANSFERVALUE              : "0x0000000000000000000000000000000000000000000000000000000000000100",
  TRANSFERVALUE                    : "0x0000000000000000000000000000000000000000000000000000000000000200",
  SUPER_CALL                       : "0x0000000000000000000000000000000000000000000000000000000000000400",
  CALL                             : "0x0000000000000000000000000000000000000000000000000000000000000800",
  SUPER_STATICCALL                 : "0x0000000000000000000000000000000000000000000000000000000000001000",
  STATICCALL                       : "0x0000000000000000000000000000000000000000000000000000000000002000",
  SUPER_DELEGATECALL               : "0x0000000000000000000000000000000000000000000000000000000000004000",
  DELEGATECALL                     : "0x0000000000000000000000000000000000000000000000000000000000008000",
  DEPLOY                           : "0x0000000000000000000000000000000000000000000000000000000000010000",
  SUPER_SETDATA                    : "0x0000000000000000000000000000000000000000000000000000000000020000",
  SETDATA                          : "0x0000000000000000000000000000000000000000000000000000000000040000",
  ENCRYPT                          : "0x0000000000000000000000000000000000000000000000000000000000080000",
  DECRYPT                          : "0x0000000000000000000000000000000000000000000000000000000000100000",
  SIGN                             : "0x0000000000000000000000000000000000000000000000000000000000200000",
  EXECUTE_RELAY_CALL               : "0x0000000000000000000000000000000000000000000000000000000000400000",
};

export const LSP6_ALL_PERMISSIONS =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export const COMPACT_BYTES_ARRAY_STRING = '[CompactBytesArray]';
