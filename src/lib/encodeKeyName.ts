import {
  isAddress,
  isHex,
  keccak256,
  leftPad,
  numberToHex,
  padLeft,
} from 'web3-utils';

import { guessKeyTypeFromKeyName } from './utils';

// https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping

const dynamicTypes = ['<string>', '<address>', '<bool>'];

// https://docs.soliditylang.org/en/v0.8.14/abi-spec.html#types
const dynamicTypesRegex = /<(uint|int|bytes)(\d+)>/;

/**
 *
 * @param type <string>, <uintM>, <intM>, <bool>, <bytesM>, <address>.
 * @param value
 * @param bytes the number of bytes to keep / padding
 */
export const encodeDynamicKeyPart = (
  type: string,
  value: string,
  bytes: number,
) => {
  let baseType = '';
  let size = 0;

  if (['<string>', '<bool>', '<address>'].includes(type)) {
    baseType = type.slice(1, -1);
  } else {
    const regexMatch = type.match(dynamicTypesRegex);

    if (!regexMatch) {
      throw new Error(`Dynamic key: ${type} is not supported`);
    }

    // eslint-disable-next-line prefer-destructuring
    baseType = regexMatch[1];
    size = parseInt(regexMatch[2], 10);
  }

  switch (baseType) {
    case 'string':
      return keccak256(value).slice(2, 2 + bytes * 2);
    case 'bool': {
      if (value !== 'true' && value !== 'false') {
        throw new Error(
          `Wrong value: ${value} for dynamic key with type: <bool>. Expected "true" or "false".`,
        );
      }
      return leftPad(+(value === 'true'), bytes * 2).slice(2);
    }
    case 'address': {
      if (!isAddress(value)) {
        throw new Error(
          `Wrong value: ${value} for dynamic key with type: <address>. Value is not an address.`,
        );
      }

      if (bytes > 20) {
        return leftPad(value.replace('0x', ''), bytes * 2);
      }

      return value.replace('0x', '').slice(0, bytes * 2);
    }
    case 'uint': {
      if (size > 256 || size % 8 !== 0) {
        throw new Error(
          `Wrong dynamic key type: ${type}. 0 < M <= 256, M % 8 == 0. Got: ${size}.`,
        );
      }

      // NOTE: we could verify if the number given is not too big for the given size.
      // e.g.: uint8 max value is 255, uint16 is 65535...

      const hexNumber = numberToHex(parseInt(value, 10)).slice(2);

      if (hexNumber.length <= bytes * 2) {
        return padLeft(hexNumber, bytes * 2);
      }

      return hexNumber.slice(-bytes * 2);
    }
    case 'int':
      // TODO:
      throw new Error('The encoding of <intM> has not been implemented yet.');
    case 'bytes': {
      const valueWithoutPrefix = value.replace('0x', '');
      if (valueWithoutPrefix.length !== size * 2) {
        throw new Error(
          `Wrong value: ${value} for dynamic key with type: ${type}. Value is not ${size} bytes long.`,
        );
      }

      if (!isHex(valueWithoutPrefix)) {
        throw new Error(
          `Wrong value: ${value} for dynamic key with type: ${type}. Value is not in hex.`,
        );
      }

      if (valueWithoutPrefix.length > bytes * 2) {
        return valueWithoutPrefix.slice(0, bytes * 2); // right cut
      }

      return leftPad(valueWithoutPrefix, bytes * 2);
    }
    default:
      throw new Error(`Dynamic key: ${type} is not supported`);
  }
};

