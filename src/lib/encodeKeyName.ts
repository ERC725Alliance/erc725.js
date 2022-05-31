import { isAddress, keccak256 } from 'web3-utils';

import { guessKeyTypeFromKeyName } from './utils';

/**
 *
 * @param name the schema element name.
 * @return the name of the key encoded as per specifications.
 *
 * @return a string of the encoded schema name.
 */
export function encodeKeyName(name: string) {
  const keyType = guessKeyTypeFromKeyName(name);

  switch (keyType) {
    case 'MappingWithGrouping': {
      // bytes10(keccak256(FirstWord)) + bytes4(keccak256(SecondWord)) + bytes2(0) + bytes20(AnyKey)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 14) +
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
          keccak256(keyNameSplit[0]).slice(0, 22) +
          '0000' +
          keyNameSplit[1].replace('0x', '')
        );
      }
      return (
        keccak256(keyNameSplit[0]).slice(0, 22) +
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
