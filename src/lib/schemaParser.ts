/**
 * @file schemaParser.ts
 * @author Hugo Masclet <@Hugoo>
 * @date 2022
 */

import allSchemas from '../schemas';

import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
} from '../types/ERC725JSONSchema';

const getSchemasByKeyType = (
  schemas: ERC725JSONSchema[],
): Record<ERC725JSONSchemaKeyType, ERC725JSONSchema[]> => {
  return {
    Singleton: schemas.filter((schema) => schema.keyType === 'Singleton'),
    Array: schemas.filter((schema) => schema.keyType === 'Array'),
    Mapping: schemas.filter((schema) => schema.keyType === 'Mapping'),
    Bytes20Mapping: schemas.filter(
      (schema) => schema.keyType === 'Bytes20Mapping',
    ),
    Bytes20MappingWithGrouping: schemas.filter(
      (schema) => schema.keyType === 'Bytes20MappingWithGrouping',
    ),
  };
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
): ERC725JSONSchema | null => {
  // Should detect:

  // 1. Initial key
  const initialKeySchema = schemas.find((schema) => schema.key === key) || null;

  if (initialKeySchema) {
    return initialKeySchema;
  }

  // 2. Subsequent keys
  const bytes16Key = key.slice(0, 34);
  const arraySchema =
    schemas.find((schema) => schema.key.slice(0, 34) === bytes16Key) || null;

  if (!arraySchema) {
    return null;
  }

  // https://stackoverflow.com/a/1779019/651299
  if (!/^\d+$/.test(key.slice(34))) {
    return null;
  }

  const elementIndex = parseInt(key.slice(34), 10);

  return {
    ...arraySchema,
    key,
    name: arraySchema.name.replace('[]', `[${elementIndex}]`),
    keyType: 'Singleton',
  };
};

const findMappingSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null => {
  // Should detect:

  // 1. Known/defined mapping
  let keySchema = schemas.find((schema) => schema.key === key) || null;

  if (keySchema) {
    return keySchema;
  }

  // 2. "Semi defined mappings" i.e. "SupportedStandards:??????"
  keySchema =
    schemas.find((schema) => schema.key.substr(0, 58) === key.substr(0, 58)) ||
    null;

  if (!keySchema) {
    return null;
  }

  return {
    ...keySchema,
    name: `${keySchema.name.split(':')[0]}:??????`,
    key,
  };
};

const findBytes20MappingSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null => {
  const keySchema =
    schemas.find((schema) => schema.key.substr(0, 26) === key.substr(0, 26)) ||
    null;

  const address = key.substr(26);

  if (keySchema) {
    return {
      ...keySchema,
      key,
      name: `${keySchema.name.substr(
        0,
        keySchema.name.lastIndexOf(':'),
      )}:${address}`,
    };
  }

  return null;
};

const findBytes20MappingWithGroupingSchemaForKey = (
  key: string,
  schemas: ERC725JSONSchema[],
): ERC725JSONSchema | null => {
  const keySchema =
    schemas.find((schema) => schema.key.substr(0, 26) === key.substr(0, 26)) ||
    null;

  const address = key.substr(26);

  if (keySchema) {
    return {
      ...keySchema,
      key,
      name: `${keySchema.name.substr(
        0,
        keySchema.name.lastIndexOf(':'),
      )}:${address}`,
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

  foundSchema = findBytes20MappingSchemaForKey(
    key,
    schemasByKeyType.Bytes20Mapping,
  );

  if (foundSchema) {
    return foundSchema;
  }

  foundSchema = findBytes20MappingWithGroupingSchemaForKey(
    key,
    schemasByKeyType.Bytes20MappingWithGrouping,
  );

  return foundSchema;
}

export function getSchema(
  keyOrKeys: string | string[],
  providedSchemas?: ERC725JSONSchema[],
): ERC725JSONSchema | null | Record<string, ERC725JSONSchema | null> {
  let fullSchema: ERC725JSONSchema[] = allSchemas;
  if (providedSchemas) {
    fullSchema = fullSchema.concat(providedSchemas);
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
