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
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/utils.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import {
  checkAddressChecksum,
  isAddress,
  isHex,
  isHexStrict,
  keccak256,
  numberToHex,
  padLeft,
} from 'web3-utils';
import { arrToBufArr } from 'ethereumjs-util';

import {
  KeyValuePair,
  JSONURLDataToEncode,
  EncodeDataInput,
  EncodeDataReturn,
} from '../types';
import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueType,
} from '../types/ERC725JSONSchema';

import {
  HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTIONS_LIST,
} from './constants';
import {
  decodeValueContent,
  decodeValueType,
  encodeValueContent,
  encodeValueType,
  valueContentEncodingMap as valueContentMap,
} from './encoder';
import { AssetURLEncode } from '../types/encodeData';

/**
 *
 * @param {string} valueContent as per ERC725Schema definition
 * @param {string} valueType as per ERC725Schema definition
 * @param value can contain single value, an array, or an object as required by schema (JSONURL, or ASSETURL)
 * @param {string} [name]
 *
 * @return the encoded value as per the schema
 */
export function encodeKeyValue(
  valueContent: string,
  valueType: ERC725JSONSchemaValueType,
  value: string | string[] | JSONURLDataToEncode | JSONURLDataToEncode[],
  name?: string,
): string | false {
  const isSupportedValueContent =
    valueContentMap[valueContent] || valueContent.slice(0, 2) === '0x';

  if (!isSupportedValueContent) {
    throw new Error(
      `The valueContent '${valueContent}' 
            for ${name} is not supported.`,
    );
  }

  const isValueTypeArray = valueType.slice(valueType.length - 2) === '[]';

  if (!isValueTypeArray && !Array.isArray(value)) {
    // Straight forward encode
    return encodeValueContent(valueContent, value);
  }

  const isSameEncoding =
    valueContentMap[valueContent] &&
    valueContentMap[valueContent].type === valueType.split('[]')[0];

  let result;

  // We only loop if the valueType done by abi.encodeParameter can not handle it directly
  if (Array.isArray(value)) {
    // value type encoding will handle it?

    // we handle an array element encoding
    const results: Array<string | AssetURLEncode | false> = [];
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      results.push(encodeValueContent(valueContent, element));
    }

    result = results;
  }

  if (
    // and we only skip bytes regardless
    valueType !== 'bytes' &&
    // Requires encoding because !sameEncoding means both encodings are required
    !isSameEncoding
  ) {
    result = encodeValueType(valueType, result);
  } else if (isValueTypeArray && isSameEncoding) {
    result = encodeValueType(valueType, value as any);
  }

  return result;
}

/**
 *
 * @param key The schema key of a schema with keyType = 'Array'
 * @param index An integer representing the intended array index
 * @return The raw bytes key for the array element
 */
export function encodeArrayKey(key: string, index: number) {
  return key.slice(0, 34) + padLeft(numberToHex(index), 32).replace('0x', '');
}

/**
 *
 * @param keyName the schema key name
 * @returns a guess of the schema key type
 */
export function guessKeyTypeFromKeyName(
  keyName: string,
): ERC725JSONSchemaKeyType {
  // This function could not work with subsequents keys of an Array
  // It will always assume the given key, if array, is the initial array key.

  const splittedKeyName = keyName.split(':');

  if (splittedKeyName.length === 3) {
    return 'Bytes20MappingWithGrouping';
  }

  if (splittedKeyName.length === 2) {
    if (splittedKeyName[1].slice(0, 2) === '0x') {
      return 'Bytes20Mapping';
    }

    return 'Mapping';
  }

  if (keyName.substring(keyName.length - 2, keyName.length) === '[]') {
    return 'Array';
  }

  return 'Singleton';
}

/**
 *
 * @param name the schema element name.
 * @return the name of the key encoded as per specifications.
 *
 * @return a string of the encoded schema name.
 */
