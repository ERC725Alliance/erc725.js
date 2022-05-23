import assert from 'assert';
import { keccak256, utf8ToHex } from 'web3-utils';
import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueType,
} from '../types/ERC725JSONSchema';

import { SUPPORTED_HASH_FUNCTION_STRINGS } from './constants';
import {
  flattenEncodedData,
  encodeKeyName,
  guessKeyTypeFromKeyName,
  isDataAuthentic,
  getSchemaElement,
  encodeArrayKey,
  encodeKeyValue,
  decodeKeyValue,
  encodeKey,
  decodeKey,
  encodeData,
  convertIPFSGatewayUrl,
} from './utils';

describe('utils', () => {
  describe('#flattenEncodedData', () => {
    it('should flatten encodedData (with one key)', () => {
      const encodedData = {
        LSP3Profile: {
          value:
            '0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1696670733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d',
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        },
      };

      assert.deepStrictEqual(flattenEncodedData(encodedData), [
        {
          value: encodedData.LSP3Profile.value,
          key: encodedData.LSP3Profile.key,
        },
      ]);
    });

    it('should flatten encodedData (with multiple keys)', () => {
      const encodedDataManyKeys = {
        item1: {
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          value:
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        },
        item2: {
          key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
          value: '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
        },
        item3: {
          key: 'array',
          value: [
            {
              key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
              value:
                '0x0000000000000000000000000000000000000000000000000000000000000002',
            },
            {
              key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
              value: '0xd94353d9b005b3c0a9da169b768a31c57844e490',
            },
            {
              key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
              value: '0xdaea594e385fc724449e3118b2db7e86dfba1826',
            },
          ],
        },
      };

      const flattenedEncodedData = flattenEncodedData(encodedDataManyKeys);

      assert.deepStrictEqual(flattenedEncodedData, [
        {
          key: encodedDataManyKeys.item2.key,
          value: encodedDataManyKeys.item2.value,
        },
        {
          key: encodedDataManyKeys.item3.value[1].key,
          value: encodedDataManyKeys.item3.value[1].value,
        },
        {
          key: encodedDataManyKeys.item3.value[2].key,
          value: encodedDataManyKeys.item3.value[2].value,
        },
        {
          key: encodedDataManyKeys.item3.value[0].key,
          value: encodedDataManyKeys.item3.value[0].value,
        },
        {
          key: encodedDataManyKeys.item1.key,
          value: encodedDataManyKeys.item1.value,
        },
      ]);
    });
  });

  describe('encodeKey/decodeKey', () => {
    it('encodes/decodes keyType Array', () => {
      const testCases = [
        {
          schema: {
            name: 'LSP3IssuedAssets[]',
            key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
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
              key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
              value:
                '0x0000000000000000000000000000000000000000000000000000000000000002',
            },
            {
              key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
              value: '0xc444009d38d3046bb0cf81fa2cd295ce46a67c78',
            },
            {
              key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
              value: '0x4febc3491230571f6e1829e46602e3b110215a2e',
            },
          ],
        },
        {
          schema: {
            name: 'TestObjArray[]',
            key: '0x9985edaf12cbacf5ac7d6ed54f0445cc0ea56075aee9b9942e4ab3bf4239f950',
            keyType: 'Array',
            valueContent: 'JSONURL',
            valueType: 'bytes',
          },
          decodedValue: [
            {
              hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
              hash: '0x733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d',
              url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
            },
            {
              hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
              hash: '0x81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88',
              url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
            },
          ],
          encodedValue: [
            {
              key: '0x9985edaf12cbacf5ac7d6ed54f0445cc0ea56075aee9b9942e4ab3bf4239f950',
              value:
                '0x0000000000000000000000000000000000000000000000000000000000000002',
            },
            {
              key: '0x9985edaf12cbacf5ac7d6ed54f0445cc00000000000000000000000000000000',
              value:
                '0x6f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
            },
            {
              key: '0x9985edaf12cbacf5ac7d6ed54f0445cc00000000000000000000000000000001',
              value:
                '0x6f357c6a81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88697066733a2f2f516d6245724b6833466a7378787878787878787878787878787878787878787878787878787639414a4a765a6264',
            },
          ],
        },
      ];

      testCases.forEach((testCase) => {
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
        decodedValue: ['123', '456'],
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
          hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
          hash: '0x81dadadadadadadadadadadadadadadf00a4bdfa8fcaf3791d25f69b497abf88',
          url: 'http://day.night/asset.glb',
        },
        encodedValue:
          '0x6f357c6a81dadadadadadadadadadadadadadadf00a4bdfa8fcaf3791d25f69b497abf88687474703a2f2f6461792e6e696768742f61737365742e676c62',
      },
      {
        valueContent: 'JSONURL',
        valueType: 'bytes',
        decodedValue: {
          hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
          hash: '0x81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88',
          url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
        },
        encodedValue:
          '0x6f357c6a81bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88697066733a2f2f516d6245724b6833466a7378787878787878787878787878787878787878787878787878787639414a4a765a6264',
      },
      // THE CASES BELOW ARE CURRENTLY NOT SUPPORTED BY THE LIB
      // {
      //   valueContent: 'Bytes',
      //   valueType: 'bytes',
      //   decodedValue: '0xaaAE32',
      //   encodedValue: '0xaaAE32',
      // },
      // {
      //   valueContent: 'Bytes32',
      //   valueType: 'bytes',
      //   decodedValue:
      //     '0x7465737400000000000000000000000000000000000000000000000000000000',
      //   encodedValue:
      //     '0x7465737400000000000000000000000000000000000000000000000000000000',
      // },
      {
        valueContent: '0xc9aaAE3201F40fd0fF04D9c885769d8256A456ab',
        valueType: 'bytes',
        decodedValue: '0xc9aaAE3201F40fd0fF04D9c885769d8256A456ab',
        encodedValue: '0xc9aaAE3201F40fd0fF04D9c885769d8256A456ab',
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

  describe('encodeArrayKey', () => {
    it('encodes array key correctly', () => {
      const key =
        '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0';

      const expectedValues = [
        '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
        '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
        '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000002',
      ];

      expectedValues.forEach((expectedValue, index) => {
        assert.strictEqual(encodeArrayKey(key, index), expectedValue);
      });
    });
  });

  describe('encodeData', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP3IssuedAssets[]',
        key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
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

    it('encode data with named key', () => {
      const encodedDataByNamedKey = encodeData(
        {
          LSP1UniversalReceiverDelegate:
            '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },
        schemas,
      );
      assert.deepStrictEqual(encodedDataByNamedKey, expectedResult);
    });

    it('encode data with hashed key', () => {
      const hashedKey =
        '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';

      const encodedDataByHashKey = encodeData(
        {
          [hashedKey]: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },
        schemas,
      );
      assert.deepStrictEqual(encodedDataByHashKey, expectedResult);
    });

    it('encode data with hashed key without 0x prefix', () => {
      const hashedKey =
        '0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';

      const encodedDataByHashKeyWithout0xPrefix = encodeData(
        {
          [hashedKey]: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },
        schemas,
      );

      assert.deepStrictEqual(
        encodedDataByHashKeyWithout0xPrefix,
        expectedResult,
      );
    });

    it('encode array', () => {
      const encodedDataWithMultipleKeys = encodeData(
        {
          'LSP3IssuedAssets[]': ['0xa3e6F38477D45727F6e6f853Cdb479b0D60c0aC9'],
        },
        schemas,
      );

      assert.deepStrictEqual(encodedDataWithMultipleKeys, {
        keys: [
          '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
          '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
        ],
        values: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0xa3e6f38477d45727f6e6f853cdb479b0d60c0ac9',
        ],
      });
    });

    it('encode multiple keys', () => {
      const encodedMultipleKeys = encodeData(
        {
          LSP3Profile: {
            hashFunction: 'keccak256(utf8)',
            hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
            url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
          },
          'LSP3IssuedAssets[]': [
            '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
            '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
          ],
          LSP1UniversalReceiverDelegate:
            '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },
        schemas,
      );

      assert.deepStrictEqual(encodedMultipleKeys, {
        keys: [
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
          '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
          '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
          '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        ],
        values: [
          '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
          '0xd94353d9b005b3c0a9da169b768a31c57844e490',
          '0xdaea594e385fc724449e3118b2db7e86dfba1826',
          '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
        ],
      });
    });
  });

  describe('getSchemaElement', () => {
    it('gets the schemaElement correctly', () => {
      const key =
        '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5';

      const schemas: ERC725JSONSchema[] = [
        {
          name: 'LSP3Profile',
          key,
          keyType: 'Singleton',
          valueContent: 'JSONURL',
          valueType: 'bytes',
        },
      ];

      assert.strictEqual(getSchemaElement(schemas, key), schemas[0]);
    });
  });

  describe('isDataAuthentic', () => {
    it('returns true if data is authentic', () => {
      const data = 'h3ll0HowAreYou?';
      const expectedHash = keccak256(data);

      const isAuthentic = isDataAuthentic(
        data,
        expectedHash,
        SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES,
      );

      assert.ok(isAuthentic);
    });
    it('returns false if data is not authentic', () => {
      const data = 'h3ll0HowAreYou?';
      const expectedHash = 'wrongHash';

      const isAuthentic = isDataAuthentic(
        data,
        expectedHash,
        SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES,
      );

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
        keyName: 'LSP3IssuedAssets[]',
      },
      {
        keyType: 'Mapping',
        keyName: 'SupportedStandards:LSP3UniversalProfile',
      },
      {
        keyType: 'Bytes20Mapping',
        keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
      },
      {
        keyType: 'Bytes20MappingWithGrouping',
        keyName:
          'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
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

  describe('encodeKeyName', () => {
    const testCases: { keyName: string; key: string }[] = [
      {
        keyName: 'MyKeyName',
        key: keccak256('MyKeyName'),
      },
      {
        keyName: 'LSP3IssuedAssets[]',
        key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
      },
      {
        keyName: 'SupportedStandards:LSP3UniversalProfile',
        key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6',
      },
      {
        keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
        key: '0x22496f48a493035f00000000cafecafecafecafecafecafecafecafecafecafe',
      },
      {
        keyName:
          'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
        key: '0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe',
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes ${testCase.keyName} key name correctly`, () => {
        assert.deepStrictEqual(encodeKeyName(testCase.keyName), testCase.key);
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
});
