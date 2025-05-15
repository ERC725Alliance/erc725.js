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
 * @date 2023
 */

/*
  this handles encoding and decoding as per necessary for the erc725 schema specifications
*/

import type {
  ConsumedPtr,
  URLDataToEncode,
  URLDataWithHash,
  Verification,
} from '../types';
import type { AssetURLEncode } from '../types/encodeData';

import {
  SUPPORTED_VERIFICATION_METHOD_STRINGS,
  NONE_VERIFICATION_METHOD,
} from '../constants/constants';
import {
  getVerificationMethod,
  hashData,
  countNumberOfBytes,
  isValidUintSize,
  countSignificantBits,
  isValidByteSize,
  isValueContentLiteralHex,
} from './utils';
import type { ERC725JSONSchemaValueType } from '../types/ERC725JSONSchema';
import {
  bytesToHex,
  concat,
  decodeAbiParameters,
  encodeAbiParameters,
  encodePacked,
  getAddress,
  Hex,
  hexToBytes,
  hexToNumber,
  hexToString,
  isAddress,
  isHex,
  numberToHex,
  pad,
  size,
  slice,
  stringToHex,
  toHex,
} from 'viem';

const uintNValueTypeRegex = /^uint(\d+)(\+?)$/;
const bytesNValueTypeRegex = /^bytes(\d+)$/;
const BytesNValueContentRegex = /Bytes(\d+)/;

export const encodeDataSourceWithHash = (
  verification: undefined | Verification,
  dataSource: string,
): string => {
  const verificationMethod = getVerificationMethod(
    verification?.method || NONE_VERIFICATION_METHOD,
  );
  return concat([
    '0x0000' as Hex,
    (verificationMethod?.sig as Hex) ?? ('0x00000000' as Hex),
    verification?.data
      ? pad(toHex(size(verification.data as Hex)), {
          size: 2,
        })
      : ('0x0000' as Hex),
    (verification?.data as Hex) ?? '0x',
    toHex(dataSource),
  ]);
};

export const decodeDataSourceWithHash = (value: string): URLDataWithHash => {
  if (value.slice(0, 6) === '0x0000') {
    // DEAL with VerifiableURI
    // NOTE: A JSONURL with a 0x00000000 verification method is invalid.

    /*
      0        1         2         3         4         5         6         7         8
      12345678901234567890123456789012345678901234567890123456789012345678901234567890
      0x0000 code
            6f357c6a hash fn [6]
                    0020 data len [14]
                        820464ddfac1be...[18 + data len]
                                                       [18 + data len]...696670733a2f2...[...rest]
    */
    const verificationMethodSignature = `0x${value.slice(6, 14)}`;
    // NOTE: verificationMethodSignature can be 0x00000000 if no verification method is used
    // this means that an invalid verification method should still return all data
    // and not be an error. It's up to the method calling this to figure out
    // whether an unknown verification method is an error or not.
    const verificationMethod = getVerificationMethod(
      verificationMethodSignature,
    );
    const encodedLength = `0x${value.slice(14, 18)}`; // Rest of data string after function hash
    const dataLength = hexToNumber(encodedLength as Hex) as number;
    const dataHash = `0x${value.slice(18, 18 + dataLength * 2)}`; // Get jsonHash 32 bytes
    const dataSource = hexToString(`0x${value.slice(18 + dataLength * 2)}`); // Get remainder as URI

    return {
      verification: {
        method: verificationMethod?.name || verificationMethodSignature,
        data: dataHash,
      },
      url: dataSource,
    };
  }

  // @Deprecated code here:

  // Eventually we should no longer have JSONURL, AssetURL or (bytes4,URI)

  // DEAL with JSONURL

  const verificationMethodSignature = value.slice(0, 10);
  const verificationMethod = getVerificationMethod(verificationMethodSignature);
  const encodedData = value.slice(10); // Rest of data string after function hash

  try {
    // Special case where JSONURL is really (bytes4,URI) as specified
    // by the old version of LSP8TokenMetadataBaseURI
    // Catch error in case the buffor is not convertable to utf8.
    const dataSource = hexToString(`0x${encodedData}`); // Get as URI
    if (encodedData.length < 64 || /^[a-z]{2,}:[/\S]/.test(dataSource)) {
      // If the verification data starts with a utf8 sequence that looks like https:/ or data: or ar:/ for example.
      return {
        verification: {
          method: NONE_VERIFICATION_METHOD,
          data: '0x',
        },
        url: dataSource,
      };
    }
  } catch {
    // ignore
  }

  const dataHash = slice(`0x${encodedData}`, 0, 32); // Get jsonHash 32 bytes
  const dataSource = hexToString(slice(`0x${encodedData}`, 32)); // Get remainder as URI

  return {
    verification: {
      method: verificationMethod?.name || verificationMethodSignature,
      data: dataHash,
    },
    url: dataSource,
  };
};

