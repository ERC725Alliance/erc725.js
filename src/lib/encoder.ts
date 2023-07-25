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
 * @author Jean Cavallera <@CJ42>
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
  hexToBytes,
  bytesToHex,
  toHex,
} from 'web3-utils';

import BigNumber from 'bignumber.js';

import { JSONURLDataToEncode, URLDataWithHash } from '../types';
import { AssetURLEncode } from '../types/encodeData';

import {
  SUPPORTED_HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from '../constants/constants';
import { getHashFunction, hashData, countNumberOfBytes } from './utils';

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

const abiCoder = AbiCoder;

const decodeDataSourceWithHash = (value: string): URLDataWithHash => {
  const hashFunctionSig = value.slice(0, 10);
  const hashFunction = getHashFunction(hashFunctionSig);

  const encodedData = value.replace('0x', '').slice(8); // Rest of data string after function hash
  const dataHash = '0x' + encodedData.slice(0, 64); // Get jsonHash 32 bytes
  const dataSource = hexToUtf8('0x' + encodedData.slice(64)); // Get remainder as URI

  return { hashFunction: hashFunction.name, hash: dataHash, url: dataSource };
};

/**
 * Encodes bytes to CompactBytesArray
 *
 * @param values An array of BytesLike strings
 * @returns bytes[CompactBytesArray]
 */
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

/**
 * Decodes CompactBytesArray of type bytes
 *
 * @param compactBytesArray A bytes[CompactBytesArray]
 * @returns An array of BytesLike strings decode from `compactBytesArray`
 */
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

/**
 * Encodes bytesN to CompactBytesArray
 *
 * @param values An array of BytesLike strings
 * @param numberOfBytes The number of bytes for each value from `values`
 * @returns bytesN[CompactBytesArray]
 */
const encodeBytesNCompactBytesArray = (
  values: string[],
  numberOfBytes: number,
): string => {
  values.forEach((value, index) => {
    if (stripHexPrefix(value).length > numberOfBytes * 2)
      throw new Error(
        `Hex bytes${numberOfBytes} value at index ${index} does not fit in ${numberOfBytes} bytes`,
      );
  });

  return encodeCompactBytesArray(values);
};

/**
 * Decodes CompactBytesArray of type bytesN
 *
 * @param compactBytesArray A bytesN[CompactBytesArray]
 * @param numberOfBytes The number of bytes allowed per each element from `compactBytesArray`
 * @returns An array of BytesLike strings decoded from `compactBytesArray`
 */
const decodeBytesNCompactBytesArray = (
  compactBytesArray: string,
  numberOfBytes: number,
): string[] => {
  const bytesValues = decodeCompactBytesArray(compactBytesArray);
  bytesValues.forEach((bytesValue, index) => {
    if (stripHexPrefix(bytesValue).length > numberOfBytes * 2)
      throw new Error(
        `Hex bytes${numberOfBytes} value at index ${index} does not fit in ${numberOfBytes} bytes`,
      );
  });

  return bytesValues;
};

/**
 * @returns Encoding/decoding for bytes1[CompactBytesArray] to bytes32[COmpactBytesArray]
 */
const returnTypesOfBytesNCompactBytesArray = () => {
  const types: Record<
    string,
    { encode: (value: string[]) => string; decode: (value: string) => string[] }
  > = {};

  for (let i = 1; i < 33; i++) {
    types[`bytes${i}[CompactBytesArray]`] = {
      encode: (value: string[]) => encodeBytesNCompactBytesArray(value, i),
      decode: (value: string) => decodeBytesNCompactBytesArray(value, i),
    };
  }
  return types;
};

/**
 * Encodes uintN to CompactBytesArray
 * @param values An array of BytesLike strings
 * @param numberOfBytes The number of bytes for each value from `values`
 * @returns uintN[CompactBytesArray]
 */
const encodeUintNCompactBytesArray = (
  values: number[],
  numberOfBytes: number,
): string => {
  const hexValues: string[] = values.map((value, index) => {
    const hexNumber = stripHexPrefix(numberToHex(value)).padStart(
      numberOfBytes * 2,
      '0',
    );
    if (hexNumber.length > numberOfBytes * 2)
      throw new Error(
        `Hex uint${
          numberOfBytes * 8
        } value at index ${index} does not fit in ${numberOfBytes} bytes`,
      );
    return hexNumber;
  });

  return encodeCompactBytesArray(hexValues);
};

/**
 * Decodes CompactBytesArray of type uintN
 * @param compactBytesArray A uintN[CompactBytesArray]
 * @param numberOfBytes The number of bytes allowed per each element from `compactBytesArray`
 * @returns An array of numbers decoded from `compactBytesArray`
 */
const decodeUintNCompactBytesArray = (
  compactBytesArray: string,
  numberOfBytes: number,
): number[] => {
  const hexValues = decodeCompactBytesArray(compactBytesArray);

  return hexValues.map((hexValue, index) => {
    const hexValueStripped = stripHexPrefix(hexValue);
    if (hexValueStripped.length > numberOfBytes * 2)
      throw new Error(
        `Hex uint${
          numberOfBytes * 8
        } value at index ${index} does not fit in ${numberOfBytes} bytes`,
      );
    return hexToNumber(hexValue);
  });
};

/**
 * @returns Encoding/decoding for uint8[CompactBytesArray] to uint256[COmpactBytesArray]
 */
const returnTypesOfUintNCompactBytesArray = () => {
  const types: Record<
    string,
    { encode: (value: number[]) => string; decode: (value: string) => number[] }
  > = {};

  for (let i = 1; i < 33; i++) {
    types[`uint${i * 8}[CompactBytesArray]`] = {
      encode: (value: number[]) => encodeUintNCompactBytesArray(value, i),
      decode: (value: string) => decodeUintNCompactBytesArray(value, i),
    };
  }
  return types;
};

/**
 * Encodes any set of strings to string[CompactBytesArray]
 *
 * @param values An array of non restricted strings
 * @returns string[CompactBytesArray]
 */
const encodeStringCompactBytesArray = (values: string[]): string => {
  const hexValues: string[] = values.map((element) => utf8ToHex(element));

  return encodeCompactBytesArray(hexValues);
};

/**
 * Decode a string[CompactBytesArray] to an array of strings
 * @param compactBytesArray A string[CompactBytesArray]
 * @returns An array of strings
 */
const decodeStringCompactBytesArray = (compactBytesArray: string): string[] => {
  const hexValues: string[] = decodeCompactBytesArray(compactBytesArray);
  const stringValues: string[] = hexValues.map((element) => hexToUtf8(element));

  return stringValues;
};

const valueTypeEncodingMap = {
  bool: {
    encode: (value: boolean) => (value ? '0x01' : '0x00'),
    decode: (value: string) => value === '0x01',
  },
  boolean: {
    encode: (value: boolean) => (value ? '0x01' : '0x00'),
    decode: (value: string) => value === '0x01',
  },
  string: {
    encode: (value: string | number) => {
      // if we receive a number as input,
      // convert each letter to its utf8 hex representation
      if (typeof value === 'number') {
        return utf8ToHex(`${value}`);
      }

      return utf8ToHex(value);
    },
    decode: (value: string) => hexToUtf8(value),
  },
  address: {
    encode: (value: string) => {
      const abiEncodedValue = abiCoder.encodeParameter('address', value);
      const bytesArray = hexToBytes(abiEncodedValue);
      return bytesToHex(bytesArray.slice(12));
    },
    decode: (value: string) => toChecksumAddress(value),
  },
  // NOTE: We could add conditional handling of numeric values here...
  uint128: {
    encode: (value: string | number) => {
      const abiEncodedValue = abiCoder.encodeParameter('uint128', value);
      const bytesArray = hexToBytes(abiEncodedValue);
      return bytesToHex(bytesArray.slice(16));
    },
    decode: (value: string) => {
      if (!isHex(value)) {
        throw new Error(`Can't convert ${value} to uint128, value is not hex.`);
      }

      if (value.length > 34) {
        throw new Error(
          `Can't convert hex value ${value} to uint128. Too many bytes. ${
            (value.length - 2) / 2
          } > 16`,
        );
      }

      return BigNumber(value).toNumber();
    },
  },
  uint256: {
    encode: (value: string | number) => {
      return abiCoder.encodeParameter('uint256', value);
    },
    decode: (value: string) => {
      if (!isHex(value)) {
        throw new Error(`Can't convert ${value} to uint256, value is not hex.`);
      }

      const numberOfBytes = countNumberOfBytes(value);

      if (numberOfBytes > 32) {
        throw new Error(
          `Can't convert hex value ${value} to uint256. Too many bytes. ${numberOfBytes} is above the maximal number of bytes 32`,
        );
      }

      return BigNumber(value).toNumber();
    },
  },
  bytes32: {
    encode: (value: string | number) => {
      let valueToEncode: string;

      if (typeof value === 'string' && !isHex(value)) {
        // if we receive a plain string (e.g: "hey!"), convert it to utf8-hex data
        valueToEncode = toHex(value);
      } else if (typeof value === 'number') {
        // if we receive a number as input, convert it to hex
        valueToEncode = numberToHex(value);
      } else {
        valueToEncode = value;
      }

      const numberOfBytes = countNumberOfBytes(valueToEncode);

      // CHECK that there is not more than 4 bytes
      if (numberOfBytes > 32) {
        throw new Error(
          `Can't convert ${value} to bytes32. Too many bytes, expected at most 32 bytes, received ${numberOfBytes}.`,
        );
      }

      return abiCoder.encodeParameter('bytes32', valueToEncode);
    },
    decode: (value: string) => abiCoder.decodeParameter('bytes32', value),
  },
  bytes4: {
    encode: (value: string | number) => {
      let valueToEncode: string;

      if (typeof value === 'string' && !isHex(value)) {
        // if we receive a plain string (e.g: "hey!"), convert it to utf8-hex data
        valueToEncode = toHex(value);
      } else if (typeof value === 'number') {
        // if we receive a number as input, convert it to hex
        valueToEncode = numberToHex(value);
      } else {
        valueToEncode = value;
      }

      const numberOfBytes = countNumberOfBytes(valueToEncode);

      // CHECK that there is not more than 32 bytes
      if (numberOfBytes > 4) {
        throw new Error(
          `Can't convert ${value} to bytes4. Too many bytes, expected at most 4 bytes, received ${numberOfBytes}.`,
        );
      }

      const abiEncodedValue = abiCoder.encodeParameter('bytes4', valueToEncode);
      const bytesArray = hexToBytes(abiEncodedValue);
      return bytesToHex(bytesArray.slice(0, 4));
    },
    decode: (value: string) => {
      // we need to abi-encode the value again to ensure that:
      //  - that data to decode does not go over 4 bytes.
      //  - if the data is less than 4 bytes, that it gets padded to 4 bytes long.
      const reEncodedData = abiCoder.encodeParameter('bytes4', value);
      return abiCoder.decodeParameter('bytes4', reEncodedData);
    },
  },
  bytes: {
    encode: (value: string) => toHex(value),
    decode: (value: string) => value,
  },
  'bool[]': {
    encode: (value: boolean) => abiCoder.encodeParameter('bool[]', value),
    decode: (value: string) => abiCoder.decodeParameter('bool[]', value),
  },
  'boolean[]': {
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
  'string[CompactBytesArray]': {
    encode: (value: string[]) => encodeStringCompactBytesArray(value),
    decode: (value: string) => decodeStringCompactBytesArray(value),
  },
  ...returnTypesOfBytesNCompactBytesArray(),
  ...returnTypesOfUintNCompactBytesArray(),
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
        decode: (value) => hexToNumber(value).toString(),
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
  value: string | string[] | number | number[] | boolean | boolean[],
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
