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

/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import type { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import {
  decodeData,
  decodeKey,
  decodeTupleKeyValue,
  isValidTuple,
} from './decodeData';
import { Hex, keccak256, stringToBytes } from 'viem';
import { encodeArrayKey } from './utils';

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
      keyType: 'MappingWithGrouping',
      valueType: 'bytes',
      valueContent: 'JSONURL', // Deprecated - We keep it for backward compatibility between v0.21.3 and v0.22.0
    },
    {
      name: 'MyKeyName2:<bytes32>:<bool>',
      key: '0x',
      keyType: 'MappingWithGrouping',
      valueType: 'bytes',
      valueContent: 'VerifiableURI',
    },
    {
      name: 'MyDynamicKey:<address>',
      key: '0x',
      keyType: 'Mapping',
      valueType: 'bytes',
      valueContent: 'JSONURL', // Deprecated - We keep it for backward compatibility between v0.21.3 and v0.22.0
    },
    {
      name: 'MyDynamicKey2:<address>',
      key: '0x',
      keyType: 'Mapping',
      valueType: 'bytes',
      valueContent: 'VerifiableURI',
    },
    {
      name: 'LSP4CreatorsMap:<address>',
      key: '0x6de85eaf5d982b4e5da00000<address>',
      keyType: 'Mapping',
      valueType: '(bytes4,uint128)',
      valueContent: '(Bytes4,Number)',
    },
    {
      name: 'LSP4CreatorsMap:<address>',
      key: '0x6de85eaf5d982b4e5da00000<address>',
      keyType: 'Mapping',
      valueType: '(', // BAD
      valueContent: '(Bytes4,Number)',
    },
    {
      name: 'LSP4CreatorsMap:<address>',
      key: '0x6de85eaf5d982b4e5da00000<address>',
      keyType: 'Mapping',
      valueType: 'bytes4,uint128', // BAD2
      valueContent: '(Bytes4,Number)',
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

  it('is backward compatible with JSONURL and AssetURL and decodes these encoding correctly', () => {
    const decodedData = decodeData(
      [
        {
          keyName: 'JSONURLCase',
          value:
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'JSONURLCase',
          value:
            '0x8019f9b1820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'AssetURLCase',
          value:
            '0x8019f9b1d47cf10786205bb08ce508e91c424d413d0f6c48e24dbfde2920d16a9561a723697066733a2f2f516d57346e554e7933767476723344785a48754c66534c6e687a4b4d6532576d67735573454750504668385a7470',
        },
      ],
      [
        {
          name: 'JSONURLCase',
          key: '0x9136feeb09af67b63993b586ce46a43bd3456990d3fdb39d07beab9dee8d5910',
          keyType: 'Singleton',
          valueType: 'bytes',
          valueContent: 'JSONURL', // Deprecated - We keep it for backward compatibility between v0.21.3 and v0.22.0
        },
        {
          name: 'JSONURLCase2',
          key: '0x9136feeb09af67b63993b586ce46a43bd3456990d3fdb39d07beab9dee8d5910',
          keyType: 'Singleton',
          valueType: 'bytes',
          valueContent: 'JSONURL', // Deprecated - We keep it for backward compatibility between v0.21.3 and v0.22.0
        },
        {
          name: 'AssetURLCase',
          key: '0xbda5878fa57d8da097bf7cfd78c28e75f2c2c7b028e4e056d16d7e4b83f98081',
          keyType: 'Singleton',
          valueType: 'bytes',
          valueContent: 'AssetURL', // Deprecated - We keep it for backward compatibility between v0.21.3 and v0.22.0
        },
      ],
    );

    expect(decodedData.map(({ value }) => value)).to.eql([
      {
        verification: {
          method: 'keccak256(utf8)', // 0x6f357c6a
          data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
        },
        url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
      },
      {
        verification: {
          method: 'keccak256(bytes)', // 0x8019f9b1
          data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
        },
        url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
      },
      {
        verification: {
          method: 'keccak256(bytes)', // 0x8019f9b1
          data: '0xd47cf10786205bb08ce508e91c424d413d0f6c48e24dbfde2920d16a9561a723',
        },
        url: 'ipfs://QmW4nUNy3vtvr3DxZHuLfSLnhzKMe2WmgsUsEGPPFh8Ztp',
      },
    ]);
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

  it('parses type tuples/Mixed correctly', () => {
    const schema: ERC725JSONSchema = {
      name: 'MyDynamicKey:<address>',
      key: '0x',
      keyType: 'Singleton',
      valueType: '(bytes4,bytes8)',
      valueContent: '(Bytes4,Number)',
    };

    const decodedData = decodeData(
      {
        keyName: 'MyDynamicKey:<address>',
        dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
        value: '0x11223344000000000000000c',
        //        |------||--------------|
        //         bytes4     bytes8
        //         bytes4     number
      },
      [schema],
    );

    expect(decodedData.value).to.eql(['0x11223344', 12n]);
  });

  it('parses type Array correctly', () => {
    const decodedData = decodeData(
      {
        keyName: 'LSP12IssuedAssets[]',
        value: [
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
            value: '0x00000000000000000000000000000002',
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

  it('parses type Array correctly (even with uint256)', () => {
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

  it('parses type Array correctly but just the array length', () => {
    const decodedData = decodeData(
      {
        keyName: 'LSP12IssuedAssets[]',
        value: '0x00000000000000000000000000000003',
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
    expect(decodedData.value).to.eql(3n);
  });

  it('parses type Array correctly, return empty array when value is 0x', () => {
    const decodedData = decodeData(
      {
        keyName: 'LSP12IssuedAssets[]',
        value: '0x',
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
    expect(decodedData.value).to.eql([]);
  });

  it('decodes dynamic keys', () => {
    const decodedData = decodeData(
      [
        {
          keyName: 'MyKeyName2:<bytes32>:<bool>',
          dynamicKeyParts: [
            '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
            'true',
          ],
          value:
            '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'MyDynamicKey2:<address>',
          dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
          value:
            '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        {
          keyName: 'KeyTwo',
          value: '0x2222',
        },
      ],
      schemas,
    );

    expect(decodedData.map(({ dynamicName }) => dynamicName)).to.eql([
      'MyKeyName2:0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa:true',
      'MyDynamicKey2:0xcafecafecafecafecafecafecafecafecafecafe',
      'KeyTwo',
    ]);
  });
});

describe('tuple', () => {
  describe('decodeTupleKeyValue', () => {
    const testCases = [
      {
        valueContent: '(Bytes4,Number)',
        valueType: '(bytes4,bytes8)',
        encodedValue: '0xdeadbeaf000000000000000c' as Hex,
        decodedValue: ['0xdeadbeaf', 12n],
      },
    ]; // TODO: add more cases? Address, etc.

    testCases.forEach((testCase) => {
      it('decodes tuple values', () => {
        expect(
          decodeTupleKeyValue(
            testCase.valueContent,
            testCase.valueType,
            testCase.encodedValue,
          ),
        ).to.eql(testCase.decodedValue);
      });
    });

    describe('decodeTupleKeyValue larger', () => {
      const testCases = [
        {
          valueContent: '(Bytes4,Number)',
          valueType: '(bytes4,bytes8)',
          encodedValue:
            '0xdeadbeaf000000000000000c0000000000000000000000000000000000000000' as Hex,
          decodedValue: ['0xdeadbeaf', 12n],
        },
      ]; // TODO: add more cases? Address, etc.

      testCases.forEach((testCase) => {
        it('decodes tuple values', () => {
          expect(() =>
            decodeTupleKeyValue(
              testCase.valueContent,
              testCase.valueType,
              testCase.encodedValue,
            ),
          ).to.throw();
        });
      });
    });

    describe('decodeTupleKeyValue compactArray', () => {
      const testCases = [
        {
          valueContent: '(Bytes4,Number,Bytes32)',
          valueType: '(bytes4,bytes8,bytes32[CompactBytesArray])',
          encodedValue:
            '0xdeadbeaf000000000000000c0020123456781234567812345678123456781234567812345678123456781234567800202345678123456781234567812345678123456781234567812345678123456789' as Hex,
          decodedValue: [
            '0xdeadbeaf',
            12n,
            [
              '0x1234567812345678123456781234567812345678123456781234567812345678',
              '0x2345678123456781234567812345678123456781234567812345678123456789',
            ],
          ],
        },
      ]; // TODO: add more cases? Address, etc.

      testCases.forEach((testCase) => {
        it('decodes tuple values', () => {
          expect(
            decodeTupleKeyValue(
              testCase.valueContent,
              testCase.valueType,
              testCase.encodedValue,
            ),
          ).to.eql(testCase.decodedValue);
        });
      });
    });

    describe('decode plain compactArray', () => {
      const key = keccak256(stringToBytes('test'));
      const testCases = [
        {
          key,
          valueContent: 'Bytes8',
          keyType: 'Singleton',
          valueType: 'bytes8[CompactBytesArray]',
          encodedValue: '0x0008010203040506070800081020304050607080' as Hex,
          decodedValue: ['0x0102030405060708', '0x1020304050607080'],
        },
        {
          key,
          valueContent: 'Bytes8',
          valueType: 'bytes8',
          keyType: 'Array',
          encodedValue: '0x00000000000000000000000000000001' as Hex,
          decodedValue: 1n,
        },
        {
          key: encodeArrayKey(key, 0),
          valueContent: 'Bytes8',
          valueType: 'bytes8',
          keyType: 'Array',
          encodedValue: [
            { key, value: '0x00000000000000000000000000000001' },
            { key: encodeArrayKey(key, 0), value: '0x0000000000000008' as Hex },
          ],
          decodedValue: ['0x0000000000000008'],
        },
      ]; // TODO: add more cases? Address, etc.

      testCases.forEach((testCase) => {
        it('decodes tuple values', () => {
          expect(
            decodeKey(
              {
                name: 'test',
                keyType: testCase.keyType,
                key,
                valueContent: testCase.valueContent,
                valueType: testCase.valueType,
              },
              testCase.encodedValue,
            ),
          ).to.eql(testCase.decodedValue);
        });
      });
    });

    describe('decode bad values with exceptions', () => {
      const testCases = [
        {
          valueContent: 'Bytes8',
          valueType: 'bytes8[CompactBytesArray]',
          keyType: 'WhatShallMaCallIt',
          encodedValue: '0x0008010203040506070800081020304050607080' as Hex,
          decodedValue: ['0x0102030405060708', '0x1020304050607080'],
          message:
            /Incorrect data match or keyType in schema from decodeKey\(\)/,
        },
        {
          valueContent: 'Bytes8',
          valueType: 'bytes8[CompactBytesArray]',
          keyType: 'Singleton',
          encodedValue: '0x0508010203040506070800081020304050607080' as Hex,
          decodedValue: ['0x0102030405060708', '0x1020304050607080'],
          message:
            /Couldn't decode bytes\[CompactBytesArray\] \(invalid array item length\)/,
        },
      ]; // TODO: add more cases? Address, etc.

      testCases.forEach((testCase) => {
        it('decodes tuple values', () => {
          const key = keccak256(stringToBytes('test'));
          expect(() =>
            decodeData(
              [
                {
                  keyName: key,
                  value: testCase.encodedValue,
                },
              ],
              [
                {
                  name: 'test',
                  keyType: testCase.keyType,
                  key,
                  valueContent: 'Bytes8',
                  valueType: 'bytes8[CompactBytesArray]',
                },
              ],
              true,
            ),
          ).to.throw(testCase.message);
        });
      });
    });

    describe('decode bad values without exceptions', () => {
      const testCases = [
        {
          valueContent: 'Bytes8',
          valueType: 'bytes8[CompactBytesArray]',
          keyType: 'WhatShallMaCallIt',
          encodedValue: '0x0008010203040506070800081020304050607080' as Hex,
          decodedValue: ['0x0102030405060708', '0x1020304050607080'],
          message:
            /Incorrect data match or keyType in schema from decodeKey\(\)/,
        },
        {
          valueContent: 'Bytes8',
          valueType: 'bytes8[CompactBytesArray]',
          keyType: 'Singleton',
          encodedValue: '0x0508010203040506070800081020304050607080' as Hex,
          decodedValue: ['0x0102030405060708', '0x1020304050607080'],
          message:
            /Couldn't decode bytes\[CompactBytesArray\] \(invalid array item length\)/,
        },
      ]; // TODO: add more cases? Address, etc.

      testCases.forEach((testCase) => {
        it('decodes tuple values', () => {
          const key = keccak256(stringToBytes('test'));
          expect(
            decodeData(
              [
                {
                  keyName: key,
                  value: testCase.encodedValue,
                },
              ],
              [
                {
                  name: 'test',
                  keyType: testCase.keyType,
                  key,
                  valueContent: 'Bytes8',
                  valueType: 'bytes8[CompactBytesArray]',
                },
              ],
            )[0],
          ).to.have.property('value', null);
        });
      });
    });
  });

  describe('isValidTupleValueType', () => {
    const testCases = [
      {
        valueType: 'abcd', // not a tuple
        valueContent: 'WebThr33',
        isTuple: false,
      },
      {
        valueType: '()',
        valueContent: '()',
        isTuple: false, // it is empty
      },
      {
        valueType: '(bytes4)',
        valueContent: '(HeyHey)',
        isTuple: false, // valueContent is wrong
        shouldThrow: true,
      },
      {
        valueType: '(bytes4,number)', // number not allowed in valueType
        valueContent: '(Bytes4,Number)',
        isTuple: false,
        shouldThrow: true,
      },
      {
        valueType: '(bytes4,bytes8)',
        valueContent: '(Bytes4,Number,Bytes5)',
        // valueContent length != valueType length
        isTuple: false,
        shouldThrow: true,
      },
      {
        valueType: '(bytes4,bytes8)',
        valueContent: '(Bytes2,Number)',
        // first item in valueType does not fit inside first item in valueContent (bytes4 > bytes2)
        isTuple: false,
        shouldThrow: true,
      },
      {
        valueType: '(bytes4,bytes8)',
        valueContent: '(Bytes8,Number)',
        // first item in valueType fit in first item of valueContent (bytes4 < bytes8)
        isTuple: true,
      },
      {
        valueType: '(bytes4,bytes8)',
        valueContent: '(Bytes4,Number)',
        isTuple: true,
      },
      {
        valueType: '(bytes4,bytes8,bytes16)',
        valueContent: '(Bytes4,Number,Bytes16)',
        isTuple: true,
      },
      {
        valueType: '(bytes4,bytes4)',
        valueContent: '(Number,0x112233XX)',
        isTuple: false,
        shouldThrow: true, // valueContent is not a valid hex value
      },
      {
        valueType: '(bytes4,bytes4)',
        valueContent: '(Number,0x1122334455)',
        isTuple: false,
        shouldThrow: true, // valueContent is bytes5 vs bytes4
      },
    ];

    testCases.forEach((testCase) => {
      it(`detects valueType: ${testCase.valueType} valueContent: ${
        testCase.valueContent
      } as ${testCase.isTuple ? 'tuple' : 'non tuple'}`, () => {
        if (testCase.shouldThrow) {
          expect(() => {
            isValidTuple(testCase.valueType, testCase.valueContent);
          }).to.throw();
          return;
        }

        expect(
          isValidTuple(testCase.valueType, testCase.valueContent),
        ).to.equal(testCase.isTuple);
      });
    });
  });
});
