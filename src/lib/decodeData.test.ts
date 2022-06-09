/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { decodeData } from './decodeData';

describe('decodeData', () => {
  const schemas: ERC725JSONSchema[] = [
    {
      name: 'KeyOne',
      key: '0x0f4e1c48ef0a593fadd83075e26a9418949fca5ebd47f3224508df4dab7584d9',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: '0x1111',
    },
    {
      name: 'KeyTwo',
      key: '0x13e32c6169bcd9107cb714c65a5cc4dbd09d437bee789d0c735467d3af8dc3b0',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: '0x2222',
    },
    {
      name: 'MyKeyName:<bytes32>:<bool>',
      key: '0x',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'JSONURL',
    },
    {
      name: 'MyDynamicKey:<address>',
      key: '0x',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'JSONURL',
    },
  ];

  it('decodes each key', () => {
    const decodedData = decodeData(
      [
        {
          keyName: 'KeyOne',
          value: '0x1111',
        },
        {
          keyName: 'KeyTwo',
          value: '0x2222',
        },
      ],
      schemas,
    );

    expect(decodedData.map(({ name }) => name)).to.eql(['KeyOne', 'KeyTwo']);
  });

  it('parses non array input correctly', () => {
    const decodedData = decodeData(
      {
        keyName: 'KeyOne',
        value: '0x1111',
      },

      schemas,
    );

    expect(decodedData.name).to.eql('KeyOne');
  });

  it('parses type Array correctly', () => {
    const decodedData = decodeData(
      {
        keyName: 'LSP12IssuedAssets[]',
        value: [
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
            value:
              '0x0000000000000000000000000000000000000000000000000000000000000002',
          },
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
            value: '0xd94353d9b005b3c0a9da169b768a31c57844e490',
          },
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
            value: '0xdaea594e385fc724449e3118b2db7e86dfba1826',
          },
        ],
      },

      [
        {
          name: 'LSP12IssuedAssets[]',
          key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          keyType: 'Array',
          valueContent: 'Address',
          valueType: 'address',
        },
      ],
    );

    expect(decodedData.name).to.eql('LSP12IssuedAssets[]');
    expect(decodedData.value).to.eql([
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
    ]);
  });

  it('decodes dynamic keys', () => {
    const decodedData = decodeData(
      [
        {
          keyName: 'MyKeyName:<bytes32>:<bool>',
          dynamicKeyParts: [
            '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
            'true',
          ],
          value:
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'MyDynamicKey:<address>',
          dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
          value:
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'KeyTwo',
          value: '0x2222',
        },
      ],
      schemas,
    );

    expect(decodedData.map(({ name }) => name)).to.eql([
      'MyKeyName:aaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa:true',
      'MyDynamicKey:cafecafecafecafecafecafecafecafecafecafe',
      'KeyTwo',
    ]);
  });
});
