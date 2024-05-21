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
import assert from 'assert';

import { keccak256, utf8ToHex } from 'web3-utils';
import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueType,
} from '../types/ERC725JSONSchema';
import { GetDataDynamicKey } from '../types/GetData';

import { SUPPORTED_VERIFICATION_METHOD_STRINGS } from '../constants/constants';
import {
  guessKeyTypeFromKeyName,
  isDataAuthentic,
  encodeKeyValue,
  decodeKeyValue,
  encodeKey,
  encodeData,
  convertIPFSGatewayUrl,
  generateSchemasFromDynamicKeys,
  encodeTupleKeyValue,
  duplicateMultiTypeERC725SchemaEntry,
  splitMultiDynamicKeyNamePart,
  countSignificantBits,
} from './utils';
import { isDynamicKeyName } from './encodeKeyName';
import { decodeKey } from './decodeData';

describe('utils', () => {
  describe('encodeKey/decodeKey', () => {
    const testCases = [
      // test encoding an array of address
      {
        schema: {
          name: 'LSP12IssuedAssets[]',
          key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          keyType: 'Array',
          valueContent: 'Address',
          valueType: 'address',
        },
        decodedValue: [
          '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
          '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
        ],
        encodedValue: [
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
            value: '0x00000000000000000000000000000002',
          },
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
            value: '0xc444009d38d3046bb0cf81fa2cd295ce46a67c78',
          },
          {
            key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
            value: '0x4febc3491230571f6e1829e46602e3b110215a2e',
          },
        ],
      },
      {
        schema: {
          name: 'TestObjArray[]',
          key: '0x9985edaf12cbacf5ac7d6ed54f0445cc0ea56075aee9b9942e4ab3bf4239f950',
          keyType: 'Array',
          valueContent: 'JSONURL', // Deprecated - we keep it for backward compatibility
          valueType: 'bytes',
        },
        decodedValue: [
          {
            verification: {
              method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
              data: '0x733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d',
            },
            url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
          },
          {
            verification: {
              method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
              data: '0x81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88',
            },
            url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
          },
        ],
        encodedValue: [
          {
            key: '0x9985edaf12cbacf5ac7d6ed54f0445cc0ea56075aee9b9942e4ab3bf4239f950',
            value: '0x00000000000000000000000000000002',
          },
          {
            key: '0x9985edaf12cbacf5ac7d6ed54f0445cc00000000000000000000000000000000',
            value:
              '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
          },
          {
            key: '0x9985edaf12cbacf5ac7d6ed54f0445cc00000000000000000000000000000001',
            value:
              '0x00006f357c6a002081bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88697066733a2f2f516d6245724b6833466a7378787878787878787878787878787878787878787878787878787639414a4a765a6264',
          },
        ],
      },
      {
        schema: {
          name: 'TupleType',
          key: '0x50f2bd37dff422565ef30f885bf0ee0a36a2a2bcf9b0146ac9c646679c38dfd8',
          keyType: 'Singleton',
          valueType: '(bytes4,bytes8)',
          valueContent: '(Bytes4,Number)',
        },
        decodedValue: ['0xcafecafe', 11],
        encodedValue: '0xcafecafe000000000000000b',
      },
      {
        schema: {
          name: 'TupleMultiType',
          key: '1e1bc4abe01b7baa7d4a359c0f460e632ef34b3f16f5722bd8892f2dae913022',
          keyType: 'Singleton',
          valueType: '(bytes4,bytes8,bytes4)',
          valueContent: '(Bytes4,Number,Number)',
        },
        decodedValue: ['0xcafecafe', 11, 8],
        encodedValue: '0xcafecafe000000000000000b00000008',
      },
      {
        schema: {
          name: 'TupleMultiType',
          key: '1e1bc4abe01b7baa7d4a359c0f460e632ef34b3f16f5722bd8892f2dae913022',
          keyType: 'Singleton',
          valueType: '(bytes4,address,bytes2)[CompactBytesArray]',
          valueContent: '(Bytes4,Address,Bytes)',
        },
        decodedValue: [
          [
            '0xcafecafe',
            '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5',
            '0xcafe',
          ],
          [
            '0xbeefbeef',
            '0xFE31320faF8Da1492Eadf8Deb79bd264D7cF2141',
            '0xbeef',
          ],
          [
            '0xf00df00d',
            '0xc527702b14BF2f79F70B32e09F62B6A74cADFd80',
            '0xf00d',
          ],
        ],
        encodedValue:
          '0x001acafecafedafea492d9c6733ae3d56b7ed1adb60692c98bc5cafe001abeefbeeffe31320faf8da1492eadf8deb79bd264d7cf2141beef001af00df00dc527702b14bf2f79f70b32e09f62b6a74cadfd80f00d',
      },
      {
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
            '0xdafea492d9c6733ae3d56b7ed1adb606',
          ],
          [
            '0xbeefbeef',
            '0x8a483080f5db1105',
            '0xfe31320faf8da1492eadf8deb79bd264',
          ],
          [
            '0xf00df00d',
            '0x2fe92a11caf28ab2',
            '0xc527702b14bf2f79f70b32e09f62b6a7',
          ],
        ],
        encodedValue:
          '0x001ccafecafe951a5d121531bba8dafea492d9c6733ae3d56b7ed1adb606001cbeefbeef8a483080f5db1105fe31320faf8da1492eadf8deb79bd264001cf00df00d2fe92a11caf28ab2c527702b14bf2f79f70b32e09f62b6a7',
      },
      {
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
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes/decodes keyType Array / tuples (valueContent: ${testCase.schema.valueContent}, valueType: ${testCase.schema.valueType}`, () => {
        assert.deepStrictEqual(
          encodeKey(testCase.schema as ERC725JSONSchema, testCase.decodedValue),
          testCase.encodedValue,
        );

        assert.deepStrictEqual(
          decodeKey(testCase.schema as ERC725JSONSchema, testCase.encodedValue),
          testCase.decodedValue,
        );
      });
    });

    it('should encode the array length only if passing a number', async () => {
      const schema: ERC725JSONSchema = {
        name: 'LSP12IssuedAssets[]',
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        keyType: 'Array',
        valueContent: 'Address',
        valueType: 'address',
      };

      const decodedValue = 3;
      const encodedValue = '0x00000000000000000000000000000003';

      assert.equal(encodeKey(schema, decodedValue), encodedValue);
    });
  });

  describe('count bits', () => {
    const testCases = [
      {
        value: '0x00',
        result: 0,
      },
      {
        value: '0x01',
        result: 1,
      },
      { value: '0x1000', result: 13 },
      { value: '0x000f', result: 4 },
    ];
    testCases.forEach(({ value, result }) => {
      it(`should count the number of bits in ${value}`, () => {
        assert.equal(countSignificantBits(value), result);
      });
    });
  });

  describe('encodeKeyValue/decodeKeyValue', () => {
    const testCases = [
      {
        valueContent: 'Keccak256',
        valueType: 'bytes32[]',
        decodedValue: [
          '0xe5d35cae7c9db9879eb8a205baa046ad99503414d6a55eb6725494a4254a6d3f',
          '0x828e919feac2ec05939abd5d221692fbe6bac5667ba5af5d191df1f7ecb1ac21',
        ],
        encodedValue:
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002e5d35cae7c9db9879eb8a205baa046ad99503414d6a55eb6725494a4254a6d3f828e919feac2ec05939abd5d221692fbe6bac5667ba5af5d191df1f7ecb1ac21',
      },
      {
        valueContent: 'Number',
        valueType: 'uint256[]',
        decodedValue: [123, 456],
        encodedValue:
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000001c8',
      },
      {
        valueContent: 'Address',
        valueType: 'address[]',
        decodedValue: [
          '0xCE3e75A43B0A29292219926EAdC8C5585651219C',
          '0xba61a0b24a228807f23B46064773D28Fe51dA81C',
        ],
        encodedValue:
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000ce3e75a43b0a29292219926eadc8c5585651219c000000000000000000000000ba61a0b24a228807f23b46064773d28fe51da81c',
      },
      {
        valueContent: 'String',
        valueType: 'string[]',
        decodedValue: ['apple sauce', 'butter chicken'],
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b6170706c65207361756365000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e62757474657220636869636b656e000000000000000000000000000000000000',
      },
      {
        valueContent: 'String',
        valueType: 'string',
        decodedValue: 'Great-string',
        encodedValue: utf8ToHex('Great-string'),
      },
      {
        valueContent: 'Markdown',
        valueType: 'string',
        decodedValue: '# Title',
        encodedValue: utf8ToHex('# Title'),
      },
      {
        valueContent: 'URL',
        valueType: 'bytes',
        decodedValue: 'http://day.night',
        encodedValue: '0x687474703a2f2f6461792e6e69676874',
      },
      {
        valueContent: 'AssetURL',
        valueType: 'bytes',
        decodedValue: {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: '0x81dadadadadadadadadadadadadadadf00a4bdfa8fcaf3791d25f69b497abf88',
          },
          url: 'http://day.night/asset.glb',
        },
        encodedValue:
          '0x00006f357c6a002081dadadadadadadadadadadadadadadf00a4bdfa8fcaf3791d25f69b497abf88687474703a2f2f6461792e6e696768742f61737365742e676c62',
      },
      {
        valueContent: 'JSONURL',
        valueType: 'bytes',
        decodedValue: {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: '0x81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88',
          },
          url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
        },
        encodedValue:
          '0x00006f357c6a002081bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88697066733a2f2f516d6245724b6833466a7378787878787878787878787878787878787878787878787878787639414a4a765a6264',
      },

      {
        valueContent: 'Bytes',
        valueType: 'bytes',
        decodedValue: '0xaaAE32',
        encodedValue: '0xaaAE32',
      },
      {
        valueContent: 'Bytes32',
        valueType: 'bytes',
        decodedValue:
          '0x7465737400000000000000000000000000000000000000000000000000000000',
        encodedValue:
          '0x7465737400000000000000000000000000000000000000000000000000000000',
      },
      {
        valueContent: 'Bytes4',
        valueType: 'bytes',
        decodedValue: '0x74657374',
        encodedValue: '0x74657374',
      },
      {
        valueContent: '0xc9aaAE3201F40fd0fF04D9c885769d8256A456ab',
        valueType: 'bytes',
        decodedValue: '0xc9aaAE3201F40fd0fF04D9c885769d8256A456ab',
        encodedValue: '0xc9aaae3201f40fd0ff04d9c885769d8256a456ab', // encoded hex is always lower case
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes correctly valueContent ${testCase.valueContent} to valueType: ${testCase.valueType}`, () => {
        assert.strictEqual(
          encodeKeyValue(
            testCase.valueContent,
            testCase.valueType as ERC725JSONSchemaValueType,
            testCase.decodedValue,
          ),
          testCase.encodedValue,
        );
      });
      it(`decodes correctly valueContent: ${testCase.valueContent} to valueType: ${testCase.valueType}`, () => {
        assert.deepStrictEqual(
          decodeKeyValue(
            testCase.valueContent,
            testCase.valueType as ERC725JSONSchemaValueType,
            testCase.encodedValue,
          ),
          testCase.decodedValue,
        );
      });
    });
  });

  describe('encodeTupleKeyValue', () => {
    const testCases = [
      {
        valueContent: '(Bytes4,Number)',
        valueType: '(bytes4,bytes8)',
        encodedValue: '0xdeadbeaf0000000000000010',
        decodedValue: ['0xdeadbeaf', 16],
      },
      {
        valueContent: '(Bytes4,Number)',
        valueType: '(bytes4,uint128)',
        encodedValue: '0xdeadbeaf00000000000000000000000000000020',
        decodedValue: ['0xdeadbeaf', 32],
      },
    ]; // we may need to add more test cases! Address, etc.

    testCases.forEach((testCase) => {
      it('encodes tuple values', () => {
        expect(
          encodeTupleKeyValue(
            testCase.valueContent,
            testCase.valueType,
            testCase.decodedValue,
          ),
        ).to.eq(testCase.encodedValue);
      });
    });
  });

  describe('encodeArrayKey', () => {
    it('should encode the array length only if passing a number', async () => {
      const schema: ERC725JSONSchema = {
        name: 'LSP12IssuedAssets[]',
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        keyType: 'Array',
        valueContent: 'Address',
        valueType: 'address',
      };

      const decodedValue = 3;
      const encodedValue = '0x00000000000000000000000000000003';

      assert.equal(encodeKey(schema, decodedValue), encodedValue);
    });
  });

  describe('encodeData', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP12IssuedAssets[]',
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        keyType: 'Array',
        valueContent: 'Address',
        valueType: 'address',
      },
      {
        name: 'LSP1UniversalReceiverDelegate',
        key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        keyType: 'Singleton',
        valueType: 'address',
        valueContent: 'Address',
      },

      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueType: 'bytes',
        valueContent: 'JSONURL',
      },
    ];

    const expectedResult = {
      keys: [
        '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
      ],
      values: ['0x1183790f29be3cdfd0a102862fea1a4a30b3adab'],
    };

    it('encodes data with named key - [array input]', () => {
      const encodedDataByNamedKey = encodeData(
        [
          {
            keyName: 'LSP1UniversalReceiverDelegate',
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas,
      );
      assert.deepStrictEqual(encodedDataByNamedKey, expectedResult);
    });

    it('encodes data with named key - [non array input]', () => {
      const encodedDataByNamedKey = encodeData(
        {
          keyName: 'LSP1UniversalReceiverDelegate',
          value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },

        schemas,
      );
      assert.deepStrictEqual(encodedDataByNamedKey, expectedResult);
    });

    it('encodes data with hashed key', () => {
      const hashedKey =
        '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';

      const encodedDataByHashKey = encodeData(
        [
          {
            keyName: hashedKey,
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas,
      );
      assert.deepStrictEqual(encodedDataByHashKey, expectedResult);
    });

    it('encodes data with hashed key without 0x prefix', () => {
      const hashedKey =
        '0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';

      const encodedDataByHashKeyWithout0xPrefix = encodeData(
        [
          {
            keyName: hashedKey,
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas,
      );

      assert.deepStrictEqual(
        encodedDataByHashKeyWithout0xPrefix,
        expectedResult,
      );
    });

    it('encodes array', () => {
      const encodedDataWithMultipleKeys = encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: ['0xa3e6F38477D45727F6e6f853Cdb479b0D60c0aC9'],
          },
        ],
        schemas,
      );

      assert.deepStrictEqual(encodedDataWithMultipleKeys, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
        ],
        values: [
          '0x00000000000000000000000000000001',
          '0xa3e6f38477d45727f6e6f853cdb479b0d60c0ac9',
        ],
      });
    });

    it('encodes array', () => {
      const addressArray = [
        '0x6413255d24b8fbf81d2d65214c485c694cb3d4b4',
        '0xd6c68c2c94af899ce43ff1863693016a711ae7c7',
        '0x79b698f4bc3051f18b5f94046f09d70823a8fd44',
        '0x72bebf88546525a5888f188b390701bb0fd9b1a5',
        '0x882aca051979e32e787e8815d9880759f91e7124',
        '0x78827c8f8205072858a8cce39b8724d948327ba0',
        '0xe27cd9c132677cdce2e9efa43b040de35ceff069',
        '0x072616745957b45c8989e12b9563390fafac4ebe',
        '0xfd5a7c50c0cf665a772407af3f05522784589c44',
        '0x13de082cf8a499eee75b0681cfa0141a145f15d9',
        '0xe3610d0eb167fe7a7b7c25d0aee8874eb8b113ef',
      ];
      const encodedDataWithMultipleKeys = encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: addressArray,
          },
        ],
        schemas,
      );

      assert.deepStrictEqual(encodedDataWithMultipleKeys, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000002',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000003',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000004',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000005',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000006',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000007',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000008',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000009',
          '0x7c8c3416d6cda87cd42c71ea1843df280000000000000000000000000000000a',
        ],
        values: ['0x0000000000000000000000000000000b', ...addressArray],
      });
    });

    it('encodes array length only if giving a number', () => {
      const length = 5;

      const encodedArrayLengthKey = encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: length,
          },
        ],
        schemas,
      );

      assert.deepStrictEqual(encodedArrayLengthKey, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        ],
        values: ['0x00000000000000000000000000000005'],
      });
    });

    it('encodes multiple keys', () => {
      const encodedMultipleKeys = encodeData(
        [
          {
            keyName: 'LSP3Profile',
            value: {
              verification: {
                method: 'keccak256(utf8)',
                data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
              },
              url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
            },
          },
          {
            keyName: 'LSP12IssuedAssets[]',
            value: [
              '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
              '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
            ],
          },
          {
            keyName: 'LSP1UniversalReceiverDelegate',
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas,
      );

      assert.deepStrictEqual(encodedMultipleKeys, {
        keys: [
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        ],
        values: [
          '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
          '0x00000000000000000000000000000002',
          '0xd94353d9b005b3c0a9da169b768a31c57844e490',
          '0xdaea594e385fc724449e3118b2db7e86dfba1826',
          '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
        ],
      });
    });

    it('encodes dynamic keys', () => {
      const address = '0x78c964cd805233eb39f2db152340079088809725';

      const encodedDynamicKeys = encodeData(
        [
          {
            keyName: 'DynamicKey:<address>',
            dynamicKeyParts: [address],
            value: '0xc57390642767fc9adb0e4211fac735abe2edcfde',
          },
          {
            keyName: 'DynamicKey:<bytes4>:<string>',
            dynamicKeyParts: ['0x11223344', 'Summer'],
            value: '0x5bed9e061cea8b4be17d3b5ea85de62f483a40fd',
          },
        ],
        [
          {
            name: 'DynamicKey:<address>',
            key: '0x0fb367364e1852abc5f20000<address>',
            keyType: 'Mapping',
            valueType: 'bytes',
            valueContent: 'Address',
          },
          {
            name: 'DynamicKey:<bytes4>:<string>',
            key: '0xForDynamicKeysThisFieldIsIrrelevantAndWillBeOverwriten',
            keyType: 'Mapping',
            valueType: 'bytes',
            valueContent: 'Address',
          },
        ],
      );

      assert.deepStrictEqual(encodedDynamicKeys, {
        keys: [
          `0x0fb367364e1852abc5f20000${address.replace('0x', '')}`,
          '0x0fb367364e181122334400007746e4c8ba6f946d9f51a1c9e539fb62598962aa',
        ],
        values: [
          '0xc57390642767fc9adb0e4211fac735abe2edcfde',
          '0x5bed9e061cea8b4be17d3b5ea85de62f483a40fd',
        ],
      });
    });
  });

  describe('encodeData with custom array length and starting index', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'AddressPermissions[]',
        key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
        keyType: 'Array',
        valueType: 'address',
        valueContent: 'Address',
      },
    ];

    it('should be able to specify the array length + starting index', () => {
      const encodedArraySection = encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: [
              '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
              '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
            ],
            totalArrayLength: 23,
            startingIndex: 21,
          },
        ],
        schemas,
      );

      // Expected result with custom startingIndex and totalArrayLength
      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000015', // 21
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000016', // 22
        ],
        values: [
          '0x00000000000000000000000000000017', // 23
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
          '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
        ],
      };

      assert.deepStrictEqual(
        encodedArraySection,
        expectedResult,
        'Encoding with custom starting index and array length should match the expected result.',
      );
    });

    it('should throw if startingIndex is negative', () => {
      const encodeDataWithNegativeStartingIndex = () => {
        encodeData(
          [
            {
              keyName: 'AddressPermissions[]',
              value: ['0x983abc616f2442bab7a917e6bb8660df8b01f3bf'],
              totalArrayLength: 1,
              startingIndex: -1,
            },
          ],
          schemas,
        );
      };

      assert.throws(
        encodeDataWithNegativeStartingIndex,
        /Invalid `startingIndex`/,
        'Should throw an error for negative startingIndex',
      );
    });

    it('should throw if totalArrayLength is smaller than elements in provided value array', () => {
      const encodeDataWithLowerTotalArrayLength = () => {
        encodeData(
          [
            {
              keyName: 'AddressPermissions[]',
              value: [
                '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
                '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
              ],
              totalArrayLength: 1, // 2 elements
              startingIndex: 0,
            },
          ],
          schemas,
        );
      };

      assert.throws(
        encodeDataWithLowerTotalArrayLength,
        /Invalid `totalArrayLength`/,
        'Should throw an error for totalArrayLength smaller than the number of provided elements',
      );
    });

    it('should start from 0 if startingIndex is not provided', () => {
      const result = encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: ['0x983abc616f2442bab7a917e6bb8660df8b01f3bf'],
            totalArrayLength: 1,
          },
        ],
        schemas,
      );

      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
        ],
        values: [
          '0x00000000000000000000000000000001',
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
        ],
      };

      assert.deepStrictEqual(
        result,
        expectedResult,
        'Should encode starting from index 0 if startingIndex is not provided',
      );
    });

    it('should use the number of elements in value field if totalArrayLength is not provided', () => {
      const result = encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: [
              '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
              '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
            ],
            // Not specifying totalArrayLength, it should default to the number of elements in the value array
            startingIndex: 0,
          },
        ],
        schemas,
      );

      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000001',
        ],
        values: [
          '0x00000000000000000000000000000002',
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
          '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
        ],
      };

      assert.deepStrictEqual(
        result,
        expectedResult,
        'should use the number of elements in value field if totalArrayLength is not provided',
      );
    });
  });

  describe('isDataAuthentic', () => {
    it('returns true if data is authentic', () => {
      const data = 'h3ll0HowAreYou?';
      const expectedHash = keccak256(data);

      const isAuthentic = isDataAuthentic(data, {
        data: expectedHash,
        method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_BYTES,
      });

      assert.ok(isAuthentic);
    });
    it('returns false if data is not authentic', () => {
      const data = 'h3ll0HowAreYou?';
      const expectedHash = 'wrongHash';

      const isAuthentic = isDataAuthentic(data, {
        data: expectedHash,
        method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_BYTES,
      });

      assert.strictEqual(isAuthentic, false);
    });
  });

  describe('guessKeyTypeFromKeyName', () => {
    const testCases: { keyType: ERC725JSONSchemaKeyType; keyName: string }[] = [
      {
        keyType: 'Singleton',
        keyName: 'MyKeyName',
      },
      {
        keyType: 'Array',
        keyName: 'LSP12IssuedAssets[]',
      },
      {
        keyType: 'Mapping',
        keyName: 'SupportedStandards:LSP3Profile',
      },
      {
        keyType: 'Mapping',
        keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
      },
      {
        keyType: 'Mapping',
        keyName: 'MyCoolAddress:cafecafecafecafecafecafecafecafecafecafe',
      },
      {
        keyType: 'MappingWithGrouping',
        keyName:
          'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
      },
      {
        keyType: 'MappingWithGrouping',
        keyName:
          'AddressPermissions:Permissions:0xcafecafecafecafecafecafecafecafecafecafe',
      },
    ];

    testCases.forEach((testCase) => {
      it(`guesses ${testCase.keyType}`, () => {
        assert.deepStrictEqual(
          guessKeyTypeFromKeyName(testCase.keyName),
          testCase.keyType,
        );
      });
    });
  });

  describe('convertIPFSGatewayUrl', () => {
    const expectedIPFSGateway = 'https://cloudflare-ipfs.com/ipfs/';

    it('converts when missing /ipfs/', () => {
      assert.deepStrictEqual(
        convertIPFSGatewayUrl('https://cloudflare-ipfs.com'),
        expectedIPFSGateway,
      );
    });
    it('converts when missing /', () => {
      assert.deepStrictEqual(
        convertIPFSGatewayUrl('https://cloudflare-ipfs.com/ipfs'),
        expectedIPFSGateway,
      );
    });
    it('converts when missing ipfs/', () => {
      assert.deepStrictEqual(
        convertIPFSGatewayUrl('https://cloudflare-ipfs.com/'),
        expectedIPFSGateway,
      );
    });
    it('does not convert when passed correctly', () => {
      assert.deepStrictEqual(
        convertIPFSGatewayUrl('https://cloudflare-ipfs.com/ipfs/'),
        expectedIPFSGateway,
      );
    });
  });

  describe('generateSchemasFromDynamicKeys', () => {
    it('generates a non dynamic schema correctly', () => {
      const schemas: ERC725JSONSchema[] = [
        {
          name: 'AddressPermissions:AllowedFunctions:<address>',
          key: '0x4b80742de2bf8efea1e80000<address>',
          keyType: 'MappingWithGrouping',
          valueType: 'bytes4[]',
          valueContent: 'Bytes4',
        },
        {
          name: 'AddressPermissions[]',
          key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          keyType: 'Array',
          valueType: 'address',
          valueContent: 'Address',
        },
        {
          name: 'LSP4CreatorsMap:<address>',
          key: '0x6de85eaf5d982b4e5da00000<address>',
          keyType: 'Mapping',
          valueType: 'bytes',
          valueContent: 'Bytes4',
        },
      ];

      const keys: Array<string | GetDataDynamicKey> = [
        'AddressPermissions[]',
        {
          keyName: 'LSP4CreatorsMap:<address>',
          dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
        },
      ];

      const generatedSchemas = generateSchemasFromDynamicKeys(keys, schemas);

      expect(generatedSchemas.length).to.equal(keys.length);

      generatedSchemas.forEach((schema) => {
        expect(
          isDynamicKeyName(schema.name),
          'generated schema key should not be dynamic',
        ).to.be.false;
      });
    });
  });

  describe('splitMultiDynamicKeyNamePart', () => {
    it('returns the exact input string if it is not a dynamic string', () => {
      const keyName = 'ImNotDynamic';

      assert.deepStrictEqual(splitMultiDynamicKeyNamePart(keyName), [keyName]);
    });
    it('returns an array with each type when the input is a dynamic string', () => {
      const keyName = '<address|bytes32|uint256>';

      assert.deepStrictEqual(splitMultiDynamicKeyNamePart(keyName), [
        'address',
        'bytes32',
        'uint256',
      ]);
    });
  });

  describe('duplicateMultiTypeERC725SchemaEntry', () => {
    it('returns the exact input in an array if there is no dynamic type in it', () => {
      const schema: ERC725JSONSchema = {
        name: 'AddressPermissions[]', // This type is not dynamic
        key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
        keyType: 'Array',
        valueType: 'address',
        valueContent: 'Address',
      };

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, [schema]);
    });
    it('returns the exact input in an array if there is only one dynamic type in it for Mapping', () => {
      const schema: ERC725JSONSchema = {
        name: 'LSP1UniversalReceiverDelegate:<bytes32>',
        key: '0x0cfc51aec37c55a4d0b10000<bytes32>',
        keyType: 'Mapping',
        valueType: 'address',
        valueContent: 'Address',
      };

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, [schema]);
    });
    it('returns the exact input in an array if there is only one dynamic type in it for MappingWithGrouping', () => {
      const schema: ERC725JSONSchema = {
        name: 'AddressPermissions:AllowedCalls:<address>',
        key: '0x4b80742de2bf393a64c70000<address>',
        keyType: 'MappingWithGrouping',
        valueType: '(bytes4,address,bytes4,bytes4)[CompactBytesArray]',
        valueContent: '(BitArray,Address,Bytes4,Bytes4)',
      };

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, [schema]);
    });
    it('splits and returns one schema for each dynamic name type for Mapping', () => {
      const schema: ERC725JSONSchema = {
        name: 'LSP8MetadataTokenURI:<address|uint256|bytes32|string>',
        key: '0x1339e76a390b7b9ec9010000<address|uint256|bytes32|string>',
        keyType: 'Mapping',
        valueType: '(bytes4,string)',
        valueContent: '(Bytes4,URI)',
      };

      const expectedSchemas: ERC725JSONSchema[] = [
        {
          name: 'LSP8MetadataTokenURI:<address>',
          key: '0x1339e76a390b7b9ec9010000<address>',
          keyType: 'Mapping',
          valueType: '(bytes4,string)',
          valueContent: '(Bytes4,URI)',
        },
        {
          name: 'LSP8MetadataTokenURI:<uint256>',
          key: '0x1339e76a390b7b9ec9010000<uint256>',
          keyType: 'Mapping',
          valueType: '(bytes4,string)',
          valueContent: '(Bytes4,URI)',
        },
        {
          name: 'LSP8MetadataTokenURI:<bytes32>',
          key: '0x1339e76a390b7b9ec9010000<bytes32>',
          keyType: 'Mapping',
          valueType: '(bytes4,string)',
          valueContent: '(Bytes4,URI)',
        },
        {
          name: 'LSP8MetadataTokenURI:<string>',
          key: '0x1339e76a390b7b9ec9010000<string>',
          keyType: 'Mapping',
          valueType: '(bytes4,string)',
          valueContent: '(Bytes4,URI)',
        },
      ];

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, expectedSchemas);
    });
    it('splits and returns one schema for each dynamic name type for MappingWithGrouping', () => {
      const schema: ERC725JSONSchema = {
        name: 'AddressPermissions:AllowedCalls:<address|string>',
        key: '0x4b80742de2bf393a64c70000<address|string>',
        keyType: 'MappingWithGrouping',
        valueType: 'address',
        valueContent: 'Address',
      };

      const expectedSchemas: ERC725JSONSchema[] = [
        {
          name: 'AddressPermissions:AllowedCalls:<address>',
          key: '0x4b80742de2bf393a64c70000<address>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
        {
          name: 'AddressPermissions:AllowedCalls:<string>',
          key: '0x4b80742de2bf393a64c70000<string>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
      ];

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, expectedSchemas);
    });
    it('splits and returns one schema for each dynamic name type for MappingWithGrouping with multiple types', () => {
      const schema: ERC725JSONSchema = {
        name: 'MyKeyName:<bytes2|address>:<uint32|address>',
        key: '0x35e6950bc8d2<bytes2|address><uint32|address>',
        keyType: 'MappingWithGrouping',
        valueType: 'address',
        valueContent: 'Address',
      };

      const expectedSchemas: ERC725JSONSchema[] = [
        {
          name: 'MyKeyName:<bytes2>:<uint32>',
          key: '0x35e6950bc8d2<bytes2><uint32>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
        {
          name: 'MyKeyName:<bytes2>:<address>',
          key: '0x35e6950bc8d2<bytes2><address>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
        {
          name: 'MyKeyName:<address>:<uint32>',
          key: '0x35e6950bc8d2<address><uint32>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
        {
          name: 'MyKeyName:<address>:<address>',
          key: '0x35e6950bc8d2<address><address>',
          keyType: 'MappingWithGrouping',
          valueType: 'address',
          valueContent: 'Address',
        },
      ];

      const duplicatedSchemas = duplicateMultiTypeERC725SchemaEntry(schema);

      assert.deepStrictEqual(duplicatedSchemas, expectedSchemas);
    });
  });
});
