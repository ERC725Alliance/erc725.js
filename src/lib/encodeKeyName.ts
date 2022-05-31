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

const MAPPING_FIRST_WORD_HASH_LENGTH = 22;
const MAPPINGWITHGROUPING_FIRST_WORD_HASH_LENGTH = 14;

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
      throw new Error('TODO');
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
    case 'Mapping': {
      // https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mappingwithgrouping
      /**
       * bytes10:bytes2(0):bytes20
       */

      // Mapping expects only 1 dynamic key
      if (dynamicKeyPartsArray.length !== 1) {
        throw new Error(
          `Dynamic key of type: Mapping expects exactly 1 variable. Got: ${dynamicKeyPartsArray.length} (${dynamicKeyPartsArray})`,
        );
      }

      const keyNameSplit = name.split(':'); // LSP5ReceivedAssetsMap:<address>

      const encodedKey = keccak256(keyNameSplit[0]).slice(
        0,
        MAPPING_FIRST_WORD_HASH_LENGTH,
      );

      return `${encodedKey}0000${encodeDynamicKeyPart(
        keyNameSplit[1],
        dynamicKeyPartsArray[0],
        20,
      )}`;
    }
    case 'MappingWithGrouping': {
      // https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mappingwithgrouping
      // bytes6(keccak256("MyKeyName")) + bytes4(keccak256("MyMapName") or <mixed type>) + bytes2(0) + bytes20(keccak256("MySubMapName") or <mixed type>)
      // bytes6:bytes4:bytes2(0):bytes20

      const keyNameSplit = name.split(':'); // MyGroup:<string>:<address>

      let numberOfVariables = 0;
      if (isDynamicKeyName(keyNameSplit[1])) {
        numberOfVariables += 1;
      }
      if (isDynamicKeyName(keyNameSplit[2])) {
        numberOfVariables += 1;
      }

      if (numberOfVariables !== dynamicKeyPartsArray.length) {
        throw new Error(
          `Can not encode dynamic key of type: MappingWithGrouping. Wrong number of arguments. Expects exactly ${numberOfVariables} variable(s), got: ${dynamicKeyPartsArray.length} (${dynamicKeyPartsArray})`,
        );
      }

      const firstPart = keccak256(keyNameSplit[0]).slice(
        0,
        MAPPINGWITHGROUPING_FIRST_WORD_HASH_LENGTH,
      );

      let secondPart = '';
      if (isDynamicKeyName(keyNameSplit[1])) {
        secondPart = encodeDynamicKeyPart(
          keyNameSplit[1],
          dynamicKeyPartsArray[0],
          4,
        );
      } else {
        secondPart = keccak256(keyNameSplit[1]).slice(2, 2 + 4 * 2);
      }

      let lastPart = '';
      if (isDynamicKeyName(keyNameSplit[2])) {
        lastPart = encodeDynamicKeyPart(
          keyNameSplit[2],
          dynamicKeyPartsArray[dynamicKeyPartsArray.length - 1],
          20,
        );
      } else {
        lastPart = keccak256(keyNameSplit[2]).slice(2, 2 + 20 * 2);
      }

      return `${firstPart}${secondPart}0000${lastPart}`;
    }
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
      // bytes10(keccak256(FirstWord)) + bytes4(keccak256(SecondWord)) + bytes2(0) + bytes20(AnyKey)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(
          0,
          MAPPINGWITHGROUPING_FIRST_WORD_HASH_LENGTH,
        ) +
        keccak256(keyNameSplit[1]).slice(2, 10) +
        '0000' +
        keyNameSplit[2].replace('0x', '').slice(0, 40)
      );
    }

    case 'Mapping': {
      // bytes10(keccak256(FirstWord)) + bytes2(0) + bytes20(AnyKey)
      const keyNameSplit = name.split(':');
      if (isAddress(keyNameSplit[1])) {
        return (
          keccak256(keyNameSplit[0]).slice(0, MAPPING_FIRST_WORD_HASH_LENGTH) +
          '0000' +
          keyNameSplit[1].replace('0x', '')
        );
      }
      return (
        keccak256(keyNameSplit[0]).slice(0, MAPPING_FIRST_WORD_HASH_LENGTH) +
        '0000' +
        keccak256(keyNameSplit[1]).slice(2, 42)
      );
    }
    case 'Array': // Warning: this can not correctly encode subsequent keys of array, only the initial Array key will work
    case 'Singleton':
      return keccak256(name);
    default:
      return keccak256(name);
  }
}
