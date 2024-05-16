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
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import assert from 'assert';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import { getSchema } from './schemaParser';

describe('schemaParser getSchema', () => {
  describe('Singleton', () => {
    it('finds keys of type Singleton correctly', () => {
      const schema = getSchema(
        '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      );

      assert.deepStrictEqual(schema, {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'VerifiableURI',
        valueType: 'bytes',
      });
    });
  });

  describe('Array', () => {
    it('finds initial key of type Array correctly', () => {
      const schema = getSchema(
        '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
      );

      assert.deepStrictEqual(schema, {
        name: 'LSP12IssuedAssets[]',
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        keyType: 'Array',
        valueContent: 'Address',
        valueType: 'address',
      });
    });
    it('finds subsequent key of type Array correctly', () => {
      const schema = getSchema([
        '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
        '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
      ]);

      assert.deepStrictEqual(schema, {
        '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001': {
          name: 'LSP12IssuedAssets[]',
          key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          dynamicName: 'LSP12IssuedAssets[1]',
          dynamicKeyPart: '0x00000000000000000000000000000001',
          keyType: 'Singleton',
          valueContent: 'Address',
          valueType: 'address',
        },
        '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000': {
          name: 'AddressPermissions[]',
          key: '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
          dynamicName: 'AddressPermissions[0]',
          dynamicKeyPart: '0x00000000000000000000000000000000',
          keyType: 'Singleton',
          valueContent: 'Address',
          valueType: 'address',
        },
      });
    });
    it('finds subsequent key of type Array correctly', () => {
      const schema = getSchema(
        '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000fab000000000000000001',
      );

      assert.deepStrictEqual(schema, null);
    });
  });

  describe('Mapping', () => {
    it('finds known mappings', () => {
      const schema = getSchema(
        '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
      );

      assert.deepStrictEqual(schema, {
        name: 'SupportedStandards:LSP3Profile',
        key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
        keyType: 'Mapping',
        valueContent: '0x5ef83ad9',
        valueType: 'bytes4',
      });
    });

    it('finds unknown mappings', () => {
      // Key name: SupportedStandards:UnknownKey
      const schema = getSchema(
        '0xeafec4d89fa9619884b60000f4d7faed14a1ab658d46d385bc29fb1eeaa56d0b',
      );

      assert.deepStrictEqual(schema, {
        name: 'SupportedStandards:??????',
        key: '0xeafec4d89fa9619884b60000f4d7faed14a1ab658d46d385bc29fb1eeaa56d0b',
        keyType: 'Mapping',
        valueContent: '0x5ef83ad9',
        valueType: 'bytes4',
      });
    });

    it('finds Known Mapping:<address> ', () => {
      const address = 'af3bf2ffb025098b79caddfbdd113b3681817744';
      const name = 'MyCoolAddress:<address>';
      const dynamicName = `MyCoolAddress:0x${address}`;
      const key = `0x22496f48a493035f00000000${address}`;

      const extraSchema: ERC725JSONSchema = {
        name,
        key,
        keyType: 'Mapping',
        valueContent: 'Address',
        valueType: 'address',
      };

      const schema = getSchema(key, [extraSchema]);

      assert.deepStrictEqual(schema, {
        ...extraSchema,
        dynamicKeyPart: `0x${address}`,
        dynamicName,
      });
    });

    it('finds known SomeBytes32Mapping:<bytes32>', () => {
      const bytes32Value =
        '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';
      const name = 'SomeBytes32Mapping:<bytes32>';
      const dynamicPart = bytes32Value.slice(0, 40);
      const dynamicName = `SomeBytes32Mapping:0x${dynamicPart}`;
      const key = `0x0cfc51aec37c55a4d0b10000${dynamicPart}`;

      const extraSchema: ERC725JSONSchema = {
        name,
        key,
        keyType: 'Mapping',
        valueContent: 'Address',
        valueType: 'address',
      };

      const schema = getSchema(key, [extraSchema]);

      assert.deepStrictEqual(schema, {
        ...extraSchema,
        dynamicName,
        dynamicKeyPart: `0x${dynamicPart}`,
      });
    });

    it('finds known SomeSelectorMap:<bytes4>', () => {
      const bytes4Value = 'beefbeef';
      const name = 'SomeSelectorMap:<bytes4>';
      const dynamicName = `SomeSelectorMap:0x${bytes4Value}`;
      const key = `0x0cfc51aec37c55a4d0b10000${bytes4Value}00000000000000000000000000000000`;

      const extraSchema: ERC725JSONSchema = {
        name,
        key,
        keyType: 'Mapping',
        valueContent: '(Address,bool)',
        valueType: '(address,bool)',
      };

      const schema = getSchema(key, [extraSchema]);

      assert.deepStrictEqual(schema, {
        ...extraSchema,
        dynamicName,
        dynamicKeyPart: `0x${bytes4Value}`,
      });
    });

    it('finds Known LSP1UniversalReceiverDelegate:<bytes32> ', () => {
      const bytes32value =
        'cafecafecafecafecafecafecafecafecafecafef00df00df00df00df00df00d';
      const name = 'LSP1UniversalReceiverDelegate:<bytes32>';
      const dynamicPart = bytes32value.slice(0, 40);
      const dynamicName = `LSP1UniversalReceiverDelegate:0x${dynamicPart}`;
      const key = `0x0cfc51aec37c55a4d0b10000${dynamicPart}`;

      const extraSchema: ERC725JSONSchema = {
        name,
        key,
        keyType: 'Mapping',
        valueContent: 'Address',
        valueType: 'address',
      };

      const schema = getSchema(key, [extraSchema]);

      assert.deepStrictEqual(schema, {
        ...extraSchema,
        dynamicName,
        dynamicKeyPart: `0x${dynamicPart}`,
      });
    });
  });

  describe('MappingWithGrouping', () => {
    it('finds MappingWithGrouping', () => {
      const address = 'af3bf2ffb025098b79caddfbdd113b3681817744';
      const name = 'AddressPermissions:Permissions:<address>';
      const dynamicName = `AddressPermissions:Permissions:0x${address}`;
      const key = `0x4b80742de2bf82acb3630000${address}`;
      const schema = getSchema(key);

      assert.deepStrictEqual(schema, {
        name,
        dynamicName,
        key,
        dynamicKeyPart: `0x${address}`,
        keyType: 'MappingWithGrouping',
        valueContent: 'BitArray',
        valueType: 'bytes32',
      });
    });
  });
});
