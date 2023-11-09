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
 * @file lib/decodeData.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
 * @date 2023
 */
import { isHexStrict } from 'web3-utils';
import { COMPACT_BYTES_ARRAY_STRING } from '../constants/constants';

import { DecodeDataInput, DecodeDataOutput } from '../types/decodeData';
import {
  ALL_VALUE_TYPES,
  ERC725JSONSchema,
  isValidValueType,
} from '../types/ERC725JSONSchema';
import { isDynamicKeyName } from './encodeKeyName';
import { valueContentEncodingMap, decodeValueType } from './encoder';
import { getSchemaElement } from './getSchemaElement';
import { decodeKeyValue, encodeArrayKey } from './utils';

const tupleValueTypesRegex = /bytes(\d+)/;
const valueContentsBytesRegex = /Bytes(\d+)/;

const isValidTupleDefinition = (tupleContent: string): boolean => {
  if (tupleContent.length <= 2) {
    return false;
  }
  if (
    tupleContent[0] !== '(' &&
    tupleContent[tupleContent.length - 1] !== ')'
  ) {
    return false;
  }

  return true;
};

const extractTupleElements = (tupleContent: string): string[] =>
  tupleContent.substring(1, tupleContent.length - 1).split(',');

const extractTupleElements = (tupleContent: string): string[] =>
  tupleContent.substring(1, tupleContent.length - 1).split(',');

export const isValidTuple = (valueType: string, valueContent: string) => {
  if (
    !isValidTupleDefinition(valueType) ||
    !isValidTupleDefinition(valueContent)
  ) {
    return false;
  }

  // At this stage, we can assume the user is trying to use a tuple,
  // let's throw errors instead of returning false

  // Sanitize the string to keep only the tuple, if we are dealing with `CompactBytesArray`
  const valueTypeToDecode = valueType.replace(COMPACT_BYTES_ARRAY_STRING, '');

  const valueTypeParts = extractTupleElements(valueTypeToDecode);
  const valueContentParts = extractTupleElements(valueContent);

  if (valueTypeParts.length !== valueContentParts.length) {
    throw new Error(
      `Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. They should have the same number of elements. Got: ${valueTypeParts.length} and ${valueContentParts.length}`,
    );
  }

  for (let i = 0; i < valueTypeParts.length; i++) {
    if (!isValidValueType(valueTypeParts[i])) {
      throw new Error(
        `Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. Type: ${valueTypeParts[i]} is not valid. Valid types are: ${ALL_VALUE_TYPES}`,
      );
    }

    const valueTypeBytesLength = valueTypeParts[i].split('bytes')[1];

    if (
      valueTypeParts[i].match(tupleValueTypesRegex) &&
      valueContentParts[i].match(valueContentsBytesRegex)
    ) {
      const valueContentBytesLength = valueContentParts[i].slice(5);

      if (valueTypeBytesLength > valueContentBytesLength) {
        throw new Error(
          `Invalid tuple (${valueType},${valueContent}: ${valueType[i]} cannot fit in ${valueContent[i]}`,
        );
      }
    }

    if (
      valueContentEncodingMap(valueContentParts[i]).type === 'unknown' &&
      valueContentParts[i].slice(0, 5) !== 'Bytes' &&
      valueContentParts[i].slice(0, 2) !== '0x'
    ) {
      throw new Error(
        `Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. valueContent of type: ${valueContentParts[i]} is not valid`,
      );
    }

    if (isHexStrict(valueContentParts[i])) {
      // check if length of a hex literal in valueContent (e.g: 0x122334455)
      // is compatible with the valueType (e.g: bytes4)
      const hexLiteralLength = valueContentParts[i].length - 2;

      if (parseInt(valueTypeBytesLength, 10) < hexLiteralLength) {
        throw new Error(
          `Invalid tuple (${valueType},${valueContent}: ${valueContent[i]} cannot fit in ${valueType[i]}`,
        );
      }
    } else if (valueContentParts[i].startsWith('0x')) {
      // Value starts with 0x bit is not hex... hmmm... weird :)
      throw new Error(
        `Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. valueContent of type: ${valueContentParts[i]} is not a valid hex value`,
      );
    }
  }

  return true;
};