export function isDynamicKeyName(name: string) {
  const keyNameParts = name.split(':');

  for (let i = 0; i < keyNameParts.length; i++) {
    if (
      dynamicTypes.includes(keyNameParts[i]) ||
      keyNameParts[i].match(dynamicTypesRegex)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Encodes a MappingWithGrouping with dynamic values, according to LSP-2 ERC725YJSONSchema.
 * https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping
 * bytes10:bytes2(0):bytes20
 *
 *
 * @param name Ex: MyKeyName:<address>
 * @param dynamicKeyParts ['0xcafecafecafecafecafecafecafecafecafecafe']
 * @returns the encoded key
 */
const encodeDynamicMapping = (name: string, dynamicKeyParts: string[]) => {
  if (dynamicKeyParts.length !== 1) {
    throw new Error(
      `Dynamic key of type: Mapping expects exactly 1 variable. Got: ${dynamicKeyParts.length} (${dynamicKeyParts})`,
    );
  }

  const keyNameSplit = name.split(':'); // LSP5ReceivedAssetsMap:<address>

  const encodedKey = keccak256(keyNameSplit[0]).slice(0, 22);

  return `${encodedKey}0000${encodeDynamicKeyPart(
    keyNameSplit[1],
    dynamicKeyParts[0],
    20,
  )}`;
};

/**
 * Encodes a MappingWithGrouping with dynamic values, according to LSP-2 ERC725YJSONSchema.
 * https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mappingwithgrouping
 * bytes6:bytes4:bytes2(0):bytes20
 *
 * @param name
 * @param dynamicKeyParts
 * @returns the encoded key
 */
const encodeDynamicMappingWithGrouping = (
  name: string,
  dynamicKeyParts: string[],
) => {
  const keyNameSplit = name.split(':'); // MyGroup:<string>:<address>

  let numberOfVariables = 0;
  if (isDynamicKeyName(keyNameSplit[1])) {
    numberOfVariables += 1;
  }
  if (isDynamicKeyName(keyNameSplit[2])) {
    numberOfVariables += 1;
  }

  if (numberOfVariables !== dynamicKeyParts.length) {
    throw new Error(
      `Can not encode dynamic key of type: MappingWithGrouping. Wrong number of arguments. Expects exactly ${numberOfVariables} variable(s), got: ${dynamicKeyParts.length} (${dynamicKeyParts})`,
    );
  }

  const firstPart = keccak256(keyNameSplit[0]).slice(0, 14);

  let secondPart = '';
  if (isDynamicKeyName(keyNameSplit[1])) {
    secondPart = encodeDynamicKeyPart(keyNameSplit[1], dynamicKeyParts[0], 4);
  } else {
    secondPart = keccak256(keyNameSplit[1]).slice(2, 2 + 4 * 2);
  }

  let lastPart = '';
  if (isDynamicKeyName(keyNameSplit[2])) {
    lastPart = encodeDynamicKeyPart(
      keyNameSplit[2],
      dynamicKeyParts[dynamicKeyParts.length - 1],
      20,
    );
  } else {
    lastPart = keccak256(keyNameSplit[2]).slice(2, 2 + 20 * 2);
  }

  return `${firstPart}${secondPart}0000${lastPart}`;
};

function encodeDynamicKeyName(
  name: string,
  dynamicKeyParts?: string | string[],
): string {
  if (!dynamicKeyParts) {
    throw new Error(
      `Can't encode dynamic key name: ${name} without dynamicKeyParts`,
    );
  }

  const dynamicKeyPartsArray =
    typeof dynamicKeyParts === 'string' ? [dynamicKeyParts] : dynamicKeyParts;

  const keyType = guessKeyTypeFromKeyName(name);

  switch (keyType) {
    case 'Mapping':
      return encodeDynamicMapping(name, dynamicKeyPartsArray);
    case 'MappingWithGrouping':
      return encodeDynamicMappingWithGrouping(name, dynamicKeyPartsArray);
    default:
      throw new Error(
        `Could not encode dynamic key: ${name} of type: ${keyType}`,
      );
  }
}

/**
 *
 * @param name the schema element name.
 * @return the name of the key encoded as per specifications.
 *
 * @return a string of the encoded schema name.
 */
export function encodeKeyName(
  name: string,
  dynamicKeyParts?: string | string[],
) {
  if (isDynamicKeyName(name)) {
    return encodeDynamicKeyName(name, dynamicKeyParts);
  }

  const keyType = guessKeyTypeFromKeyName(name);

  switch (keyType) {
    case 'MappingWithGrouping': {
      const keyNameSplit = name.split(':');

      return encodeDynamicMappingWithGrouping(
        `${keyNameSplit[0]}:<string>:<address>`,
        [keyNameSplit[1], keyNameSplit[2]],
      );
    }

    case 'Mapping': {
      const keyNameSplit = name.split(':');
      if (isAddress(keyNameSplit[1])) {
        return encodeDynamicMapping(`${keyNameSplit[0]}:<address>`, [
          keyNameSplit[1],
        ]);
      }

      return encodeDynamicMapping(`${keyNameSplit[0]}:<string>`, [
        keyNameSplit[1],
      ]);
    }
    case 'Array': // Warning: this can not correctly encode subsequent keys of array, only the initial Array key will work
    case 'Singleton':
      return keccak256(name);
    default:
      return keccak256(name);
  }
}
