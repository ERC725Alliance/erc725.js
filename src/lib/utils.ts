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
  keccak256,
  numberToHex,
  padLeft,
} from 'web3-utils';

import { KeyValuePair } from '../types';
import {
  ERC725JSONSchema,
  GenericSchema,
  ERC725JSONSchemaKeyType,
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

type ERC725ObjectSchema = Pick<
  ERC725JSONSchema,
  'key' | 'keyType' | 'valueContent' | 'valueType' | 'name'
>;

/**
 *
 * @param schemaElementDefinition An object of the schema for this key
 * @param value can contain single value, or an object as required by schema (JSONURL, or ASSETURL)
 * @return the encoded value as per the schema
 */
export function encodeKeyValue(
  schemaElementDefinition: ERC725ObjectSchema,
  value: string,
) {
  // Check if existing in the supported valueContent mapping.
  if (
    !valueContentMap[schemaElementDefinition.valueContent] &&
    schemaElementDefinition.valueContent.substr(0, 2) !== '0x'
  ) {
    throw new Error(
      `The valueContent '${schemaElementDefinition.valueContent} 
            for ${schemaElementDefinition.name} is not supported.`,
    );
  }

  let result;
  const sameEncoding =
    valueContentMap[schemaElementDefinition.valueContent] &&
    valueContentMap[schemaElementDefinition.valueContent].type ===
      schemaElementDefinition.valueType.split('[]')[0];
  const isArray =
    schemaElementDefinition.valueType.substr(
      schemaElementDefinition.valueType.length - 2,
    ) === '[]';

  // We only loop if the valueType done by abi.encodeParameter can not handle it directly
  if (Array.isArray(value) && !sameEncoding) {
    // value type encoding will handle it?

    // we handle an array element encoding
    const results: (
      | string
      | {
          hashFunction: SUPPORTED_HASH_FUNCTIONS;
          hash: string;
          url: string;
        }
      | false
    )[] = [];
    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      results.push(
        encodeValueContent(schemaElementDefinition.valueContent, element),
      );
    }
    result = results;
  } else if (!isArray) {
    // Straight forward encode
    result = encodeValueContent(schemaElementDefinition.valueContent, value);
  } else if (sameEncoding) {
    result = value; // leaving this for below
  }

  if (
    // and we only skip bytes regardless
    schemaElementDefinition.valueType !== 'bytes' &&
    // Requires encoding because !sameEncoding means both encodings are required
    !sameEncoding
  ) {
    result = encodeValueType(schemaElementDefinition.valueType, result);
  } else if (isArray && sameEncoding) {
    result = encodeValueType(schemaElementDefinition.valueType, result);
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
  return key.substr(0, 34) + padLeft(numberToHex(index), 32).replace('0x', '');
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
    if (splittedKeyName[1].substr(0, 2) === '0x') {
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
 * @param name the schema element name
 * @return the name of the key encoded as per specifications
 * @return a string of the encoded schema name
 */
export function encodeKeyName(name: string) {
  const keyType = guessKeyTypeFromKeyName(name);

  switch (keyType) {
    case 'Bytes20MappingWithGrouping': {
      // bytes4(keccak256(FirstWord)) + bytes4(0) + bytes2(keccak256(SecondWord)) + bytes2(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).substr(0, 10) +
        '00000000' +
        keccak256(keyNameSplit[1]).substr(2, 4) +
        '0000' +
        keyNameSplit[2].substr(0, 40)
      );
    }
    case 'Bytes20Mapping': {
      // bytes8(keccak256(FirstWord)) + bytes4(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).substr(0, 18) +
        '00000000' +
        keyNameSplit[1].substr(2, 40)
      );
    }

    case 'Mapping': {
      // bytes16(keccak256(FirstWord)) + bytes12(0) + bytes4(keccak256(LastWord))
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).substr(0, 34) +
        '000000000000000000000000' +
        keccak256(keyNameSplit[1]).substr(2, 8)
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
 * @param schemas An array of ERC725JSONSchema objects
 * @param {string} key A string of either the schema element name, or key
 * @return The requested schema element from the full array of schemas
 */
export function getSchemaElement(schemas: ERC725JSONSchema[], key: string) {
  const keyHash = key.substr(0, 2) !== '0x' ? encodeKeyName(key) : key;
  const schemaElement = schemas.find((e) => e.key === keyHash);
  if (!schemaElement) {
    throw new Error(
      'No matching schema found for key: "' + key + '" (' + keyHash + ').',
    );
  }

  return schemaElement;
}

/**
 *
 * @param schema An object of a schema definition that must have a keyType of 'Array'
 * @param index The index of the array element to transpose the schema to
 * @return Modified schema element of keyType 'Singleton' for fetching or decoding/encoding the array element
 */
export function transposeArraySchema(
  schema: ERC725JSONSchema,
  index: number,
): ERC725ObjectSchema {
  if (schema.keyType.toLowerCase() !== 'array') {
    console.error(
      'Schema is not of keyType "Array" for schema: "' + schema.name + '".',
    );
  }

  return {
    name: schema.name,
    key: encodeArrayKey(schema.key, index),
    keyType: 'Singleton',
    // TODO: This can be solved by defining an extra "Erc725ArraySchema" for array
    // @ts-ignore
    valueContent: schema.elementValueContent,
    // @ts-ignore
    valueType: schema.elementValueType,
  };
}

/**
 *
 * @param schema is an object of a schema definitions
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton
 * @return the encoded value for the key as per the supplied schema
 */
export function encodeKey(schema: ERC725JSONSchema, value) {
  // NOTE: This will not guarantee order of array as on chain. Assumes developer must set correct order

  const lowerCaseKeyType = schema.keyType.toLowerCase();

  switch (lowerCaseKeyType) {
    case 'array': {
      if (!Array.isArray(value)) {
        console.error("Can't encode a non array for key of type array");
      }

      const results: { key: string; value: string }[] = [];

      for (let index = 0; index < value.length; index++) {
        const dataElement = value[index];
        if (index === 0) {
          // This is arrayLength as the first element in the raw array
          results.push({
            key: schema.key,
            // @ts-ignore
            value: encodeKeyValue(schema, value.length), // the array length
          });
        }

        const newSchema = transposeArraySchema(schema, index);
        results.push({
          key: newSchema.key,
          value: encodeKeyValue(newSchema, dataElement),
        });
      }

      return results;
    }
    case 'bytes20mapping':
    case 'bytes20mappingwithgrouping':
    case 'singleton':
    case 'mapping':
      return encodeKeyValue(schema, value);
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
 * @param schemaElementDefinition An object of the schema for this key
 * @param value the value to decode
 * @return the decoded value as per the schema
 */
export function decodeKeyValue(schemaElementDefinition, value) {
  // Check for the missing map.
  if (
    !valueContentMap[schemaElementDefinition.valueContent] &&
    schemaElementDefinition.valueContent.substr(0, 2) !== '0x'
  ) {
    throw new Error(
      'The valueContent "' +
        schemaElementDefinition.valueContent +
        '" for "' +
        schemaElementDefinition.name +
        '" is not supported.',
    );
  }

  let sameEncoding =
    valueContentMap[schemaElementDefinition.valueContent] &&
    valueContentMap[schemaElementDefinition.valueContent].type ===
      schemaElementDefinition.valueType.split('[]')[0];
  const isArray =
    schemaElementDefinition.valueType.substr(
      schemaElementDefinition.valueType.length - 2,
    ) === '[]';

  // VALUE TYPE
  if (
    schemaElementDefinition.valueType !== 'bytes' && // we ignore because all is decoded by bytes to start with (abi)
    schemaElementDefinition.valueType !== 'string' &&
    !isAddress(value) // checks for addresses, since technically an address is bytes?
  ) {
    // eslint-disable-next-line no-param-reassign
    value = decodeValueType(schemaElementDefinition.valueType, value);
  }

  // As per exception above, if address and sameEncoding, then the address still needs to be handled
  if (sameEncoding && isAddress(value) && !checkAddressChecksum(value)) {
    sameEncoding = !sameEncoding;
  }

  if (sameEncoding && schemaElementDefinition.valueType !== 'string') {
    return value;
  }

  // VALUE CONTENT
  // We are finished if duplicated encoding methods

  if (isArray && Array.isArray(value)) {
    // value must be an array also
    const results: (string | false)[] = [];

    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      results.push(
        decodeValueContent(schemaElementDefinition.valueContent, element),
      );
    }

    return results;
  }

  return decodeValueContent(schemaElementDefinition.valueContent, value);
}

/**
 *
 * @param schema is an object of a schema definitions
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton
 * @return the decoded value/values as per the schema definition
 */
export function decodeKey(schema: ERC725JSONSchema, value) {
  const lowerCaseKeyType = schema.keyType.toLowerCase();

  switch (lowerCaseKeyType) {
    case 'array': {
      const results: any[] = [];
      const valueElement = value.find((e) => e.key === schema.key);
      // Handle empty/non-existent array
      if (!valueElement) {
        return results;
      }

      const arrayLength = decodeKeyValue(schema, valueElement.value) || 0;

      // This will not run if no match or arrayLength
      for (let index = 0; index < arrayLength; index++) {
        const newSchema = transposeArraySchema(schema, index);
        const dataElement = value.find((e) => e.key === newSchema.key);

        if (dataElement) {
          results.push(decodeKeyValue(newSchema, dataElement.value));
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

        return decodeKeyValue(schema, newValue.value);
      }

      return decodeKeyValue(schema, value);
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
 *
 * @param schema schema is an array of objects of schema definitions
 * @param data data is an array of objects of key-value pairs
 * @return: all decoded data as per required by the schema and provided data
 */
export function decodeData<
  Schema extends GenericSchema,
  T extends keyof Schema,
>(
  data: { [K in T]: Schema[T]['decodeData']['inputTypes'] },
  schema: ERC725JSONSchema[],
): { [K in T]: Schema[T]['decodeData']['returnValues'] } {
  return Object.entries(data).reduce((decodedData, [key, value]) => {
    const schemaElement = getSchemaElement(schema, key);

    return {
      ...decodedData,
      [schemaElement.name]: decodeKey(
        schemaElement,
        value,
      ) as Schema[T]['decodeData']['returnValues'],
    };
  }, {} as any);
}

/**
 * @param schema an array of schema definitions as per ${@link ERC725JSONSchema}
 * @param data an object of key-value pairs
 */
export function encodeData<
  Schema extends GenericSchema,
  T extends keyof Schema,
>(
  data: { [K in T]: Schema[T]['encodeData']['inputTypes'] },
  schema: ERC725JSONSchema[],
): { [K in T]: Schema[T]['encodeData']['returnValues'] } {
  return Object.entries(data).reduce((accumulator, [key, value]) => {
    const schemaElement = getSchemaElement(schema, key);

    accumulator[key] = {
      value: encodeKey(schemaElement, value),
      key: schemaElement.key,
    };

    return accumulator;
  }, {} as any);
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
  data: unknown,
  hashFunctionNameOrHash: SUPPORTED_HASH_FUNCTIONS,
): string {
  const hashFunction = getHashFunction(hashFunctionNameOrHash);

  return hashFunction.method(data);
}

/**
 * Hashes the data received with the specified hashing function,
 * and compares the result with the provided hash.
 *
 * @throws *Error* in case of a mismatch of the hashes.
 */
export function isDataAuthentic(
  data,
  expectedHash: string,
  lowerCaseHashFunction: SUPPORTED_HASH_FUNCTIONS,
) {
  const jsonHash = hashData(data, lowerCaseHashFunction);

  if (jsonHash !== expectedHash) {
    console.error(
      `Hash mismatch, returned JSON hash ("${jsonHash}") is different from expected hash "${expectedHash}"`,
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