type BytesNValueTypes =
  | 'bytes1'
  | 'bytes2'
  | 'bytes3'
  | 'bytes4'
  | 'bytes5'
  | 'bytes6'
  | 'bytes7'
  | 'bytes8'
  | 'bytes9'
  | 'bytes10'
  | 'bytes11'
  | 'bytes12'
  | 'bytes13'
  | 'bytes14'
  | 'bytes15'
  | 'bytes16'
  | 'bytes17'
  | 'bytes18'
  | 'bytes19'
  | 'bytes20'
  | 'bytes21'
  | 'bytes22'
  | 'bytes23'
  | 'bytes24'
  | 'bytes25'
  | 'bytes26'
  | 'bytes27'
  | 'bytes28'
  | 'bytes29'
  | 'bytes30'
  | 'bytes31'
  | 'bytes32';

const encodeToBytesN = (
  bytesN: BytesNValueTypes,
  value: string | number | bigint,
): string => {
  const numberOfBytesInType = Number.parseInt(bytesN.split('bytes')[1], 10);

  let valueToEncode: Hex;

  if (!isHex(value)) {
    // if we receive a plain string (e.g: "hey!"), convert it to utf8-hex data
    valueToEncode = toHex(value);
  } else if (typeof value === 'number') {
    // if we receive a number as input, convert it to hex,
    // despite `bytesN` pads on the right, we pad number on the left side here
    // to symmetrically encode / decode
    valueToEncode = pad(numberToHex(value), {
      size: numberOfBytesInType,
    });
  } else {
    valueToEncode = value;
  }

  const numberOfBytesInValue = countNumberOfBytes(valueToEncode);
  if (typeof value === 'number' || typeof value === 'bigint') {
    valueToEncode = pad(valueToEncode, {
      size: numberOfBytesInType,
    });
  } else {
    valueToEncode = pad(valueToEncode, {
      size: numberOfBytesInType,
      dir: 'right',
    });
  }

  if (numberOfBytesInValue > numberOfBytesInType) {
    throw new Error(
      `Can't convert ${value} to ${bytesN}. Too many bytes, expected at most ${numberOfBytesInType} bytes, received ${numberOfBytesInValue}.`,
    );
  }

  const abiEncodedValue = encodeAbiParameters(
    [{ type: bytesN, name: '' }],
    [valueToEncode as Hex],
  );

  // abi-encoding right pads to 32 bytes, if we need less, we need to remove the padding
  if (numberOfBytesInType === 32) {
    return abiEncodedValue;
  }

  const bytesArray = hexToBytes(abiEncodedValue);
  return bytesToHex(bytesArray.slice(0, numberOfBytesInType));
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
      if (value === '') {
        return '0x';
      }
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
      const numberOfBytes = value.slice(2).length / 2;
      const hexNumber = pad(numberToHex(numberOfBytes), {
        size: 2,
      });
      return concat([acc as Hex, hexNumber, value as Hex]);
    }, '0x');

  return compactBytesArray;
};

/**
 * Decodes CompactBytesArray of type bytes
 *
 * @param compactBytesArray A bytes[CompactBytesArray]
 * @returns An array of BytesLike strings decode from `compactBytesArray`
 */