export function encodeKeyName(name: string) {
  const keyType = guessKeyTypeFromKeyName(name);

  switch (keyType) {
    case 'Bytes20MappingWithGrouping': {
      // bytes4(keccak256(FirstWord)) + bytes4(0) + bytes2(keccak256(SecondWord)) + bytes2(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 10) +
        '00000000' +
        keccak256(keyNameSplit[1]).slice(2, 6) +
        '0000' +
        keyNameSplit[2].slice(0, 40)
      );
    }
    case 'Bytes20Mapping': {
      // bytes8(keccak256(FirstWord)) + bytes4(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 18) +
        '00000000' +
        keyNameSplit[1].slice(2, 42)
      );
    }

    case 'Mapping': {
      // bytes16(keccak256(FirstWord)) + bytes12(0) + bytes4(keccak256(LastWord))
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 34) +
        '000000000000000000000000' +
        keccak256(keyNameSplit[1]).slice(2, 10)
      );
    }
    case 'Array': // Warning: this can not correctly encode subsequent keys of array, only the initial Array key will work
    case 'Singleton':
      return keccak256(name);
    default:
      return keccak256(name);
  }
}

/**
 *
 * @param schemas An array of ERC725JSONSchema objects.
 * @param {string} namedOrHashedKey A string of either the schema element name, or hashed key (with or without the 0x prefix).
 *
 * @return The requested schema element from the full array of schemas.
 */
export function getSchemaElement(
  schemas: ERC725JSONSchema[],
  namedOrHashedKey: string,
) {
  let keyHash: string;

  if (isHexStrict(namedOrHashedKey)) {
    keyHash = namedOrHashedKey;
  } else if (isHex(namedOrHashedKey)) {
    keyHash = `0x${namedOrHashedKey}`;
  } else {
    keyHash = encodeKeyName(namedOrHashedKey);
  }

  const schemaElement = schemas.find((e) => e.key === keyHash);

  if (!schemaElement) {
    throw new Error(
      'No matching schema found for key: "' +
        namedOrHashedKey +
        '" (' +
        keyHash +
        ').',
    );
  }

  return schemaElement;
}

/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the encoded value for the key as per the supplied schema.
 */
export function encodeKey(
  schema: ERC725JSONSchema,
  value: string | string[] | JSONURLDataToEncode | JSONURLDataToEncode[],
) {
  // NOTE: This will not guarantee order of array as on chain. Assumes developer must set correct order

  const lowerCaseKeyType = schema.keyType.toLowerCase();

  switch (lowerCaseKeyType) {
    case 'array': {
      if (!Array.isArray(value)) {
        console.error("Can't encode a non array for key of type array");
        return null;
      }

      const results: { key: string; value: string }[] = [];

      for (let index = 0; index < value.length; index++) {
        const dataElement = value[index];
        if (index === 0) {
          // This is arrayLength as the first element in the raw array
          results.push({
            key: schema.key,
            value: encodeKeyValue(
              'Number',
              'uint256',
              value.length.toString(),
              schema.name,
            ) as string,
          });
        }

        results.push({
          key: encodeArrayKey(schema.key, index),
          value: encodeKeyValue(
            schema.valueContent,
            schema.valueType,
            dataElement,
            schema.name,
          ) as string,
        });
      }

      return results;
    }
    case 'bytes20mapping':
    case 'bytes20mappingwithgrouping':
    case 'singleton':
    case 'mapping':
      return encodeKeyValue(
        schema.valueContent,
        schema.valueType,
        value,
        schema.name,
      );
    default:
      console.error(
        'Incorrect data match or keyType in schema from encodeKey(): "' +
          schema.keyType +
          '"',
      );
      return null;
  }
}

/**
 *
 * @param {string} valueContent as per ERC725Schema definition.
 * @param {string} valueType as per ERC725Schema definition.
 * @param {string} value the encoded value as string.
 * @param {string} [name]
 *
 * @return the decoded value as per the schema.
 */
