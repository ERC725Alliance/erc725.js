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

import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import {
  decodeKey,
  decodeData,
  decodeTupleKeyValue,
  isValidTuple,
} from './decodeData';

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

    expect(decodedData.value).to.eql(['0x11223344', '12']); // TODO: we may want to return a number instead of a string.
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

describe('tuple', () => {
  describe('decodeTupleKeyValue', () => {
    const testCases = [
      {
        valueContent: '(Bytes4,Number)',
        valueType: '(bytes4,bytes8)',
        encodedValue: '0xdeadbeaf000000000000000c',
        decodedValue: ['0xdeadbeaf', '12'],
      },
    ]; // TODO: add more cases? Address, etc.

    testCases.forEach((testCase) => {
      it(`decodes tuple values`, () => {
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
        isTuple: false, // valueContent length != valueType length
        shouldThrow: true,
      },
      {
        valueType: '(bytes4,bytes8)',
        valueContent: '(Bytes8,Number)',
        isTuple: false, // first item does not match between valueType and valueContent (bytes4 != bytes8)
        shouldThrow: true,
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
      // TODO: add feature for this test
      // {
      //   valueType: '(bytes4,bytes4)',
      //   valueContent: '(Number,0x1122334455)',
      //   isTuple: false,
      //   shouldThrow: true, // valueContent is bytes5 vs bytes4
      // },
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

  it(`decodes a CompactBytesArray of tuple (bytes4,address,bytes2)`, () => {
    const testCase = {
      schema: {
        name: 'TupleMultiType',
        key: '1e1bc4abe01b7baa7d4a359c0f460e632ef34b3f16f5722bd8892f2dae913022',
        keyType: 'Singleton',
        valueType: '(bytes4,address,bytes2)[CompactBytesArray]',
        valueContent: '(Bytes4,Address,Bytes)',
      },
      decodedValue: [
        ['0xcafecafe', '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5', '0xcafe'],
        ['0xbeefbeef', '0xFE31320faF8Da1492Eadf8Deb79bd264D7cF2141', '0xbeef'],
        ['0xf00df00d', '0xc527702b14BF2f79F70B32e09F62B6A74cADFd80', '0xf00d'],
      ],
      encodedValue:
        '0x001acafecafeDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5cafe001abeefbeefFE31320faF8Da1492Eadf8Deb79bd264D7cF2141beef001af00df00dc527702b14BF2f79F70B32e09F62B6A74cADFd80f00d',
    };

    expect(
      decodeKey(testCase.schema as ERC725JSONSchema, testCase.encodedValue),
    ).to.deep.equal(testCase.decodedValue);
  });

  it(`decodes an AllowedCalls CompactBytesArray of tuple (bytes4,address,bytes4)`, () => {
    const testCase = {
      schema: {
        name: 'AddressPermissions:AllowedCalls:<address>',
        key: '0x4b80742de2bf393a64c70000<address>',
        keyType: 'MappingWithGrouping',
        valueType: '(bytes4,address,bytes4)[CompactBytesArray]',
        valueContent: '(Bytes4,Address,Bytes4)',
      },
      decodedValue: [
        [
          '0xcafecafe',
          '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5',
          '0xcafecafe',
        ],
        [
          '0xbeefbeef',
          '0xFE31320faF8Da1492Eadf8Deb79bd264D7cF2141',
          '0xbeefbeef',
        ],
        [
          '0xf00df00d',
          '0xc527702b14BF2f79F70B32e09F62B6A74cADFd80',
          '0xf00df00d',
        ],
      ],
      encodedValue:
        '0x001ccafecafeDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5cafecafe001cbeefbeefFE31320faF8Da1492Eadf8Deb79bd264D7cF2141beefbeef001cf00df00dc527702b14BF2f79F70B32e09F62B6A74cADFd80f00df00d'.toLowerCase(),
    };

    expect(
      decodeKey(testCase.schema as ERC725JSONSchema, testCase.encodedValue),
    ).to.deep.equal(testCase.decodedValue);
  });

  it(`decodes a CompactBytesArray of tuple (bytes4,bytes8,bytes16)`, () => {
    const testCase = {
      schema: {
        name: 'TupleMultiType',
        key: '1e1bc4abe01b7baa7d4a359c0f460e632ef34b3f16f5722bd8892f2dae913022',
        keyType: 'Singleton',
        valueType: '(bytes4,bytes8,bytes16)[CompactBytesArray]',
        valueContent: '(Bytes4,Bytes8,Bytes16)',
      },
      decodedValue: [
        [
          '0xcafecafe',
          '0x951a5d121531bba8',
          '0xDAFEA492D9c6733ae3d56b7Ed1ADB606',
        ],
        [
          '0xbeefbeef',
          '0x8a483080f5db1105',
          '0xFE31320faF8Da1492Eadf8Deb79bd264',
        ],
        [
          '0xf00df00d',
          '0x2fe92a11caf28ab2',
          '0xc527702b14BF2f79F70B32e09F62B6A7',
        ],
      ],
      encodedValue:
        '0x001ccafecafe951a5d121531bba8DAFEA492D9c6733ae3d56b7Ed1ADB606001cbeefbeef8a483080f5db1105FE31320faF8Da1492Eadf8Deb79bd264001cf00df00d2fe92a11caf28ab2c527702b14BF2f79F70B32e09F62B6A7',
    };

    expect(
      decodeKey(testCase.schema as ERC725JSONSchema, testCase.encodedValue),
    ).to.deep.equal(testCase.decodedValue);
  });
});
