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
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
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
  isHex,
  keccak256,
  numberToHex,
  padLeft,
  toChecksumAddress,
  utf8ToHex,
  stripHexPrefix,
} from 'web3-utils';

import { JSONURLDataToEncode, URLDataWithHash } from '../types';
import { AssetURLEncode } from '../types/encodeData';

import {
  SUPPORTED_HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from '../constants/constants';
import { getHashFunction, hashData } from './utils';

const bytesNRegex = /Bytes(\d+)/;

const ALLOWED_BYTES_SIZES = [2, 4, 8, 16, 32, 64, 128, 256];

const encodeDataSourceWithHash = (
  hashType: SUPPORTED_HASH_FUNCTIONS,
  dataHash: string,
  dataSource: string,
): string => {
  const hashFunction = getHashFunction(hashType);

  return (
    keccak256(hashFunction.name).slice(0, 10) +
    dataHash.slice(2) +
    utf8ToHex(dataSource).slice(2)
  );
};

// TS can't get the types from the import...
// @ts-ignore
const abiCoder: AbiCoder.AbiCoder = AbiCoder;

const decodeDataSourceWithHash = (value: string): URLDataWithHash => {
  const hashFunctionSig = value.slice(0, 10);
  const hashFunction = getHashFunction(hashFunctionSig);

  const encodedData = value.replace('0x', '').slice(8); // Rest of data string after function hash
  const dataHash = '0x' + encodedData.slice(0, 64); // Get jsonHash 32 bytes
  const dataSource = hexToUtf8('0x' + encodedData.slice(64)); // Get remainder as URI

  return { hashFunction: hashFunction.name, hash: dataHash, url: dataSource };
};

const encodeCompactBytesArray = (values: string[]): string => {
  const compactBytesArray = values
    .filter((value, index) => {
      if (!isHex(value)) {
        throw new Error(
          `Couldn't encode bytes[CompactBytesArray], value at index ${index} is not hex`,
        );
      }

      if (value.length > 65_535 * 2 + 2) {
        throw new Error(
          `Couldn't encode bytes[CompactBytesArray], value at index ${index} exceeds 65_535 bytes`,
        );
      }

      return true;
    })
    .reduce((acc, value) => {
      const numberOfBytes = stripHexPrefix(value).length / 2;
      const hexNumber = padLeft(numberToHex(numberOfBytes), 4);
      return acc + stripHexPrefix(hexNumber) + stripHexPrefix(value);
    }, '0x');

  return compactBytesArray;
};

const decodeCompactBytesArray = (compactBytesArray: string): string[] => {
  if (!isHex(compactBytesArray))
    throw new Error("Couldn't decode, value is not hex");

  let pointer = 0;
  const encodedValues: string[] = [];

  const strippedCompactBytesArray = stripHexPrefix(compactBytesArray);

  while (pointer < strippedCompactBytesArray.length) {
    const length = hexToNumber(
      '0x' + strippedCompactBytesArray.slice(pointer, pointer + 4),
    );

    if (length === 0) {
      // empty entries (`0x0000`) in a CompactBytesArray are returned as empty entries in the array
      encodedValues.push('');
    } else {
      encodedValues.push(
        '0x' +
          strippedCompactBytesArray.slice(
            pointer + 4,
            pointer + 2 * (length + 2),
          ),
      );
    }

    pointer += 2 * (length + 2);
  }

  if (pointer > strippedCompactBytesArray.length)
    throw new Error("Couldn't decode bytes[CompactBytesArray]");

  return encodedValues;
};

const valueTypeEncodingMap = {
  bool: {
    encode: (value: boolean) => abiCoder.encodeParameter('bool', value),
    decode: (value: string) => abiCoder.decodeParameter('bool', value),
  },
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
  'bool[]': {
    encode: (value: boolean) => abiCoder.encodeParameter('bool[]', value),
    decode: (value: string) => abiCoder.decodeParameter('bool[]', value),
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
  'bytes[CompactBytesArray]': {
    encode: (value: string[]) => encodeCompactBytesArray(value),
    decode: (value: string) => decodeCompactBytesArray(value),
  },
};

// Use enum for type below
// Is it this enum ERC725JSONSchemaValueType? (If so, custom is missing from enum)

export const valueContentEncodingMap = (valueContent: string) => {
  const bytesNRegexMatch = valueContent.match(bytesNRegex);
  const bytesLength = bytesNRegexMatch ? parseInt(bytesNRegexMatch[1], 10) : '';

  switch (valueContent) {
    case 'Keccak256': {
      return {
        type: 'bytes32',
        encode: (value: string) => value,
        decode: (value: string) => value,
      };
    }
    // NOTE: Deprecated. For reference/testing in future
    case 'ArrayLength': {
      return {
        type: 'uint256',
        encode: (value: number | string) => padLeft(numberToHex(value), 64),
        decode: (value: string) => hexToNumber(value),
      };
    }
    case 'Number': {
      return {
        type: 'uint256',
        // TODO: extra logic to handle and always return a string number
        encode: (value: string) => {
          let parsedValue: number;
          try {
            parsedValue = parseInt(value, 10);
          } catch (error: any) {
            throw new Error(error);
          }

          return padLeft(numberToHex(parsedValue), 64);
        },
        decode: (value) => '' + hexToNumber(value),
      };
    }
    // NOTE: This is not symmetrical, and always returns a checksummed address
    case 'Address': {
      return {
        type: 'address',
        encode: (value: string) => {
          if (isAddress(value)) {
            return value.toLowerCase();
          }

          throw new Error('Address: "' + value + '" is an invalid address.');
        },
        decode: (value: string) => toChecksumAddress(value),
      };
    }
    case 'String': {
      return {
        type: 'string',
        encode: (value: string) => utf8ToHex(value),
        decode: (value: string) => hexToUtf8(value),
      };
    }
    case 'Markdown': {
      return {
        type: 'string',
        encode: (value: string) => utf8ToHex(value),
        decode: (value: string) => hexToUtf8(value),
      };
    }
    case 'URL': {
      return {
        type: 'string',
        encode: (value: string) => utf8ToHex(value),
        decode: (value: string) => hexToUtf8(value),
      };
    }
    case 'AssetURL': {
      return {
        type: 'custom',
        encode: (value: AssetURLEncode) =>
          encodeDataSourceWithHash(value.hashFunction, value.hash, value.url),
        decode: (value: string) => decodeDataSourceWithHash(value),
      };
    }
    // https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl
    case 'JSONURL': {
      return {
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
        decode: (dataToDecode: string) =>
          decodeDataSourceWithHash(dataToDecode),
      };
    }
    case `Bytes${bytesLength}`: {
      return {
        type: 'bytes',
        encode: (value: string) => {
          if (typeof value !== 'string' || !isHex(value)) {
            throw new Error(`Value: ${value} is not hex.`);
          }

          if (bytesLength && !ALLOWED_BYTES_SIZES.includes(bytesLength)) {
            throw new Error(
              `Provided bytes length: ${bytesLength} for encoding valueContent: ${valueContent} is not valid.`,
            );
          }

          if (bytesLength && value.length !== 2 + bytesLength * 2) {
            throw new Error(
              `Value: ${value} is not of type ${valueContent}. Expected hex value of length ${
                2 + bytesLength * 2
              }`,
            );
          }

          return value;
        },
        decode: (value: string) => {
          if (typeof value !== 'string' || !isHex(value)) {
            console.log(`Value: ${value} is not hex.`);
            return null;
          }

          if (bytesLength && !ALLOWED_BYTES_SIZES.includes(bytesLength)) {
            console.error(
              `Provided bytes length: ${bytesLength} for encoding valueContent: ${valueContent} is not valid.`,
            );
            return null;
          }

          if (bytesLength && value.length !== 2 + bytesLength * 2) {
            console.error(
              `Value: ${value} is not of type ${valueContent}. Expected hex value of length ${
                2 + bytesLength * 2
              }`,
            );
            return null;
          }

          return value;
        },
      };
    }
    case 'BitArray': {
      return {
        type: 'bytes',
        encode: (value: string) => {
          if (typeof value !== 'string' || !isHex(value)) {
            throw new Error(`Value: ${value} is not hex.`);
          }

          return value;
        },
        decode: (value: string) => {
          if (typeof value !== 'string' || !isHex(value)) {
            console.error(`Value: ${value} is not hex.`);
            return null;
          }

          return value;
        },
      };
    }
    case 'Boolean': {
      return {
        type: 'bool',
        encode: (value): string => {
          return valueTypeEncodingMap.bool.encode(value);
        },
        decode: (value: string): boolean => {
          try {
            return valueTypeEncodingMap.bool.decode(value) as any as boolean;
          } catch (error) {
            throw new Error(`Value ${value} is not a boolean`);
          }
        },
      };
    }
    default: {
      return {
        type: 'unknown',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        encode: (_value: any) => {
          throw new Error(
            `Could not encode unknown (${valueContent}) valueContent.`,
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        decode: (_value: any) => {
          throw new Error(
            `Could not decode unknown (${valueContent}) valueContent.`,
          );
        },
      };
    }
  }
};

export function encodeValueType(
  type: string,
  value: string | string[] | number | number[] | boolean,
): string {
  if (!valueTypeEncodingMap[type]) {
    throw new Error('Could not encode valueType: "' + type + '".');
  }

  if (typeof value === 'undefined' || value === null) {
    return value;
  }

  return valueTypeEncodingMap[type].encode(value);
}

export function decodeValueType(type: string, value: string) {
  if (!valueTypeEncodingMap[type]) {
    throw new Error('Could not decode valueType: "' + type + '".');
  }

  if (value === '0x') return null;

  if (typeof value === 'undefined' || value === null) {
    return value;
  }

  return valueTypeEncodingMap[type].decode(value);
}

export function encodeValueContent(
  valueContent: string,
  value: string | number | AssetURLEncode | JSONURLDataToEncode | boolean,
): string | false {
  if (valueContent.slice(0, 2) === '0x') {
    return valueContent === value ? value : false;
  }

  const valueContentEncodingMethods = valueContentEncodingMap(valueContent);

  if (!valueContentEncodingMethods) {
    throw new Error(`Could not encode valueContent: ${valueContent}.`);
  }

  if (value === null || value === undefined) {
    return '0x';
  }

  if (
    (valueContent === 'AssetURL' ||
      valueContent === 'JSONURL' ||
      valueContent === 'Boolean') &&
    typeof value === 'string'
  ) {
    const expectedValueType = valueContent === 'Boolean' ? 'boolean' : 'object';

    throw new Error(
      `Could not encode valueContent: ${valueContent} with value: ${value}. Expected ${expectedValueType}.`,
    );
  }

  return valueContentEncodingMethods.encode(value as any) as string;
}

export function decodeValueContent(
  valueContent: string,
  value: string,
): string | URLDataWithHash | number | boolean | null {
  if (valueContent.slice(0, 2) === '0x') {
    return valueContent === value ? value : null;
  }

  if (!value || value === '0x') {
    return null;
  }

  return valueContentEncodingMap(valueContent).decode(value);
}
