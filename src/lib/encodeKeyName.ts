import { keccak256 } from 'web3-utils';

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
    case 'Bytes20MappingWithGrouping': {
      // bytes4(keccak256(FirstWord)) + bytes4(0) + bytes2(keccak256(SecondWord)) + bytes2(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 10) +
        '00000000' +
        keccak256(keyNameSplit[1]).slice(2, 6) +
        '0000' +
        keyNameSplit[2].replace('0x', '').slice(0, 40)
      );
    }
    case 'Bytes20Mapping': {
      // bytes8(keccak256(FirstWord)) + bytes4(0) + bytes20(address)
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 18) +
        '00000000' +
        keyNameSplit[1].replace('0x', '').slice(0, 40)
      );
    }

    case 'Mapping': {
      // bytes16(keccak256(FirstWord)) + bytes12(0) + bytes4(keccak256(LastWord))
      const keyNameSplit = name.split(':');
      return (
        keccak256(keyNameSplit[0]).slice(0, 34) +
        '000000000000000000000000' +
        keccak256(keyNameSplit[1]).slice(2, 10)
      );
    }
    case 'Array': // Warning: this can not correctly encode subsequent keys of array, only the initial Array key will work
    case 'Singleton':
      return keccak256(name);
    default:
      return keccak256(name);
  }
}
