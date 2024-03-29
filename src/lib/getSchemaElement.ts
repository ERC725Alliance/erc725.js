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
 * @file lib/getSchemaElement.ts
 * @author Hugo Masclet <@Hugoo>
 * @date 2021
 */

import { isHex, isHexStrict } from 'web3-validator';
import { DynamicKeyParts } from '../types/dynamicKeys';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import {
  encodeKeyName,
  generateDynamicKeyName,
  isDynamicKeyName,
} from './encodeKeyName';

/**
 *
 * @param schemas
 * @param namedDynamicKey
 * @param dynamicKeyParts
 * @returns
 */
const getSchemaElementForDynamicKeyName = (
  schemas: ERC725JSONSchema[],
  namedDynamicKey: string,
  dynamicKeyParts: DynamicKeyParts,
): ERC725JSONSchema => {
  // In that case, we will generate a new schema element with the final computed name and encoded key hash.

  const schemaElement = schemas.find((e) => e.name === namedDynamicKey);

  if (!schemaElement) {
    throw new Error(
      `No matching schema found for dynamic key: ${namedDynamicKey}`,
    );
  }

  // once we have the schemaElement with dynamic parts, we need to replace the name and the key:

  const key = encodeKeyName(namedDynamicKey, dynamicKeyParts);
  const name = generateDynamicKeyName(namedDynamicKey, dynamicKeyParts);

  return {
    ...schemaElement,
    key,
    name,
  };
};

/**
 *
 * @param schemas An array of ERC725JSONSchema objects.
 * @param {string} namedOrHashedKey A string of either the schema element name, or hashed key (with or without the 0x prefix).
 * @param dynamicKeyParts if a dynamic named key is given, you should also set the dynamicKeyParts.
 *
 * @return The requested schema element from the full array of schemas.
 */
export function getSchemaElement(
  schemas: ERC725JSONSchema[],
  namedOrHashedKey: string,
  dynamicKeyParts?: DynamicKeyParts,
): ERC725JSONSchema {
  let keyHash: string;

  if (isDynamicKeyName(namedOrHashedKey)) {
    if (!dynamicKeyParts) {
      throw new Error(
        `Can't getSchemaElement for dynamic key: ${namedOrHashedKey} without dynamicKeyParts.`,
      );
    }
    return getSchemaElementForDynamicKeyName(
      schemas,
      namedOrHashedKey,
      dynamicKeyParts,
    );
  }

  if (isHex(namedOrHashedKey)) {
    keyHash = isHexStrict(namedOrHashedKey)
      ? namedOrHashedKey
      : `0x${namedOrHashedKey}`;
  } else {
    keyHash = encodeKeyName(namedOrHashedKey);
  }

  const schemaElement = schemas.find((e) => e.key === keyHash);

  if (!schemaElement) {
    throw new Error(
      `No matching schema found for key: ${namedOrHashedKey} (${keyHash}).`,
    );
  }

  return schemaElement;
}