export const decodeTupleKeyValue = (
  valueContent: string, // i.e. (bytes4,Number,bytes16)
  valueType: string, // i.e. (bytes4,bytes8,bytes16)
  value: string, // should start with 0x
): Array<string> => {
  // We assume data has already been validated at this stage

  // Sanitize the string to keep only the tuple, if we are dealing with `CompactBytesArray`
  const valueTypeToDecode = valueType.replace(COMPACT_BYTES_ARRAY_STRING, '');

  const valueTypeParts = extractTupleElements(valueTypeToDecode);
  const valueContentParts = extractTupleElements(valueContent);

  const bytesLengths: number[] = [];

  valueTypeParts.forEach((valueTypePart) => {
    const regexMatch = valueTypePart.match(tupleValueTypesRegex);

    // if we are dealing with `bytesN`
    if (regexMatch) bytesLengths.push(parseInt(regexMatch[1], 10));

    if (valueTypePart === 'address') bytesLengths.push(20);
  });

  const totalBytesLength = bytesLengths.reduce(
    (acc, bytesLength) => acc + bytesLength,
    0,
  );

  if (value.length !== 2 + totalBytesLength * 2) {
    console.error(
      `Trying to decode a value: ${value} which does not match the length of the valueType: ${valueType}. Expected ${totalBytesLength} bytes.`,
    );
    return [];
  }

  let cursor = 2; // to skip the 0x

  const valueParts = bytesLengths.map((bytesLength) => {
    const splitValue = value.substring(cursor, cursor + bytesLength * 2);
    cursor += bytesLength * 2;
    return `0x${splitValue}`;
  });

  return valueContentParts.map((valueContentPart, i) =>
    decodeKeyValue(valueContentPart, valueTypeParts[i], valueParts[i]),
  );
};

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
        decodeKeyValue('Number', 'uint128', valueElement.value, schema.name) ||
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
    case 'mappingwithgrouping':
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

      if (schema.valueType.includes(COMPACT_BYTES_ARRAY_STRING)) {
        const valueType = schema.valueType.replace(
          COMPACT_BYTES_ARRAY_STRING,
          '',
        );
        const valueContent = schema.valueContent.replace(
          COMPACT_BYTES_ARRAY_STRING,
          '',
        );

        if (valueType[0] === '(' && valueType[valueType.length - 1] === ')') {
          const decodedCompactBytesArray = decodeValueType(
            'bytes[CompactBytesArray]',
            value,
          );
          return decodedCompactBytesArray.map((element) =>
            decodeTupleKeyValue(valueContent, valueType, element),
          );
        }
        return decodeValueType(schema.valueType, value);
      }

      if (isValidTuple(schema.valueType, schema.valueContent)) {
        return decodeTupleKeyValue(
          schema.valueContent,
          schema.valueType,
          value,
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
  data: DecodeDataInput[],
  schema: ERC725JSONSchema[],
): DecodeDataOutput[];
export function decodeData(
  data: DecodeDataInput,
  schema: ERC725JSONSchema[],
): DecodeDataOutput;
export function decodeData(
  data: DecodeDataInput | DecodeDataInput[],
  schema: ERC725JSONSchema[],
): DecodeDataOutput | DecodeDataOutput[] {
  const processDataInput = ({
    keyName,
    dynamicKeyParts,
    value,
  }: DecodeDataInput) => {
    const isDynamic = isDynamicKeyName(keyName);

    let schemaElement: ERC725JSONSchema;
    if (isDynamic) {
      schemaElement = getSchemaElement(schema, keyName, dynamicKeyParts);

      // NOTE: it might be confusing to use as the output will contain other keys as the ones used
      // for the input
      return {
        key: schemaElement.key,
        name: schemaElement.name,
        value: decodeKey(schemaElement, value),
      };
    }

    schemaElement = getSchemaElement(schema, keyName);

    return {
      key: schemaElement.key,
      name: schemaElement.name,
      value: decodeKey(schemaElement, value),
    };
  };

  if (Array.isArray(data)) {
    return data.map((dataInput) => processDataInput(dataInput));
  }

  return processDataInput(data);
}
