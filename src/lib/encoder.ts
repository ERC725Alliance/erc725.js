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
/**
 * @file lib/encoder.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  this handles encoding and decoding as per necessary for the erc725 schema specifications
*/

import AbiCoder from 'web3-eth-abi';

import {
  hexToNumber,
  hexToUtf8,
  isAddress,
  keccak256,
  numberToHex,
  padLeft,
  toChecksumAddress,
  utf8ToHex,
} from 'web3-utils';

import { JSONURLDataToEncode, URLDataWithHash } from '../types';

import {
  SUPPORTED_HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from './constants';
import { getHashFunction, hashData } from './utils';

const encodeDataSourceWithHash = (
  hashType: SUPPORTED_HASH_FUNCTIONS,
  dataHash: string,
  dataSource: string,
): string => {
  const hashFunction = getHashFunction(hashType);

  return (
    keccak256(hashFunction.name).substr(0, 10) +
    dataHash.substr(2) +
    utf8ToHex(dataSource).substr(2)
  );
};

// TS can't get the types from the import...
// @ts-ignore
const abiCoder: AbiCoder.AbiCoder = AbiCoder;

const decodeDataSourceWithHash = (value: string): URLDataWithHash => {
  const hashFunctionSig = value.substr(0, 10);
  const hashFunction = getHashFunction(hashFunctionSig);

  const encodedData = value.replace('0x', '').substr(8); // Rest of data string after function hash
  const dataHash = '0x' + encodedData.substr(0, 64); // Get jsonHash 32 bytes
  const dataSource = hexToUtf8('0x' + encodedData.substr(64)); // Get remainder as URI

  return { hashFunction: hashFunction.name, hash: dataHash, url: dataSource };
};

const valueTypeEncodingMap = {
  string: {
    encode: (value: string) => abiCoder.encodeParameter('string', value),
    decode: (value: string) => abiCoder.decodeParameter('string', value),
  },
  address: {
    encode: (value: string) => abiCoder.encodeParameter('address', value),
    decode: (value: string) => abiCoder.decodeParameter('address', value),
  },
  // NOTE: We could add conditional handling of numeric values here...
  uint256: {
    encode: (value: string | number) =>
      abiCoder.encodeParameter('uint256', value),
    decode: (value: string) => abiCoder.decodeParameter('uint256', value),
  },
  bytes32: {
    encode: (value) => abiCoder.encodeParameter('bytes32', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes32', value),
  },
  bytes4: {
    encode: (value) => abiCoder.encodeParameter('bytes4', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes4', value),
  },
  bytes: {
    encode: (value: string) => abiCoder.encodeParameter('bytes', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes', value),
  },
  'string[]': {
    encode: (value: string[]) => abiCoder.encodeParameter('string[]', value),
    decode: (value: string) => abiCoder.decodeParameter('string[]', value),
  },
  'address[]': {
    encode: (value: string[]) => abiCoder.encodeParameter('address[]', value),
    decode: (value: string) => abiCoder.decodeParameter('address[]', value),
  },
  'uint256[]': {
    encode: (value: Array<number | string>) =>
      abiCoder.encodeParameter('uint256[]', value),
    decode: (value: string) => abiCoder.decodeParameter('uint256[]', value),
  },
  'bytes32[]': {
    encode: (value: string[]) => abiCoder.encodeParameter('bytes32[]', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes32[]', value),
  },
  'bytes4[]': {
    encode: (value: string[]) => abiCoder.encodeParameter('bytes4[]', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes4[]', value),
  },
  'bytes[]': {
    encode: (value: string[]) => abiCoder.encodeParameter('bytes[]', value),
    decode: (value: string) => abiCoder.decodeParameter('bytes[]', value),
  },
};

// Use enum for type bellow
// Is it this enum ERC725JSONSchemaValueType? (If so, custom is missing from enum)
export const valueContentEncodingMap = {
  Keccak256: {
    type: 'bytes32',
    encode: (value) => value,
    decode: (value) => value,
  },
  // NOTE: Deprecated. For reference/testing in future
  ArrayLength: {
    type: 'uint256',
    encode: (value) => padLeft(numberToHex(value), 64),
    decode: (value) => hexToNumber(value),
  },
  Number: {
    type: 'uint256',
    // NOTE: extra logic is to handle and always return a string number
    encode: (value) => {
      let parsedValue: number;
      try {
        parsedValue = parseInt(value, 10);
      } catch (error: any) {
        throw new Error(error);
      }

      return padLeft(numberToHex(parsedValue), 64);
    },
    decode: (value) => '' + hexToNumber(value),
  },
  // NOTE: This is not symmetrical, and always returns a checksummed address
  Address: {
    type: 'address',
    encode: (value: string) => {
      if (isAddress(value)) {
        return value.toLowerCase();
      }

      throw new Error('Address: "' + value + '" is an invalid address.');
    },
    decode: (value: string) => toChecksumAddress(value),
  },
  String: {
    type: 'string',
    encode: (value: string) => utf8ToHex(value),
    decode: (value: string) => hexToUtf8(value),
  },
  Markdown: {
    type: 'string',
    encode: (value: string) => utf8ToHex(value),
    decode: (value: string) => hexToUtf8(value),
  },
  URL: {
    type: 'string',
    encode: (value: string) => utf8ToHex(value),
    decode: (value: string) => hexToUtf8(value),
  },
  AssetURL: {
    type: 'custom',
    encode: (value: {
      hashFunction: SUPPORTED_HASH_FUNCTIONS;
      hash: string;
      url: string;
    }) => encodeDataSourceWithHash(value.hashFunction, value.hash, value.url),
    decode: (value: string) => decodeDataSourceWithHash(value),
  },
  // https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl
  JSONURL: {
    type: 'custom',
    encode: (dataToEncode: JSONURLDataToEncode) => {
      const { hash, json, hashFunction, url } = dataToEncode;

      let hashedJson = hash;

      if (json) {
        if (hashFunction) {
          throw new Error(
            'When passing in the `json` property, we use "keccak256(utf8)" as a default hashingFunction. You do not need to set a `hashFunction`.',
          );
        }
        hashedJson = hashData(
          json,
          SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
        );
      }

      if (!hashedJson) {
        throw new Error(
          'You have to provide either the hash or the json via the respective properties',
        );
      }

      return encodeDataSourceWithHash(
        (hashFunction as SUPPORTED_HASH_FUNCTION_STRINGS) ||
          SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
        hashedJson,
        url,
      );
    },
    decode: (dataToDecode: string) => decodeDataSourceWithHash(dataToDecode),
  },
};

export function encodeValueType(
  type: string,
  value: string | string[] | number | number[],
): string {
  if (!valueTypeEncodingMap[type]) {
    throw new Error('Could not encode valueType: "' + type + '".');
  }

  return value ? valueTypeEncodingMap[type].encode(value) : value;
}

export function decodeValueType(type: string, value: string) {
  if (!valueTypeEncodingMap[type]) {
    throw new Error('Could not decode valueType: "' + type + '".');
  }

  if (value === '0x') return null;

  return value ? valueTypeEncodingMap[type].decode(value) : value;
}

export function encodeValueContent(
  type: string,
  value:
    | string
    | {
        hashFunction: SUPPORTED_HASH_FUNCTIONS;
        hash: string;
        url: string;
      }
    | JSONURLDataToEncode,
):
  | string
  | {
      hashFunction: SUPPORTED_HASH_FUNCTIONS;
      hash: string;
      url: string;
    }
  | false {
  if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {
    throw new Error('Could not encode valueContent: "' + type + '".');
  } else if (type.substr(0, 2) === '0x') {
    return type === value ? value : false;
  }

  return value ? valueContentEncodingMap[type].encode(value) : '0x';
}

export function decodeValueContent(
  type: string,
  value: string,
): string | false {
  if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {
    throw new Error('Could not decode valueContent: "' + type + '".');
  } else if (type.substr(0, 2) === '0x') {
    return type === value ? value : false;
  }

  return value ? valueContentEncodingMap[type].decode(value) : value;
}
