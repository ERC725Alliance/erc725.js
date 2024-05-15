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
import { getSchemaElement } from './getSchemaElement';

describe('getSchemaElement', () => {
  it('gets the schemaElement from key name and key hash (with and without 0x prefix) correctly', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    assert.strictEqual(getSchemaElement(schemas, schemas[0].name), schemas[0]);
    assert.strictEqual(getSchemaElement(schemas, schemas[0].key), schemas[0]);
    assert.strictEqual(
      getSchemaElement(schemas, schemas[0].key.slice(2)),
      schemas[0],
    );
  });

  const schemasWithDynamicKey: ERC725JSONSchema[] = [
    {
      name: 'LSP12IssuedAssetsMap:<address>',
      key: '0x74ac2555c10b9349e78f0000<address>',
      keyType: 'Mapping',
      valueType: '(bytes4,uint128)',
      valueContent: '(Bytes4,Number)',
    },
    {
      name: 'ARandomKey',
      key: '0x7cf0c8053453d0353fdbad6a48e68966b35dd13cb3a62e7b75009dc5035b80c0',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'JSONURL',
    },
  ];

  it('throws is attempt to get a dynamic key without dynamicKeyParts', () => {
    assert.throws(() =>
      getSchemaElement(schemasWithDynamicKey, 'LSP12IssuedAssetsMap:<address>'),
    );
  });

  it('gets the schemeElement for a dynamic key correctly', () => {
    assert.deepStrictEqual(
      getSchemaElement(
        schemasWithDynamicKey,
        'LSP12IssuedAssetsMap:<address>',
        ['0x2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac'],
      ),
      {
        name: 'LSP12IssuedAssetsMap:2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac',
        key: '0x74ac2555c10b9349e78f00002ab3903c6e5815f4bc2a95b7f3b22b6a289bacac',
        keyType: 'Mapping',
        valueType: '(bytes4,uint128)',
        valueContent: '(Bytes4,Number)',
      },
    );
  });
});
