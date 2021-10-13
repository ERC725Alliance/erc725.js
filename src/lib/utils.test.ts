import assert from 'assert';
import { keccak256 } from 'web3-utils';
import { ERC725JSONSchemaKeyType } from '../types/ERC725JSONSchema';

import { SUPPORTED_HASH_FUNCTION_STRINGS } from './constants';
import {
  flattenEncodedData,
  encodeKeyName,
  guessKeyTypeFromKeyName,
  isDataAuthentic,
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
        keyName: 'SupportedStandards:ERC725Account',
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
        keyName: 'SupportedStandards:ERC725Account',
        key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
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
});
