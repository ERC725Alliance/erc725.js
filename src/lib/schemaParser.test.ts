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
        valueContent: 'JSONURL',
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
          name: 'LSP12IssuedAssets[1]',
          key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          keyType: 'Singleton',
          valueContent: 'Address',
          valueType: 'address',
        },
        '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000': {
          name: 'AddressPermissions[0]',
          key: '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
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
        '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
      );

      assert.deepStrictEqual(schema, {
        name: 'SupportedStandards:LSP3UniversalProfile',
        key: '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
        keyType: 'Mapping',
        valueContent: '0xabe425d6',
        valueType: 'bytes4',
      });
    });

    it.skip('finds unknown mappings', () => {
      // Key name: SupportedStandards:UnknownKey
      const schema = getSchema(
        '0xeafec4d89fa9619884b6b89135626455000000000000000000000000f4d7faed',
      );

      assert.deepStrictEqual(schema, {
        name: 'SupportedStandards:??????',
        key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000f4d7faed',
        keyType: 'Mapping',
        valueContent: '0xabe425d6',
        valueType: 'bytes4',
      });
    });
  });

  describe('Bytes20Mapping', () => {
    it('finds Bytes20Mapping', () => {
      const address = 'af3bf2ffb025098b79caddfbdd113b3681817744';
      const name = `MyCoolAddress:${address}`;
      const key = `0x22496f48a493035f00000000${address}`;

      const extraSchema: ERC725JSONSchema = {
        name,
        key,
        keyType: 'Bytes20Mapping',
        valueContent: 'Address',
        valueType: 'address',
      };

      const schema = getSchema(key, [extraSchema]);

      assert.deepStrictEqual(schema, extraSchema);
    });
  });

  describe('Bytes20MappingWithGrouping', () => {
    it.skip('finds Bytes20MappingWithGrouping', () => {
      const address = 'af3bf2ffb025098b79caddfbdd113b3681817744';
      const name = `AddressPermissions:Permissions:${address}`;
      const key = `0x4b80742d0000000082ac0000${address}`;
      const schema = getSchema(key);

      assert.deepStrictEqual(schema, {
        name,
        key,
        keyType: 'Bytes20MappingWithGrouping',
        valueContent: 'BitArray',
        valueType: 'bytes32',
      });
    });
  });
});