export function decodeKeyValue(
  valueContent: string,
  valueType: ERC725JSONSchemaValueType,
  value,
  name?: string,
) {
  // Check for the missing map.
  if (!valueContentMap[valueContent] && valueContent.slice(0, 2) !== '0x') {
    throw new Error(
      'The valueContent "' +
        valueContent +
        '" for "' +
        name +
        '" is not supported.',
    );
  }

  let sameEncoding =
    valueContentMap[valueContent] &&
    valueContentMap[valueContent].type === valueType.split('[]')[0];
  const isArray = valueType.substring(valueType.length - 2) === '[]';

  // VALUE TYPE
  if (
    valueType !== 'bytes' && // we ignore because all is decoded by bytes to start with (abi)
    valueType !== 'string' &&
    !isAddress(value) // checks for addresses, since technically an address is bytes?
  ) {
    // eslint-disable-next-line no-param-reassign
    value = decodeValueType(valueType, value);
  }

  // As per exception above, if address and sameEncoding, then the address still needs to be handled
  if (sameEncoding && isAddress(value) && !checkAddressChecksum(value)) {
    sameEncoding = !sameEncoding;
  }

  if (sameEncoding && valueType !== 'string') {
    return value;
  }

  // VALUE CONTENT
  // We are finished if duplicated encoding methods

  if (isArray && Array.isArray(value)) {
    // value must be an array also
    const results: (string | false)[] = [];

    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      results.push(decodeValueContent(valueContent, element));
    }

    return results;
  }

  return decodeValueContent(valueContent, value);
}

/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the decoded value/values as per the schema definition.
 */
export function decodeKey(schema: ERC725JSONSchema, value) {
  const lowerCaseKeyType = schema.keyType.toLowerCase();

  switch (lowerCaseKeyType) {
    case 'array': {
      const results: any[] = [];

      // If user has requested a key which does not exist in the contract, value will be: 0x and value.find() will fail.
      if (!value || typeof value === 'string') {
        return results;
      }

      const valueElement = value.find((e) => e.key === schema.key);
      // Handle empty/non-existent array
      if (!valueElement) {
        return results;
      }

      const arrayLength =
        decodeKeyValue('Number', 'uint256', valueElement.value, schema.name) ||
        0;

      // This will not run if no match or arrayLength
      for (let index = 0; index < arrayLength; index++) {
        const dataElement = value.find(
          (e) => e.key === encodeArrayKey(schema.key, index),
        );

        if (dataElement) {
          results.push(
            decodeKeyValue(
              schema.valueContent,
              schema.valueType,
              dataElement.value,
              schema.name,
            ),
          );
        }
      } // end for loop

      return results;
    }
    case 'bytes20mapping':
    case 'bytes20mappingwithgrouping':
    case 'singleton':
    case 'mapping': {
      if (Array.isArray(value)) {
        const newValue = value.find((e) => e.key === schema.key);

        // Handle empty or non-values
        if (!newValue) {
          return null;
        }

        return decodeKeyValue(
          schema.valueContent,
          schema.valueType,
          newValue.value,
          schema.name,
        );
      }

      return decodeKeyValue(
        schema.valueContent,
        schema.valueType,
        value,
        schema.name,
      );
    }
    default: {
      console.error(
        'Incorrect data match or keyType in schema from decodeKey(): "' +
          schema.keyType +
          '"',
      );
      return null;
    }
  }
}

/**
 * @param schema schema is an array of objects of schema definitions
 * @param data data is an array of objects of key-value pairs
 *
 * @return: all decoded data as per required by the schema and provided data
 */
export function decodeData(
  data: Record<string, any>,
  schema: ERC725JSONSchema[],
) {
  return Object.entries(data).reduce((decodedData, [key, value]) => {
    const schemaElement = getSchemaElement(schema, key);

    return {
      ...decodedData,
      [schemaElement.name]: decodeKey(schemaElement, value),
    };
  }, {});
}

/**
 * @param schema an array of schema definitions as per ${@link ERC725JSONSchema}
 * @param data an object of key-value pairs
 */