const decodeCompactBytesArray = (
  compactBytesArray: string,
  consumed?: ConsumedPtr,
): string[] => {
  if (!isHex(compactBytesArray))
    throw new Error("Couldn't decode, value is not hex");

  const encodedValues: string[] = [];
  let current = compactBytesArray;
  while (size(current) > 0) {
    const length = hexToNumber(slice(current, 0, 2));
    if (length === 0) {
      // empty entries (`0x0000`) in a CompactBytesArray are returned as empty entries in the array
      encodedValues.push('');
      current = slice(current, 2);
      if (consumed) {
        consumed.bytes += 2;
      }
    } else {
      if (length > size(current) - 2) {
        throw new Error(
          "Couldn't decode bytes[CompactBytesArray] (invalid array item length)",
        );
      }
      encodedValues.push(slice(current, 2, 2 + length));
      if (consumed) {
        consumed.bytes += 2 + length;
      }
      if (size(current) === 2 + length) {
        break;
      }
      current = slice(current, 2 + length);
    }
  }
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
    if (size(value as Hex) > numberOfBytes)
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
  consumed?: ConsumedPtr,
): string[] => {
  const bytesValues = decodeCompactBytesArray(compactBytesArray, consumed);
  bytesValues.forEach((bytesValue, index) => {
    if (size(bytesValue as Hex) > numberOfBytes)
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
    {
      encode: (value: string[]) => string;
      decode: (value: string, consumed?: ConsumedPtr) => string[];
    }
  > = {};

  for (let i = 1; i < 33; i++) {
    types[`bytes${i}[CompactBytesArray]`] = {
      encode: (value: string[]) => encodeBytesNCompactBytesArray(value, i),
      decode: (value: string, consumed?: ConsumedPtr) =>
        decodeBytesNCompactBytesArray(value, i, consumed),
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
    const hexNumber = pad(numberToHex(value), {
      size: numberOfBytes,
    });
    if (hexNumber.slice(2).length > numberOfBytes * 2)
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
): bigint[] => {
  const hexValues = decodeCompactBytesArray(compactBytesArray);

  return hexValues.map((hexValue, index) => {
    const hexValueStripped = hexValue.slice(2);
    if (hexValueStripped.length > numberOfBytes * 2)
      throw new Error(
        `Hex uint${
          numberOfBytes * 8
        } value at index ${index} does not fit in ${numberOfBytes} bytes`,
      );
    return BigInt(hexValue) as bigint;
  });
};

/**
 * @returns Encoding/decoding for uint8[CompactBytesArray] to uint256[COmpactBytesArray]
 */
const returnTypesOfUintNCompactBytesArray = () => {
  const types: Record<
    string,
    { encode: (value: number[]) => string; decode: (value: string) => bigint[] }
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
  const hexValues: string[] = values.map((element) => stringToHex(element));

  return encodeCompactBytesArray(hexValues);
};

/**
 * Decode a string[CompactBytesArray] to an array of strings
 * @param compactBytesArray A string[CompactBytesArray]
 * @returns An array of strings
 */
const decodeStringCompactBytesArray = (
  compactBytesArray: string,
  consumed?: ConsumedPtr,
): string[] => {
  const hexValues: string[] = decodeCompactBytesArray(
    compactBytesArray,
    consumed,
  );
  const stringValues: string[] = hexValues.map((element) =>
    hexToString(element as Hex),
  );

  return stringValues;
};

function _decodeParameter(
  type: string,
): (value: string, consumed?: ConsumedPtr) => any {
  return (value: string, consumed?: ConsumedPtr) => {
    // we need to abi-encode the value again to ensure that:
    //  - that data to decode does not go over N bytes.
    //  - if the data is less than N bytes, that it gets padded to N bytes long.
    let actualType = type;
    const [, baseType, bitSize, append] = /^(u?int)(\d*)(.*)$/.exec(type) || [];
    if (baseType && !isValidUintSize(Number.parseInt(bitSize, 10))) {
      throw new Error(
        `Invalid \`${type}\` provided. Expected a multiple of 8 bits between 8 and 256.`,
      );
    }
    if (type === 'address') {
      actualType = 'bytes20';
    } else if (baseType) {
      const byteSize = Number.parseInt(bitSize, 10) / 8;
      actualType = `bytes${byteSize}${append}`; // decode as if they are bytes to make sure it's always right padded.
    }
    try {
      let result = decodeAbiParameters(
        [{ type: actualType, name: '' }],
        `${value}0000000000000000000000000000000000000000000000000000000000000000` as Hex, // Just add some zeros so that the native call doesn't run out of bytes.
      )[0];
      if (bitSize) {
        result = Array.isArray(result)
          ? result.map((result) => BigInt(result as string))
          : BigInt(result as string);
      }
      if (consumed) {
        const out = type.endsWith(']')
          ? encodeAbiParameters([{ type: actualType }], [result] as never)
          : encodePacked([type], [result]);
        const length = size(out);
        consumed.bytes += length;
      }
      return result;
    } catch (error) {
      throw new Error(
        `Error decoding value "${value}" as type "${type}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };
}

const valueTypeEncodingMap = (
  type: string,
): {
  encode: (value: any) => string;
  decode: (value: string, consumed?: ConsumedPtr) => any;
} => {
  const uintNRegexMatch = type.match(uintNValueTypeRegex);
  const bytesNRegexMatch = type.match(bytesNValueTypeRegex);
  const bytesLength = bytesNRegexMatch
    ? Number.parseInt(bytesNRegexMatch[1], 10)
    : '';

  const uintLength = uintNRegexMatch
    ? Number.parseInt(uintNRegexMatch[0].slice(4), 10)
    : 0;

  if (type.includes('[CompactBytesArray]')) {
    const compactBytesArrayMap = {
      'bytes[CompactBytesArray]': {
        encode: (value: string[]) => encodeCompactBytesArray(value),
        decode: (value: string, consumed?: ConsumedPtr) =>
          decodeCompactBytesArray(value, consumed),
      },
      'string[CompactBytesArray]': {
        encode: (value: string[]) => encodeStringCompactBytesArray(value),
        decode: (value: string, consumed?: ConsumedPtr) =>
          decodeStringCompactBytesArray(value, consumed),
      },
      ...returnTypesOfBytesNCompactBytesArray(),
      ...returnTypesOfUintNCompactBytesArray(),
    };

    return compactBytesArrayMap[type];
  }

  if (type === 'bytes') {
    return {
      encode: (value: string) =>
        isHex(value) ? (value.toLowerCase() as Hex) : toHex(value),
      decode: (value: string, consumed?: ConsumedPtr) => {
        if (consumed) {
          const length = size(value as Hex);
          consumed.bytes += length;
        }
        return value;
      },
    };
  }

  switch (type) {
    case 'bool':
    case 'boolean':
      return {
        encode: (value: boolean) => (value ? '0x01' : '0x00'),
        decode: (value: string, consumed?: ConsumedPtr) => {
          if (consumed) {
            consumed.bytes += 1;
          }
          return slice(value as Hex, 0, 1) === '0x01';
        },
      };
    case 'string':
      return {
        encode: (value: string | number) => {
          // if we receive a number as input, convert each letter to its utf8 hex representation
          if (typeof value === 'number') {
            return stringToHex(`${value}`);
          }

          return stringToHex(value);
        },
        decode: (value: string, consumed?: ConsumedPtr) => {
          if (consumed) {
            consumed.bytes += size(value as Hex);
          }
          return hexToString(value as Hex);
        },
      };
    case 'address':
      return {
        encode: (value: string) => {
          // abi-encode pads to 32 x 00 bytes on the left, so we need to remove them
          const abiEncodedValue = encodeAbiParameters([{ type: 'address' }], [
            value,
          ] as never);

          // convert to an array of individual bytes
          const bytesArray = hexToBytes(abiEncodedValue);

          // just keep the last 20 bytes, starting at index 12
          return bytesToHex(slice(bytesArray, 12));
        },
        decode: (value: string, consumed?: ConsumedPtr) => {
          const out = _decodeParameter('address')(value, consumed);
          return getAddress(out);
        },
      };
    // NOTE: We could add conditional handling of numeric values here...
    case `int${uintLength}`:
      return {
        encode: (value: string | number) => {
          if (!isValidUintSize(uintLength as number)) {
            throw new Error(
              `Can't encode ${value} as ${type}. Invalid \`uintN\` provided. Expected a multiple of 8 bits between 8 and 256.`,
            );
          }
          const abiEncodedValue = encodeAbiParameters([{ type }], [value]);

          const numberOfBits = countSignificantBits(abiEncodedValue);
          if (numberOfBits > (uintLength as number)) {
            throw new Error(
              `Can't represent value ${value} as ${type}. To many bits required ${numberOfBits} > ${uintLength}`,
            );
          }

          const bytesArray = hexToBytes(abiEncodedValue);
          const numberOfBytes = (uintLength as number) / 8;

          // abi-encoding always pad to 32 bytes. We need to keep the `n` rightmost bytes.
          // where `n` = `numberOfBytes`
          const startIndex = 32 - numberOfBytes;
          return bytesToHex(bytesArray.slice(startIndex));
        },
        decode: (value: string, consumed?: ConsumedPtr) => {
          const typeLength = (uintLength / 8) * 2 + 2;
          let actualType = type;
          if (value.length < typeLength) {
            actualType = `int${Math.round((value.length - 2) / 2) * 8}`;
          }
          const out = _decodeParameter(actualType)(value, consumed);
          return out;
        },
      };
    case `uint${uintLength}`:
      return {
        encode: (value: string | number) => {
          if (!isValidUintSize(uintLength as number)) {
            throw new Error(
              `Can't encode ${value} as ${type}. Invalid \`uintN\` provided. Expected a multiple of 8 bits between 8 and 256.`,
            );
          }
          const abiEncodedValue = encodeAbiParameters(
            [{ type, name: '' }],
            [value],
          );

          const numberOfBits = countSignificantBits(abiEncodedValue);
          if (numberOfBits > (uintLength as number)) {
            throw new Error(
              `Can't represent value ${value} as ${type}. To many bits required ${numberOfBits} > ${uintLength}`,
            );
          }

          const bytesArray = hexToBytes(abiEncodedValue);
          const numberOfBytes = (uintLength as number) / 8;

          // abi-encoding always pad to 32 bytes. We need to keep the `n` rightmost bytes.
          // where `n` = `numberOfBytes`
          const startIndex = 32 - numberOfBytes;
          return bytesToHex(bytesArray.slice(startIndex));
        },
        decode: _decodeParameter(type),
      };
    case `uint${uintLength}\+`:
      return {
        encode: (value: string | number) => {
          if (!isValidUintSize(uintLength as number)) {
            throw new Error(
              `Can't encode ${value} as ${type}. Invalid \`uintN\` provided. Expected a multiple of 8 bits between 8 and 256.`,
            );
          }
          const abiEncodedValue = encodeAbiParameters([{ type }], [value]);

          const numberOfBits = countSignificantBits(abiEncodedValue);
          if (numberOfBits > (uintLength as number)) {
            throw new Error(
              `Can't represent value ${value} as ${type}. To many bits required ${numberOfBits} > ${uintLength}`,
            );
          }

          const bytesArray = hexToBytes(abiEncodedValue);
          const numberOfBytes = (uintLength as number) / 8;

          // abi-encoding always pad to 32 bytes. We need to keep the `n` rightmost bytes.
          // where `n` = `numberOfBytes`
          const startIndex = 32 - numberOfBytes;
          return bytesToHex(bytesArray.slice(startIndex));
        },
        decode: (value: string, consumed?: ConsumedPtr) => {
          const byteLength = (value.length - 2) / 2;
          const typeLength = Math.min(byteLength * 8, 256);
          // Allow sizes smaller or larger, but consume the whole thing.
          // This is used for arrayLengths.
          return _decodeParameter(`uint${typeLength}`)(value, consumed);
        },
      };
    case `bytes${bytesLength}`:
      return {
        encode: (value: string | number) => {
          if (!isValidByteSize(bytesLength as number)) {
            throw new Error(
              `Can't encode ${value} as ${type}. Invalid \`bytesN\` provided. Expected a \`N\` value for bytesN between 1 and 32.`,
            );
          }
          return encodeToBytesN(type as BytesNValueTypes, value);
        },
        decode: _decodeParameter(type),
      };
    case 'bool[]':
      return {
        encode: (value: boolean) =>
          encodeAbiParameters([{ type: 'bool[]' }], [value] as never),
        decode: _decodeParameter('bool[]'),
      };
    case 'boolean[]':
      return {
        encode: (value: boolean) =>
          encodeAbiParameters([{ type: 'bool[]' }], [value] as never),
        decode: _decodeParameter('bool[]'),
      };
    case 'string[]':
      return {
        encode: (value: string[]) =>
          encodeAbiParameters([{ type: 'string[]' }], [value] as never),
        decode: _decodeParameter('string[]'),
      };
    case 'address[]':
      return {
        encode: (value: string[]) =>
          encodeAbiParameters([{ type: 'address[]' }], [value] as never),
        decode: _decodeParameter('address[]'),
      };
    case 'uint256[]':
      return {
        encode: (value: Array<number | string>) =>
          encodeAbiParameters([{ type: 'uint256[]' }], [value] as never),
        decode: (value: string, consumed?: ConsumedPtr) => {
          // we want to return an array of numbers as [1, 2, 3], not an array of strings as [ '1', '2', '3']
          return (
            (_decodeParameter('uint256[]')(value, consumed) as string[]) || []
          ).map((numberAsString) => {
            try {
              return Number(numberAsString);
            } catch {
              return BigInt(numberAsString);
            }
          });
        },
      };
    case 'bytes32[]':
      return {
        encode: (value: string[]) =>
          encodeAbiParameters([{ type: 'bytes32[]' }], [value] as never),
        decode: _decodeParameter('bytes32[]'),
      };
    case 'bytes4[]':
      return {
        encode: (value: string[]) =>
          encodeAbiParameters([{ type: 'bytes4[]' }], [value] as never),
        decode: _decodeParameter('bytes4[]'),
      };
    case 'bytes[]':
      return {
        encode: (value: string[]) =>
          encodeAbiParameters([{ type: 'bytes[]' }], [value] as never),
        decode: _decodeParameter('bytes[]'),
      };
    case 'bytes[CompactBytesArray]':
      return {
        encode: (value: string[]) => encodeCompactBytesArray(value),
        decode: (value: string, consumed?: ConsumedPtr) =>
          decodeCompactBytesArray(value, consumed),
      };
    case 'string[CompactBytesArray]':
      return {
        encode: (value: string[]) => encodeStringCompactBytesArray(value),
        decode: (value: string, consumed?: ConsumedPtr) =>
          decodeStringCompactBytesArray(value, consumed),
      };
    default:
      return {
        encode: (value: any) => {
          throw new Error(
            `Could not encode ${value}. Value type ${type} is unknown`,
          );
        },
        decode: (value: any, _consumed?: ConsumedPtr) => {
          throw new Error(
            `Could not decode ${value}. Value type ${type} is unknown`,
          );
        },
      };
  }
};

// Use enum for type below
// Is it this enum ERC725JSONSchemaValueType? (If so, custom is missing from enum)

export const valueContentEncodingMap = (
  valueContent: string,
): {
  type: string;
  encode: (value: any) => string;
  decode: (value: string) => any;
} => {
  const bytesNRegexMatch = valueContent.match(BytesNValueContentRegex);
  const bytesLength = bytesNRegexMatch
    ? Number.parseInt(bytesNRegexMatch[1], 10)
    : '';

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
        encode: (value: string) => {
          let parsedValue: number;
          try {
            parsedValue = Number.parseInt(value, 10);
          } catch (error: any) {
            throw new Error(error);
          }

          return pad(numberToHex(parsedValue), { size: 32 });
        },
        decode: (value) => BigInt(value),
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

          throw new Error(`Address: "${value}" is an invalid address.`);
        },
        decode: (value: string) => {
          try {
            return getAddress(value);
          } catch {
            throw new Error(`Address: "${value}" is an invalid address.`);
          }
        },
      };
    }
    case 'String': {
      return {
        type: 'string',
        encode: (value: string) => stringToHex(value),
        decode: (value: string) => hexToString(value as Hex),
      };
    }
    case 'Markdown': {
      return {
        type: 'string',
        encode: (value: string) => stringToHex(value),
        decode: (value: string) => hexToString(value as Hex),
      };
    }
    case 'URL': {
      return {
        type: 'string',
        encode: (value: string) => stringToHex(value),
        decode: (value: string) => hexToString(value as Hex),
      };
    }
    // https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#verifiableuri
    case 'AssetURL': // Deprecated since v0.22.0
    case 'JSONURL': // Deprecated since v0.22.0
    case 'VerifiableURI': {
      return {
        type: 'custom',
        encode: (dataToEncode: URLDataToEncode) => {
          const {
            verification: { data, method } = {},
            json,
            url,
          } = dataToEncode;

          let hashedJson = data;

          if (json) {
            if (method) {
              throw new Error(
                'When passing in the `json` property, we use "keccak256(utf8)" as a default verification method. You do not need to set a `verification.method`.',
              );
            }
            hashedJson = hashData(
              json,
              SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            );
          }

          if (!hashedJson) {
            throw new Error(
              'You have to provide either the verification.data or the json via the respective properties',
            );
          }

          return encodeDataSourceWithHash(
            {
              method:
                (method as SUPPORTED_VERIFICATION_METHOD_STRINGS) ||
                SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
              data: hashedJson || '0x',
            },
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

          if (bytesLength && !isValidByteSize(bytesLength)) {
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
            console.error(`Value: ${value} is not hex.`);
            return null;
          }

          if (bytesLength && !isValidByteSize(bytesLength)) {
            // This is a schema error and not a data error so we can throw it.
            throw new Error(
              `Provided bytes length: ${bytesLength} for encoding valueContent: ${valueContent} is not valid.`,
            );
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
        encode: (value: boolean): string => {
          return valueTypeEncodingMap('bool').encode(value);
        },
        decode: (value: string, consumed?: ConsumedPtr): boolean => {
          return valueTypeEncodingMap('bool').decode(
            value,
            consumed,
          ) as any as boolean;
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
  type: ERC725JSONSchemaValueType | string, // for tuples and CompactBytesArray,
  value:
    | string
    | string[]
    | bigint
    | bigint[]
    | number
    | number[]
    | boolean
    | boolean[],
): string {
  if (typeof value === 'undefined' || value === null) {
    return value;
  }

  return valueTypeEncodingMap(type).encode(value);
}

export function decodeValueType(
  type: ERC725JSONSchemaValueType | string, // for tuples and CompactBytesArray
  data: string,
  consumed?: ConsumedPtr, // for tuples and CompactBytesArray
) {
  if (data === '0x') return null;

  if (typeof data === 'undefined' || data === null) {
    return data;
  }

  return valueTypeEncodingMap(type).decode(data, consumed);
}

export function encodeValueContent(
  valueContent: string,
  value: string | bigint | AssetURLEncode | URLDataToEncode | boolean | unknown,
): string {
  if (isValueContentLiteralHex(valueContent)) {
    // hex characters are always lower case, even if the schema define some hex words uppercase
    // e.g: 0xAabbcCddeE -> encoded as 0xaabbccddee
    return valueContent === value ? value.toLowerCase() : '0x';
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
): string | URLDataWithHash | bigint | boolean | null {
  if (isValueContentLiteralHex(valueContent)) {
    return valueContent.toLowerCase() === value ? valueContent : null;
  }

  if (value == null || value === '0x') {
    // !value allows 0 values to become null.
    return null;
  }

  return valueContentEncodingMap(valueContent).decode(value);
}
