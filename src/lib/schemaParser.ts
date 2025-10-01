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
 * @file lib/schemaParser.ts
 * @author Hugo Masclet <@Hugoo>
 * @date 2022
 */
import { concat, Hex, isHex, keccak256, slice, toBytes } from 'viem';
import allSchemas from '../schemas';

import type {
  DynamicNameSchema,
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
} from '../types/ERC725JSONSchema';
import { dynamicTypesRegex, isDynamicKeyName } from './encodeKeyName';
import { decodeValueType } from './encoder';

const getSchemasByKeyType = (
  schemas: ERC725JSONSchema[],
): Record<ERC725JSONSchemaKeyType, ERC725JSONSchema[]> => {
  return {
    Singleton: schemas.filter((schema) => schema.keyType === 'Singleton'),
    Array: schemas.filter((schema) => schema.keyType === 'Array'),
    Mapping: schemas.filter((schema) => schema.keyType === 'Mapping'),
    MappingWithGrouping: schemas.filter(
      (schema) => schema.keyType === 'MappingWithGrouping',
    ),
  };
};

const fillDynamicKeyPart = (
  key: string,
  keySchema: ERC725JSONSchema | ERC725JSONSchema[],
): ERC725JSONSchema | DynamicNameSchema => {
  const fillOneDynamicKeyPart = (
    key: string,
    keySchema: ERC725JSONSchema,
    insertQuestionMarks = false,
  ) => {
    const result: DynamicNameSchema = {
      ...keySchema,
      key,
    };

    const keyNameParts = keySchema.name.split(':');
    const secondWordHex = key.substring(26);

    // 2. "Semi defined mappings" i.e. "SupportedStandards:??????"
    let dynamicPartName = '??????'; // default for "unknown"

    // replace dynamic placeholder in the map part (e.g: <address>, <bytes32>) with the hex value
    if (isDynamicKeyName(keySchema.name) && !insertQuestionMarks) {
      dynamicPartName = secondWordHex;

      let dynamicName = `${keyNameParts[0]}:0x${dynamicPartName}`;
      let dynamicKeyPart = `0x${secondWordHex}`;

      const dynamicPartType = keyNameParts[1].match(dynamicTypesRegex);

      if (dynamicPartType) {
        const byteSize =
          dynamicPartType[1] === 'uint' || dynamicPartType[1] === 'int'
            ? Number.parseInt(dynamicPartType[2]) / 8 // e.g: uint128 -> 128 / 8 -> 16 bytes
            : Number.parseInt(dynamicPartType[2]); // e.g: bytes8 -> 8 bytes

        if (byteSize < 20) {
          dynamicName = `${keyNameParts[0]}:0x${dynamicPartName.slice(0, byteSize * 2)}`;

          dynamicKeyPart = `0x${secondWordHex.slice(0, byteSize * 2)}`;
        }
      }

      result.dynamicName = dynamicName;
      result.dynamicKeyParts = dynamicKeyPart;

      return result;
    }

    // if first 20 bytes of the hash of second word in schema match,
    // display the map part as plain word
    if (
      concat([slice(keccak256(toBytes(keyNameParts[1])), 0, 10), '0x0000']) ===
      `0x${secondWordHex}`
    ) {
      dynamicPartName = keyNameParts[1];
    }

    // DO NOT MODIFY THE NAME OF THE SCHEMA ITEM
    // OTHERWISE WE CAN NO LONGER FIND THE CORRESPONDING SCHEMA BY NAME.
    // result.name = `$keyNameParts[0]:$dynamicPartName`;

    return result;
  };
  if (Array.isArray(keySchema)) {
    const firstWord = slice(key as Hex, 0, 12);
    const singleSchema = keySchema.find(
      // Use string slice here, because the key can have : or < separators.
      (schema) =>
        concat([schema.key.slice(0, 22) as Hex, '0x0000']) === firstWord,
    );
    if (singleSchema) {
      return fillOneDynamicKeyPart(key, singleSchema);
    }
    return fillOneDynamicKeyPart(key, keySchema[0], true);
  }
  return fillOneDynamicKeyPart(key, keySchema);
};

const findSingletonSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null => {
  return schemas.find((schema) => schema.key === key) || null;
};

const findArraySchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | DynamicNameSchema | null => {
  // Should detect:

  // 1. Initial key
  const initialKeySchema = schemas.find((schema) => schema.key === key) || null;

  if (initialKeySchema) {
    return initialKeySchema;
  }

  // 2. Subsequent keys
  const first16Bytes = slice(key as Hex, 0, 16);
  const last16Bytes = slice(key as Hex, 16);

  if (!isHex(first16Bytes) || !isHex(last16Bytes)) {
    return null;
  }

  const arraySchema =
    schemas.find(
      (schema) => slice(schema.key as Hex, 0, 16) === first16Bytes,
    ) || null;

  if (!arraySchema) {
    return null;
  }

  const index = decodeValueType('uint128', last16Bytes);

  return {
    ...arraySchema,
    key,
    dynamicName: arraySchema.name.replace('[]', `[${index}]`),
    dynamicKeyParts: last16Bytes,
    name: arraySchema.name,
    keyType: 'Singleton',
  };
};

const findMappingSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null => {
  const firstWordHex = key.substring(0, 26);
  // Should detect:

  // Known/defined mapping
  const keySchema = schemas.find((schema) => schema.key === key) || null;

  if (keySchema) {
    return fillDynamicKeyPart(key, keySchema);
  }

  const keySchemas = schemas.filter(
    (schema) => `${schema.key.substring(0, 22)}0000` === firstWordHex,
  );

  if (keySchemas.length === 0) {
    return null;
  }

  return fillDynamicKeyPart(key, keySchemas);
};

const findMappingWithGroupingSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | DynamicNameSchema | null => {
  let keySchema: DynamicNameSchema | null =
    schemas.find(
      (schema) => schema.key.substring(0, 26) === key.substring(0, 26),
    ) || null;

  if (keySchema) {
    keySchema = { ...keySchema };

    const keyNameParts = keySchema.name.split(':');

    const dynamicKeyPart = key.substring(26);

    if (isDynamicKeyName(keySchema.name)) {
      keySchema.dynamicName = `${keyNameParts[0]}:${keyNameParts[1]}:0x${dynamicKeyPart}`;
      keySchema.dynamicKeyParts = `0x${dynamicKeyPart}`;
    }

    return {
      ...keySchema,
      key,
    };
  }

  return null;
};

function schemaParser(
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null {
  const schemasByKeyType = getSchemasByKeyType(schemas);

  let foundSchema: ERC725JSONSchema | null = null;

  foundSchema = findSingletonSchemaForKey(key, schemasByKeyType.Singleton);

  if (foundSchema) {
    return foundSchema;
  }

  foundSchema = findArraySchemaForKey(key, schemasByKeyType.Array);

  if (foundSchema) {
    return foundSchema;
  }

  foundSchema = findMappingSchemaForKey(key, schemasByKeyType.Mapping);

  if (foundSchema) {
    return foundSchema;
  }

  foundSchema = findMappingWithGroupingSchemaForKey(
    key,
    schemasByKeyType.MappingWithGrouping,
  );

  return foundSchema;
}

export function getSchema(
  keyOrKeys: string | string[],
  providedSchemas?: ERC725JSONSchema[],
): ERC725JSONSchema | null | Record<string, ERC725JSONSchema | null> {
  let fullSchema: ERC725JSONSchema[] = allSchemas;
  if (providedSchemas) {
    fullSchema = providedSchemas.concat(fullSchema);
  }

  if (Array.isArray(keyOrKeys)) {
    return keyOrKeys.reduce<Record<string, ERC725JSONSchema | null>>(
      (acc, key) => {
        acc[key] = schemaParser(key, fullSchema);
        return acc;
      },
      {},
    );
  }

  return schemaParser(keyOrKeys, fullSchema);
}
