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
import { keccak256, utf8ToHex, stripHexPrefix } from 'web3-utils';
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
} from '../constants/constants';
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
      {
        valueType: 'bytes[CompactBytesArray]',
        decodedValue: [
          '0xaabb',
          '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
          '0xbeefbeefbeefbeefbeef',
        ],
        encodedValue:
          '0x0002aabb0020cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe000abeefbeefbeefbeefbeef',
      },
      {
        valueType: 'bytes[CompactBytesArray]',
        decodedValue: [`0x${'cafe'.repeat(256)}`, `0x${'beef'.repeat(250)}`],
        encodedValue: `0x0200${'cafe'.repeat(256)}01f4${'beef'.repeat(250)}`,
      },
      {
        valueType: 'string[CompactBytesArray]',
        decodedValue: [
          'one random string',
          'bring back my coke',
          'Diagon Alley',
        ],
        encodedValue: `0x0011${stripHexPrefix(
          utf8ToHex('one random string'),
        )}0012${stripHexPrefix(
          utf8ToHex('bring back my coke'),
        )}000c${stripHexPrefix(utf8ToHex('Diagon Alley'))}`,
      },
      {
        valueType: 'uint8[CompactBytesArray]',
        decodedValue: [1, 43, 73, 255],
        encodedValue: '0x00010100012b0001490001ff',
      },
      {
        valueType: 'bytes4[CompactBytesArray]',
        decodedValue: ['0xe6520726', '0x272696e6', '0x72062616', '0xab7f11e3'],
        encodedValue: '0x0004e65207260004272696e60004720626160004ab7f11e3',
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

    describe('when encoding bytes[CompactBytesArray]', () => {
      it('should encode `0x` elements as `0x0000`', async () => {
        const testCase = {
          valueType: 'bytes[CompactBytesArray]',
          decodedValue: ['0xaabb', '0x', '0x', '0xbeefbeefbeefbeefbeef'],
          encodedValue: '0x0002aabb00000000000abeefbeefbeefbeefbeef',
        };

        const encodedValue = encodeValueType(
          testCase.valueType,
          testCase.decodedValue,
        );
        assert.deepStrictEqual(encodedValue, testCase.encodedValue);
      });

      it("should encode '' (empty strings) elements as `0x0000`", async () => {
        const testCase = {
          valueType: 'bytes[CompactBytesArray]',
          decodedValue: ['0xaabb', '', '', '0xbeefbeefbeefbeefbeef'],
          encodedValue: '0x0002aabb00000000000abeefbeefbeefbeefbeef',
        };

        const encodedValue = encodeValueType(
          testCase.valueType,
          testCase.decodedValue,
        );
        assert.deepStrictEqual(encodedValue, testCase.encodedValue);
      });

      it('should throw when trying to encode a array that contains non hex string as `bytes[CompactBytesArray]`', async () => {
        expect(() => {
          encodeValueType('bytes[CompactBytesArray]', [
            'some random string',
            'another random strings',
            '0xaabbccdd',
          ]);
        }).to.throw(
          "Couldn't encode bytes[CompactBytesArray], value at index 0 is not hex",
        );
      });

      it('should throw when trying to encode a `bytes[CompactBytesArray]` with a bytes length bigger than 65_535', async () => {
        expect(() => {
          encodeValueType('bytes[CompactBytesArray]', [
            '0x' + 'ab'.repeat(66_0000),
          ]);
        }).to.throw(
          "Couldn't encode bytes[CompactBytesArray], value at index 0 exceeds 65_535 bytes",
        );
      });
    });

    describe('when encoding uintN[CompactBytesArray]', () => {
      it('should throw if trying to encode a value that exceeds the maximal lenght of bytes for this type', async () => {
        expect(() => {
          encodeValueType('uint8[CompactBytesArray]', [15, 178, 266]);
        }).to.throw('Hex uint8 value at index 2 does not fit in 1 bytes');
      });

      it('should throw if trying to decode a value that exceeds the maximal lenght of bytes for this type', async () => {
        expect(() => {
          decodeValueType(
            'uint8[CompactBytesArray]',
            '0x00010100012b00014900020100',
          );
        }).to.throw('Hex uint8 value at index 3 does not fit in 1 bytes');
      });
    });

    describe('when encoding bytesN[CompactBytesArray]', () => {
      it('should throw if trying to encode a value that exceeds the maximal lenght of bytes for this type', async () => {
        expect(() => {
          encodeValueType('bytes4[CompactBytesArray]', [
            '0xe6520726',
            '0x272696e6',
            '0x72062616',
            '0xab7f11e3aabbcc',
          ]);
        }).to.throw('Hex bytes4 value at index 3 does not fit in 4 bytes');
      });

      it('should throw if trying to decode a value that exceeds the maximal lenght of bytes for this type', async () => {
        expect(() => {
          decodeValueType(
            'bytes4[CompactBytesArray]',
            '0x0004e65207260004272696e60004720626160007ab7f11e3aabbcc',
          );
        }).to.throw('Hex bytes4 value at index 3 does not fit in 4 bytes');
      });
    });

    describe('when decoding a bytes[CompactBytesArray] that contains `0000` entries', () => {
      it("should decode as '' (empty string) in the decoded array", async () => {
        const testCase = {
          valueType: 'bytes[CompactBytesArray]',
          decodedValue: ['0xaabb', '', '', '0xbeefbeefbeefbeefbeef'],
          encodedValue: '0x0002aabb00000000000abeefbeefbeefbeefbeef',
        };

        const decodedValue = decodeValueType(
          testCase.valueType,
          testCase.encodedValue,
        );
        assert.deepStrictEqual(decodedValue, testCase.decodedValue);
      });

      it('should throw when trying to decode a `bytes[CompactBytesArray]` with an invalid length byte', async () => {
        expect(() => {
          decodeValueType('bytes[CompactBytesArray]', '0x0005cafe');
        }).to.throw("Couldn't decode bytes[CompactBytesArray]");
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
      {
        valueContent: 'BitArray',
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000008', // ... 0000 0000 1000
        decodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000008',
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
        url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
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

    it('should throw when encodeValueContent value is a string and valueContent is JSONURL or ASSETURL', () => {
      expect(() => {
        encodeValueContent('AssetURL', 'imnotanobject!');
      }).to.throw;
      expect(() => {
        encodeValueContent('JSONURL', 'imnotanobject!');
      }).to.throw;
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
            valueContentEncodingMap('JSONURL').encode({
              // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
              hashFunction: 'whatever',
              url: 'https://file-desination.com/file-name',
              hash: '0x321',
            });
          },
          (error: any) => {
            return (
              error.message ===
              `Chosen hashFunction 'whatever' is not supported. Supported hashFunctions: keccak256(utf8),keccak256(bytes)`
            );
          },
        );
      });

      it('throws when JSONURL encode a JSON without json or hash key', () => {
        assert.throws(
          () => {
            valueContentEncodingMap('JSONURL').encode({
              // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
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
