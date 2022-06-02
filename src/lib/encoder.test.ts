import assert from 'assert';
import { keccak256, utf8ToHex } from 'web3-utils';
import {
  valueContentEncodingMap,
  encodeValueType,
  decodeValueType,
  encodeValueContent,
  decodeValueContent,
} from './encoder';
import {
  SUPPORTED_HASH_FUNCTION_HASHES,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from './constants';
import { JSONURLDataToEncode, URLDataWithHash } from '../types';

describe('encoder', () => {
  describe('valueType', () => {
    const testCases = [
      {
        valueType: 'string',
        decodedValue: 'Hello I am a string',
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001348656c6c6f204920616d206120737472696e6700000000000000000000000000',
      },
      {
        valueType: 'address',
        decodedValue: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        encodedValue:
          '0x000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7',
      },
      {
        valueType: 'uint256',
        decodedValue: '1337',
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000539',
      },
      {
        valueType: 'bytes32',
        decodedValue:
          '0x1337000000000000000000000000000000000000000000000000000000000000',
        encodedValue:
          '0x1337000000000000000000000000000000000000000000000000000000000000',
      },
      {
        valueType: 'bytes4',
        decodedValue: '0x13370000',
        encodedValue:
          '0x1337000000000000000000000000000000000000000000000000000000000000',
      },
      {
        valueType: 'bytes',
        decodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000001337',
        encodedValue:
          '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001337',
      },
      {
        valueType: 'string[]',
        decodedValue: ['a', 'b'],
        encodedValue:
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016200000000000000000000000000000000000000000000000000000000000000',
      },
      {
        valueType: 'address[]',
        decodedValue: [
          '0x68114e23B500Cdb63A5B6c9006f3acB0325AD0CC',
          '0x7466e40FEF4978394A07C9124ad4aD1A374b9465',
        ],
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000068114e23b500cdb63a5b6c9006f3acb0325ad0cc0000000000000000000000007466e40fef4978394a07c9124ad4ad1a374b9465',
      },
      {
        valueType: 'uint256[]',
        decodedValue: ['1', '99'],
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000063',
      },
      {
        valueType: 'bytes32[]',
        decodedValue: [
          '0x1337000000000000000000000000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000000000000000000061626364',
        ],
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000213370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000061626364',
      },
      {
        valueType: 'bytes4[]',
        decodedValue: ['0x12345678', '0x87654321'],
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000212345678000000000000000000000000000000000000000000000000000000008765432100000000000000000000000000000000000000000000000000000000',
      },
      {
        valueType: 'bytes[]',
        decodedValue: [
          '0x0000000000000000000000000000000000000000000000000000000000001337',
          '0x00000000000000000000000000000000000000000000000000000000000054ef',
        ],
        encodedValue:
          '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001337000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000054ef',
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes/decodes: ${testCase.valueType}`, () => {
        const encodedValue = encodeValueType(
          testCase.valueType,
          testCase.decodedValue,
        );

        assert.deepStrictEqual(encodedValue, testCase.encodedValue);
        assert.deepStrictEqual(
          decodeValueType(testCase.valueType, encodedValue),
          testCase.decodedValue,
        );
      });
    });

    it('should throw when valueType is unknown', () => {
      assert.throws(
        () => {
          encodeValueType('????', 'hi');
        },
        () => true,
      );
      assert.throws(
        () => {
          decodeValueType('whatIsthisType', 'hi');
        },
        () => true,
      );
    });
  });

  describe('valueContent', () => {
    const testCases = [
      {
        valueContent: 'Keccak256',
        decodedValue:
          '7f37518252ad8c46b3eecd357685e7cd0e2ed88534c10751b1b81ac04dc40bc3',
        encodedValue:
          '7f37518252ad8c46b3eecd357685e7cd0e2ed88534c10751b1b81ac04dc40bc3',
      },
      {
        valueContent: 'Number',
        decodedValue: '876',
        encodedValue:
          '0x000000000000000000000000000000000000000000000000000000000000036c',
      },
      {
        valueContent: 'Address',
        decodedValue: '0xa29Afb8F3ccE086B3992621324E9d7c104F03D1B',
        encodedValue: '0xa29afb8f3cce086b3992621324e9d7c104f03d1b',
      },
      {
        valueContent: 'String',
        decodedValue: 'hello',
        encodedValue: '0x68656c6c6f',
      },
      {
        valueContent: 'Markdown',
        decodedValue: '# hello',
        encodedValue: '0x232068656c6c6f',
      },
      {
        valueContent: 'URL',
        decodedValue: 'http://test.com',
        encodedValue: '0x687474703a2f2f746573742e636f6d',
      },
      {
        valueContent: 'AssetURL',
        decodedValue: {
          hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
          hash: '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168',
          url: 'http://test.com/asset.glb',
        },
        encodedValue:
          '0x6f357c6a027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168687474703a2f2f746573742e636f6d2f61737365742e676c62',
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes/decodes: ${testCase.valueContent}`, () => {
        const encodedValue = encodeValueContent(
          testCase.valueContent,
          testCase.decodedValue,
        );

        encodeValueContent(testCase.valueContent, testCase.decodedValue);

        assert.deepStrictEqual(encodedValue, testCase.encodedValue);
        assert.deepStrictEqual(
          decodeValueContent(testCase.valueContent, encodedValue),
          testCase.decodedValue,
        );
      });
    });

    it('encodes/decodes: JSONURL', () => {
      const dataToEncode: JSONURLDataToEncode = {
        url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
        json: {
          myProperty: 'is a string',
          anotherProperty: {
            key: 123456,
          },
        },
      };
      const encodedValue = encodeValueContent('JSONURL', dataToEncode);

      const hashFunction = SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_UTF8;
      const hexUrl = utf8ToHex(dataToEncode.url).substring(2);
      const jsonDataHash = keccak256(
        JSON.stringify(dataToEncode.json),
      ).substring(2);
      assert.deepStrictEqual(
        encodedValue,
        hashFunction + jsonDataHash + hexUrl,
      );

      const expectedDecodedValue: URLDataWithHash = {
        hash: `0x${jsonDataHash}`,
        hashFunction: SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
        url: dataToEncode.url,
      };

      assert.deepStrictEqual(
        decodeValueContent('JSONURL', encodedValue),
        expectedDecodedValue,
      );
    });

    it('should throw when valueContent is unknown', () => {
      assert.throws(
        () => {
          encodeValueContent('wrongContent', 'hi');
        },
        () => true,
      );
      assert.throws(
        () => {
          decodeValueContent('wrongContent', 'hi');
        },
        () => true,
      );
    });

    it('should return the value if the valueContent == value', () => {
      const value =
        '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168';

      assert.deepStrictEqual(encodeValueContent(value, value), value);
      assert.deepStrictEqual(decodeValueContent(value, value), value);
    });

    describe('JSONURL', () => {
      it('throws when the hashFunction of JSON of JSONURL to encode is not keccak256(utf8)', () => {
        assert.throws(
          () => {
            // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
            valueContentEncodingMap.JSONURL.encode({
              hashFunction: 'whatever',
              url: 'https://file-desination.com/file-name',
              hash: '0x321',
              json: {
                hello: 'mario',
              },
            });
          },
          (error: any) =>
            error.message ===
            'When passing in the `json` property, we use "keccak256(utf8)" as a default hashingFunction. You do not need to set a `hashFunction`.',
        );
      });

      it('throws when JSONURL encode a JSON without json or hash key', () => {
        assert.throws(
          () => {
            // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
            valueContentEncodingMap.JSONURL.encode({
              hashFunction: 'keccak256(utf8)',
              url: 'https://file-desination.com/file-name',
            });
          },
          (error: any) =>
            error.message ===
            'You have to provide either the hash or the json via the respective properties',
        );
      });
    });
  });
});