export function encodeData(
  data: EncodeDataInput,
  schema: ERC725JSONSchema[],
): EncodeDataReturn {
  return Object.entries(data).reduce(
    (accumulator, [key, value]) => {
      const schemaElement = getSchemaElement(schema, key);

      const encodedValue = encodeKey(schemaElement, value as any);

      if (typeof encodedValue === 'string') {
        accumulator.keys.push(schemaElement.key);
        accumulator.values.push(encodedValue);
      } else if (encodedValue !== false && encodedValue !== null) {
        encodedValue.forEach((keyValuePair) => {
          accumulator.keys.push(keyValuePair.key);
          accumulator.values.push(keyValuePair.value);
        });
      }

      return accumulator;
    },
    { keys: [], values: [] } as EncodeDataReturn,
  );
}

export function getHashFunction(hashFunctionNameOrHash: string) {
  const hashFunction = HASH_FUNCTIONS[hashFunctionNameOrHash];

  if (!hashFunction) {
    throw new Error(
      `Chosen hashFunction '${hashFunctionNameOrHash}' is not supported.
      Supported hashFunctions: ${SUPPORTED_HASH_FUNCTIONS_LIST}
      `,
    );
  }

  return hashFunction;
}

export function hashData(
  data: string | Uint8Array | Record<string, any>,
  hashFunctionNameOrHash: SUPPORTED_HASH_FUNCTIONS,
): string {
  const hashFunction = getHashFunction(hashFunctionNameOrHash);

  return hashFunction.method(data);
}

/**
 * Hashes the data received with the specified hashing function,
 * and compares the result with the provided hash.
 */
export function isDataAuthentic(
  data: string | Uint8Array,
  expectedHash: string,
  lowerCaseHashFunction: SUPPORTED_HASH_FUNCTIONS,
): boolean {
  let dataHash: string;

  if (data instanceof Uint8Array) {
    dataHash = hashData(arrToBufArr(data), lowerCaseHashFunction);
  } else {
    dataHash = hashData(data, lowerCaseHashFunction);
  }

  if (dataHash !== expectedHash) {
    console.error(
      `Hash mismatch, returned JSON hash ("${dataHash}") is different from expected hash: "${expectedHash}"`,
    );
    return false;
  }

  return true;
}

/**
 * Transform the object containing the encoded data into an array ordered by keys,
 * for easier handling when writing the data to the blockchain.
 *
 * @param {{
 *   [key: string]: any;
 * }} encodedData This is essentially the object you receive when calling `encodeData(...)`
 * @return {*}  KeyValuePair[] An array of key-value objects
 */
export function flattenEncodedData(encodedData: {
  [key: string]: any;
}): KeyValuePair[] {
  return (
    Object.entries(encodedData)
      .reduce((keyValuePairs: any[], [, encodedDataElement]) => {
        if (Array.isArray(encodedDataElement.value)) {
          return keyValuePairs.concat(encodedDataElement.value);
        }
        keyValuePairs.push({
          key: encodedDataElement.key,
          value: encodedDataElement.value,
        });
        return keyValuePairs;
      }, [])
      // sort array of objects by keys, to not be dependent on the order of the object's keys
      .sort((a, b) => {
        if (a.key < b.key) return -1;
        return a.key > b.key ? 1 : 0;
      })
  );
}

/**
 * Transforms passed ipfsGateway url to correct format for fetching IPFS data
 *
 * @param ipfsGateway
 * @return {*}  string converted IPFS gateway URL
 */
export function convertIPFSGatewayUrl(ipfsGateway: string) {
  let convertedIPFSGateway = ipfsGateway;

  if (ipfsGateway.endsWith('/') && !ipfsGateway.endsWith('/ipfs/')) {
    convertedIPFSGateway = ipfsGateway + 'ipfs/';
  } else if (ipfsGateway.endsWith('/ipfs')) {
    convertedIPFSGateway = ipfsGateway + '/';
  } else if (!ipfsGateway.endsWith('/ipfs/')) {
    convertedIPFSGateway = ipfsGateway + '/ipfs/';
  }

  return convertedIPFSGateway;
}
