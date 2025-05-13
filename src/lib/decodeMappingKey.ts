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
 * @file lib/decodeMappingKey.ts
 * @author Samuel Videau <@samuel-videau>
 * @date 2022
 */

import { pad, isHex } from 'viem';
import { decodeValueType } from './encoder';
import type { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import type { DynamicKeyPart } from '../types/dynamicKeys';

function isDynamicKeyPart(keyPartName: string): boolean {
  return (
    keyPartName.slice(0, 1) === '<' &&
    keyPartName.slice(keyPartName.length - 1) === '>'
  );
}

/**
 * @param encodedKeyPart hashed dynamic key part
 * @param keyPartName part of a key name
 *
 * @return: the decoded value of the dynamic key part and its type (ie. 'address'; 'uint256', 'bytes32', etc)
 */
function decodeKeyPart(
  encodedKeyPart: string,
  keyPartName: string,
): DynamicKeyPart | false {
  if (!isDynamicKeyPart(keyPartName)) return false;

  let decodedKey: string | number | boolean | undefined;
  const type = keyPartName.slice(1, keyPartName.length - 1);
  if (type === 'bool') {
    decodedKey = encodedKeyPart.slice(encodedKeyPart.length - 1) === '1';
  } else if (type.includes('uint'))
    decodedKey = Number.parseInt(encodedKeyPart, 16);
  else if (type.includes('bytes')) {
    const byteLength = Number.parseInt(type.replace('bytes', ''), 10);
    decodedKey = pad(`0x${encodedKeyPart.slice(0, byteLength * 2)}`, {
      size: byteLength,
      dir: 'right',
    });
  } else if (type === 'address') {
    // this is required if the 2nd word is an address in a MappingWithGrouping
    const leftPaddedAddress = pad(`0x${encodedKeyPart}`, {
      size: 20,
      dir: 'left',
    });

    decodedKey = decodeValueType(type, leftPaddedAddress);
  } else {
    decodedKey = decodeValueType(type, encodedKeyPart);
  }

  return { type, value: decodedKey as string | number | boolean };
}

/**
 * @param keyHash hashed key with the dynamic parts
 * @param keyNameOrSchema key name of schema definitions or schema
 *
 * @return: all decoded dynamic key parts, with their type and value
 */
export function decodeMappingKey(
  keyHash: string,
  keyNameOrSchema: string | ERC725JSONSchema,
): DynamicKeyPart[] {
  let hashedKey = keyHash;
  if (hashedKey.length === 64 && hashedKey.slice(0, 2) !== '0x')
    hashedKey = `0x${hashedKey}`;

  if (hashedKey.length !== 66)
    throw new Error(
      'Invalid encodedKey length, key must be 32 bytes long hexadecimal value',
    );
  if (!isHex(hashedKey))
    throw new Error('Invalid encodedKey, must be a hexadecimal value');

  let keyParts: string[];

  if (typeof keyNameOrSchema === 'string')
    keyParts = keyNameOrSchema.split(':');
  else keyParts = keyNameOrSchema.name.split(':');

  if (keyParts.some((p) => p.includes('string'))) {
    throw new Error(
      "String dynamic key parts cannot be decoded, because it's formatted as a keccak256 hash",
    );
  }

  const dynamicParts: (DynamicKeyPart | false)[] = [];
  switch (keyParts.length) {
    case 2: // Mapping
      dynamicParts.push(decodeKeyPart(hashedKey.slice(26), keyParts[1]));
      break;

    case 3: // MappingWithGrouping
      dynamicParts.push(decodeKeyPart(hashedKey.slice(14, 22), keyParts[1]));
      dynamicParts.push(decodeKeyPart(hashedKey.slice(26), keyParts[2]));
      break;
    default:
      break;
  }

  return dynamicParts.filter((p) => p !== false) as DynamicKeyPart[];
}
