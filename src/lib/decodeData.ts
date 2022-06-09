import { DecodeDataInput, DecodeDataOutput } from '../types/decodeData';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { isDynamicKeyName } from './encodeKeyName';
import { getSchemaElement } from './getSchemaElement';
import { decodeKeyValue, encodeArrayKey } from './utils';

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
