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
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @date 2020
 */

import {
  checkAddressChecksum,
  isAddress,
  numberToHex,
  padLeft,
  stripHexPrefix,
} from 'web3-utils';
import { arrToBufArr } from 'ethereumjs-util';

import {
  JSONURLDataToEncode,
  EncodeDataReturn,
  URLDataWithHash,
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
  COMPACT_BYTES_ARRAY_STRING,
} from '../constants/constants';
import {
  decodeValueContent,
  decodeValueType,
  encodeValueContent,
  encodeValueType,
  valueContentEncodingMap as valueContentMap,
} from './encoder';
import { AssetURLEncode } from '../types/encodeData';
import { isDynamicKeyName } from './encodeKeyName';
import { getSchemaElement } from './getSchemaElement';
import { EncodeDataInput } from '../types/decodeData';
import { GetDataDynamicKey } from '../types/GetData';
import { isValidTuple } from './decodeData';

/**
 *
 * @param {string} valueContent as per ERC725Schema definition
 * @param {string} valueType as per ERC725Schema definition
 * @param decodedValue can contain single value, an array, or an object as required by schema (JSONURL, or ASSETURL)
 * @param {string} [name]
 *
 * @return the encoded value as per the schema
 */
export function encodeKeyValue(
  valueContent: string,
  valueType: ERC725JSONSchemaValueType,
  decodedValue:
    | string
    | string[]
    | number
    | number[]
    | JSONURLDataToEncode
    | JSONURLDataToEncode[]
    | boolean,
  name?: string,
): string | false {
  const isSupportedValueContent =
    !!valueContentMap(valueContent) || valueContent.slice(0, 2) === '0x';

  if (!isSupportedValueContent) {
    throw new Error(
      `The valueContent '${valueContent}' 
            for ${name} is not supported.`,
    );
  }

  const isValueTypeArray = valueType.slice(valueType.length - 2) === '[]';

  if (!isValueTypeArray && !Array.isArray(decodedValue)) {
    // Straight forward encode
    return encodeValueContent(valueContent, decodedValue);
  }

  const valueContentEncodingMethods = valueContentMap(valueContent);

  const isSameEncoding =
    valueContentEncodingMethods &&
    valueContentEncodingMethods.type === valueType.split('[]')[0];

  let result;

  // We only loop if the valueType done by abi.encodeParameter can not handle it directly
  if (Array.isArray(decodedValue)) {
    // value type encoding will handle it?

    // we handle an array element encoding
    const results: Array<string | AssetURLEncode | false> = [];
    for (let index = 0; index < decodedValue.length; index++) {
      const element = decodedValue[index];
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
    result = encodeValueType(valueType, decodedValue as any);
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
    return 'MappingWithGrouping';
  }

  if (splittedKeyName.length === 2) {
    return 'Mapping';
  }

  if (keyName.substring(keyName.length - 2, keyName.length) === '[]') {
    return 'Array';
  }

  return 'Singleton';
}

export const encodeTupleKeyValue = (
  valueContent: string, // i.e. (bytes4,Number,bytes16)
  valueType: string, // i.e. (bytes4,bytes8,bytes16)
  decodedValues: Array<string | number | JSONURLDataToEncode | string[]>,
) => {
  // We assume data has already been validated at this stage

  const valueTypeParts = valueType
    .substring(1, valueType.length - 1)
    .split(',');
  const valueContentParts = valueContent
    .substring(1, valueContent.length - 1)
    .split(',');

  if (valueTypeParts.length !== decodedValues.length) {
    throw new Error(
      `Can not encode tuple key value: ${decodedValues}. Expecte array of length: ${valueTypeParts.length}`,
    );
  }

  const returnValue =
    `0x` +
    valueContentParts
      .map((valueContentPart, i) => {
        const encodedKeyValue = encodeKeyValue(
          valueContentPart,
          valueTypeParts[i],
          decodedValues[i],
        );

        if (!encodedKeyValue) {
          return ''; // may cause issues?
        }

        const numberOfBytes = parseInt(valueTypeParts[i].substring(5), 10); // bytes50 -> 50

        // If the encoded value is too large for the expected valueType, we shrink it from the left
        // i.e. number are encoded on 32bytes
        // TODO: might be missing cases !
        if (encodedKeyValue.length > 2 + numberOfBytes * 2) {
          return encodedKeyValue.slice(
            encodedKeyValue.length - numberOfBytes * 2,
          );
        }

        return padLeft(encodedKeyValue, numberOfBytes * 2).replace('0x', '');
      })
      .join('');

  return returnValue;
};

/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the encoded value for the key as per the supplied schema.
 */
export function encodeKey(
  schema: ERC725JSONSchema,
  value:
    | string
    | number
    | (string | number)[]
    | string[][]
    | JSONURLDataToEncode
    | JSONURLDataToEncode[]
    | boolean,
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
          // encoded as uint128
          results.push({
            key: schema.key,
            value: encodeValueType('uint128', value.length),
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
    case 'mappingwithgrouping':
    case 'singleton':
    case 'mapping':
      if (isValidTuple(schema.valueType, schema.valueContent)) {
        if (!Array.isArray(value)) {
          throw new Error(
            `Incorrect value for tuple. Got: ${value}, expected array.`,
          );
        }

        const isCompactBytesArray: boolean = schema.valueType.includes(
          COMPACT_BYTES_ARRAY_STRING,
        );

        if (Array.isArray(value[0]) && isCompactBytesArray) {
          const valueType = schema.valueType.replace(
            COMPACT_BYTES_ARRAY_STRING,
            '',
          );
          const valueContent = schema.valueContent.replace(
            COMPACT_BYTES_ARRAY_STRING,
            '',
          );

          const encodedTuples = value.map((element) => {
            return encodeTupleKeyValue(valueContent, valueType, element);
          });
          return encodeValueType('bytes[CompactBytesArray]', encodedTuples);
        }

        return encodeTupleKeyValue(
          schema.valueContent,
          schema.valueType,
          value,
        );
      }

      // This adds an extra check to ensure the casting below is safe
      // TODO: refactor to fix the TS typing.
      if (
        Array.isArray(value) &&
        Array.isArray(value[0]) &&
        !isValidTuple(schema.valueType, schema.valueContent)
      ) {
        throw new Error('Incorrect value for nested array: not a tuple.');
      }

      return encodeKeyValue(
        schema.valueContent,
        schema.valueType,
        value as
          | string
          | string[]
          | number
          | number[]
          | JSONURLDataToEncode
          | JSONURLDataToEncode[],
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
  const valueContentEncodingMethods = valueContentMap(valueContent);

  if (!valueContentEncodingMethods && valueContent.slice(0, 2) !== '0x') {
    throw new Error(
      'The valueContent "' +
        valueContent +
        '" for "' +
        name +
        '" is not supported.',
    );
  }

  let sameEncoding =
    valueContentEncodingMethods &&
    valueContentEncodingMethods.type === valueType.split('[]')[0];
  const isArray = valueType.substring(valueType.length - 2) === '[]';

  // VALUE TYPE
  const valueTypeIsBytesNonArray =
    valueType.slice(0, 5) === 'bytes' && valueType.slice(-2) !== '[]';

  if (
    !valueTypeIsBytesNonArray &&
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
    const results: (string | URLDataWithHash | number | null | boolean)[] = [];

    for (let index = 0; index < value.length; index++) {
      const element = value[index];
      results.push(decodeValueContent(valueContent, element));
    }

    return results;
  }

  return decodeValueContent(valueContent, value);
}

/**
 * @param schema an array of schema definitions as per ${@link ERC725JSONSchema}
 * @param data an object of key-value pairs
 */
export function encodeData(
  data: EncodeDataInput | EncodeDataInput[],
  schema: ERC725JSONSchema[],
): EncodeDataReturn {
  const dataAsArray = Array.isArray(data) ? data : [data];

  return dataAsArray.reduce(
    (accumulator, { keyName, value, dynamicKeyParts }) => {
      let schemaElement: ERC725JSONSchema | null = null;
      let encodedValue; // would be nice to type this

      // Switch between non dynamic and dynamic keys:
      if (isDynamicKeyName(keyName)) {
        // In case of a dynamic key, we need to check if the value is of type DynamicKeyPartIntput.
        if (!dynamicKeyParts) {
          throw new Error(
            `Can't encodeData for dynamic key: ${keyName} with non dynamic values. Got: ${value}, expected object.`,
          );
        }

        schemaElement = getSchemaElement(schema, keyName, dynamicKeyParts);
        encodedValue = encodeKey(schemaElement, value);
      } else {
        schemaElement = getSchemaElement(schema, keyName);
        encodedValue = encodeKey(schemaElement, value as any);
      }

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
      `Chosen hashFunction '${hashFunctionNameOrHash}' is not supported. Supported hashFunctions: ${SUPPORTED_HASH_FUNCTIONS_LIST}`,
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

/**
 * Given a list of keys (dynamic or not) and a list of schemas with dynamic keys, it will
 * generate a "final"/non dynamic schemas list.
 */
export const generateSchemasFromDynamicKeys = (
  keyNames: Array<string | GetDataDynamicKey>,
  schemas: ERC725JSONSchema[],
) => {
  return keyNames.map((keyName) => {
    if (typeof keyName === 'string') {
      return getSchemaElement(schemas, keyName);
    }
    return getSchemaElement(schemas, keyName.keyName, keyName.dynamicKeyParts);
  });
};

/**
 * Changes the protocol from `ipfs://` to `http(s)://` and adds the selected IPFS gateway.
 * `ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D => https://ipfs.lukso.network/ipfs/QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D`
 */
export function patchIPFSUrlsIfApplicable(
  receivedData: URLDataWithHash,
  ipfsGateway: string,
): URLDataWithHash {
  if (
    receivedData &&
    receivedData.url &&
    receivedData.url.indexOf('ipfs://') !== -1
  ) {
    return {
      ...receivedData,
      url: receivedData.url.replace('ipfs://', ipfsGateway),
    };
  }

  return receivedData;
}

export function countNumberOfBytes(data: string) {
  return stripHexPrefix(data).length / 2;
}
