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

import { expect, assert } from 'chai';
import { stripHexPrefix } from 'web3-eth-accounts';

import { keccak256, utf8ToHex, toHex, padLeft, toBigInt } from 'web3-utils';
import {
  valueContentEncodingMap,
  encodeValueType,
  decodeValueType,
  encodeValueContent,
  decodeValueContent,
  encodeDataSourceWithHash,
  decodeDataSourceWithHash,
} from './encoder';
import {
  NONE_VERIFICATION_METHOD,
  SUPPORTED_VERIFICATION_METHOD_HASHES,
  SUPPORTED_VERIFICATION_METHOD_STRINGS,
} from '../constants/constants';
import type { URLDataToEncode, URLDataWithHash } from '../types';
import ERC725, { getVerificationMethod } from '..';
import { mockJson } from '../../test/mockSchema' with { type: 'json' };

describe('encoder', () => {
  describe('valueType', () => {
    describe('`bool`/`boolean` type', () => {
      const validTestCases = [
        {
          valueType: 'bool',
          decodedValue: true,
          encodedValue: '0x01',
        },
        {
          valueType: 'bool',
          decodedValue: false,
          encodedValue: '0x00',
        },
        {
          valueType: 'boolean', // allow to specify "boolean"
          decodedValue: true,
          encodedValue: '0x01',
        },
        {
          valueType: 'boolean', // allow to specify "boolean"
          decodedValue: false,
          encodedValue: '0x00',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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
    });

    describe('`bytes4` type', () => {
      const validTestCases = [
        {
          valueType: 'bytes4',
          decodedValue: '0x13370000',
          encodedValue: '0x13370000',
        },
        {
          valueType: 'bytes4',
          decodedValue: '0xcafecafe',
          encodedValue: '0xcafecafe',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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

      const errorEncodingTestCases = [
        {
          valueType: 'bytes4',
          input: '0x000000000001337', // more than 4 bytes
        },
        {
          valueType: 'bytes4',
          input: '0xcafecafecafecafe', // more than 4 bytes
        },
        {
          valueType: 'bytes4',
          input: 'hello there', // string input that converts to more than 4 bytes in hex
        },
        {
          valueType: 'bytes4',
          input: 2 ** (8 * 4), // max number (`uint32`), does not fit in 4 bytes (= 0x0100000000)
        },
      ];

      errorEncodingTestCases.forEach((testCase) => {
        it(`should throw when trying to encode ${testCase.input} as ${testCase.valueType}`, async () => {
          assert.throws(() =>
            encodeValueType(testCase.valueType, testCase.input),
          );
        });
      });

      // these cases are not symetric. The input is converted + encoded.
      // When decoding, we do not get the same input back, but its bytes4 hex representation
      const oneWayEncodingTestCases = [
        {
          valueType: 'bytes4',
          input: 'week', // 4 letter word (= 4 bytes),
          encodedValue: '0x7765656b', // utf8-encoded characters
          decodedValue: '0x7765656b',
        },
      ];

      oneWayEncodingTestCases.forEach((testCase) => {
        it(`encodes one way \`input\` = ${testCase.input} as ${testCase.valueType}, but does not decode back as the same input`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });

      const leftPaddedTestCases = [
        {
          valueType: 'bytes4',
          input: 1122334455,
          encodedValue: '0x42e576f7', // number converted to hex + left padded still
          decodedValue: '0x42e576f7',
        },
      ];

      // numbers encoded as `bytesN` are left padded to allow symmetric encoding / decoding
      leftPaddedTestCases.forEach((testCase) => {
        it(`encodes + left pad numbers \`input\` = ${testCase.input} as ${testCase.valueType} padded on the left with \`00\`s`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });

      // these cases are not symetric and right pad the value
      const rightPaddedTestCases = [
        {
          valueType: 'bytes4',
          input: '0xf00d',
          encodedValue: '0xf00d0000', // pad on the right with 2x 0x00 bytes
          decodedValue: '0xf00d0000',
        },
        {
          valueType: 'bytes4',
          input: 'yes', // convert to utf8 hex + pad on the right with 1x 0x00 byte
          encodedValue: '0x79657300',
          decodedValue: '0x79657300',
        },
      ];

      rightPaddedTestCases.forEach((testCase) => {
        it(`encodes + right pad \`input\` = ${testCase.input} as ${testCase.valueType} padded on the right with \`00\`s`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });
    });

    describe('`bytes32` type', () => {
      const validTestCases = [
        {
          valueType: 'bytes32',
          decodedValue:
            '0x1337000000000000000000000000000000000000000000000000000000000000',
          encodedValue:
            '0x1337000000000000000000000000000000000000000000000000000000000000',
        },
        {
          valueType: 'bytes32',
          decodedValue:
            '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
          encodedValue:
            '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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

      const errorEncodingTestCases = [
        {
          valueType: 'bytes32',
          // too many bytes (= 40 bytes)
          input:
            '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
        },
        {
          valueType: 'bytes32',
          // more than 32 characters, does not fit
          input: 'This is a very long sentence that is more than 32 bytes.',
        },
        {
          valueType: 'bytes32',
          // over the max uint256 allowed, does not fit in 32 bytes
          input: toHex(
            toBigInt(
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            ) + toBigInt(1),
          ),
        },
        {
          valueType: 'uint8',
          // overflow uint8
          input: 512,
        },
        {
          valueType: 'int8',
          // overflow int8
          input: -512,
        },
        {
          valueType: 'int9',
          // int9 is not a legit type (int8, int16 and so on)
          input: -512,
        },
      ];

      errorEncodingTestCases.forEach((testCase) => {
        it(`should throw when trying to encode ${testCase.input} as ${testCase.valueType}`, async () => {
          assert.throws(() =>
            encodeValueType(testCase.valueType, testCase.input),
          );
          assert.throws(() =>
            encodeValueType(testCase.valueType, testCase.input),
          );
        });
      });

      const oneWayEncodingTestCases = [
        {
          valueType: 'bytes32',
          input: 'This sentence is 32 bytes long !',
          decodedValue:
            '0x546869732073656e74656e6365206973203332206279746573206c6f6e672021',
          encodedValue:
            '0x546869732073656e74656e6365206973203332206279746573206c6f6e672021',
        },
      ];

      oneWayEncodingTestCases.forEach((testCase) => {
        it(`encodes one way \`input\` = ${testCase.input} as ${testCase.valueType}, but does not decode back as the same input`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });

      const leftPaddedTestCases = [
        {
          valueType: 'bytes32',
          input: 12345,
          decodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000003039',
          encodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000003039',
        },
      ];

      leftPaddedTestCases.forEach((testCase) => {
        it(`encodes + left pad number \`input\` = ${testCase.input} as ${testCase.valueType} padded on the left with \`00\`s`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });

      // these cases are not symetric and right pad the value
      const rightPaddedTestCases = [
        {
          valueType: 'bytes32',
          input: '0xcafecafe',
          decodedValue:
            '0xcafecafe00000000000000000000000000000000000000000000000000000000',
          encodedValue:
            '0xcafecafe00000000000000000000000000000000000000000000000000000000',
        },
        {
          valueType: 'bytes32',
          input: 'hello world!',
          decodedValue:
            '0x68656c6c6f20776f726c64210000000000000000000000000000000000000000',
          encodedValue:
            '0x68656c6c6f20776f726c64210000000000000000000000000000000000000000',
        },
      ];

      rightPaddedTestCases.forEach((testCase) => {
        it(`encodes + right pad \`input\` = ${testCase.input} as ${testCase.valueType} padded on the right with \`00\`s`, async () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.input,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });
    });

    describe('`uintN` type', () => {
      const validTestCases = [
        {
          valueType: 'uint256',
          decodedValue: 1337n,
          encodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000000539',
        },
        {
          valueType: 'uint8',
          decodedValue: 10n,
          encodedValue: '0x0a',
        },
        {
          valueType: 'uint16',
          decodedValue: 10n,
          encodedValue: '0x000a',
        },
        {
          valueType: 'uint24',
          decodedValue: 10n,
          encodedValue: '0x00000a',
        },
        {
          valueType: 'uint32',
          decodedValue: 10n,
          encodedValue: '0x0000000a',
        },
        {
          valueType: 'uint64',
          decodedValue: 25n,
          encodedValue: '0x0000000000000019',
        },
        {
          valueType: 'uint128',
          decodedValue: 11n,
          encodedValue: '0x0000000000000000000000000000000b',
        },
        {
          valueType: 'uint128',
          decodedValue: 0n,
          encodedValue: '0x00000000000000000000000000000000',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
          const encodedValue = encodeValueType(
            testCase.valueType,
            testCase.decodedValue,
          );

          assert.deepStrictEqual(encodedValue, testCase.encodedValue);
          assert.deepStrictEqual(
            decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
          assert.deepStrictEqual(
            ERC725.decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
          const erc725 = new ERC725([]);
          assert.deepStrictEqual(
            erc725.decodeValueType(testCase.valueType, encodedValue),
            testCase.decodedValue,
          );
        });
      });

      it('should throw an error when trying to encode/decode with an invalid `uintN` type', async () => {
        for (let ii = 1; ii <= 256; ii++) {
          // only test for uintN where N is a multiple of 8
          if (ii % 8 !== 0) {
            assert.throws(() => {
              encodeValueType(`uint${ii}`, 12345);
            });
            assert.throws(() => {
              decodeValueType(`uint${ii}`, '0x00000001');
            });

            // test that `uintN` are encoded / decode correct when N is not a multiple of 8
          } else {
            const expectedEncodedValue = `0x${'00'.repeat(ii / 8 - 1)}0a`;
            const expectedDecodedValue = 10;

            const encodedValue = encodeValueType(
              `uint${ii}`,
              expectedDecodedValue,
            );
            assert.equal(encodedValue, expectedEncodedValue);

            const decodedValue = decodeValueType(
              `uint${ii}`,
              expectedEncodedValue,
            );
            assert.equal(decodedValue, expectedDecodedValue);
          }
        }
      });
    });

    describe('`string` type', () => {
      const validTestCases = [
        {
          valueType: 'string',
          decodedValue: 'Hello I am a string',
          encodedValue: '0x48656c6c6f204920616d206120737472696e67',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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

      it('should encode each letter in a number as a utf8 character, and decode it back as a string', () => {
        const testCase = {
          valueType: 'string',
          decodedValue: 12345, // encode each letter as a utf8 hex
          encodedValue: '0x3132333435',
        };

        const encodedValue = encodeValueType(
          testCase.valueType,
          testCase.decodedValue,
        );

        assert.deepStrictEqual(encodedValue, testCase.encodedValue);
        assert.deepStrictEqual(
          decodeValueType(testCase.valueType, encodedValue),
          `${testCase.decodedValue}`,
        );
      });
    });

    describe('`address` type', () => {
      const validTestCases = [
        {
          valueType: 'address',
          // should decode as a checksummed address
          decodedValue: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          encodedValue: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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

      const errorEncodingTestCases = [
        {
          valueType: 'address',
          input: '0x388C818CA8B9251b3931', // less than 20 bytes
        },
        {
          valueType: 'address',
          input: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326818CA8B92', // more than 20 bytes
        },
      ];

      errorEncodingTestCases.forEach((testCase) => {
        it(`should throw when trying to encode ${testCase.input} as ${testCase.valueType}`, async () => {
          assert.throws(() =>
            encodeValueType(testCase.valueType, testCase.input),
          );
        });
      });
    });

    describe('`bytes` type', () => {
      const validTestCases = [
        {
          valueType: 'bytes',
          decodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000001337',
          encodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000001337',
        },
        {
          valueType: 'bytes',
          decodedValue: '0xaabbccddeeff1122334455',
          encodedValue: '0xaabbccddeeff1122334455',
        },
        {
          valueType: 'bytes',
          decodedValue: '0x1337',
          encodedValue: '0x1337',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
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
    });

    describe('arrays `[]` of static types', () => {
      const validTestCases = [
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
          decodedValue: [1, 99],
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
          valueType: 'bool[]',
          decodedValue: [true, false, true],
          encodedValue:
            '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001',
        },
        {
          valueType: 'bool[]',
          decodedValue: [false, false, true, false, false],
          encodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        },
        {
          valueType: 'boolean[]', // allow to specify "boolean"
          decodedValue: [true],
          encodedValue:
            '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
        },
        {
          valueType: 'boolean[]', // allow to specify "boolean"
          decodedValue: [false, false],
          encodedValue:
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
          let encodedValue: string;
          try {
            encodedValue = encodeValueType(
              testCase.valueType,
              testCase.decodedValue,
            );
          } catch {
            encodedValue = encodeValueType(
              testCase.valueType,
              testCase.decodedValue,
            );
          }
          try {
            assert.deepStrictEqual(encodedValue, testCase.encodedValue);
            assert.deepStrictEqual(
              decodeValueType(testCase.valueType, encodedValue),
              testCase.decodedValue,
            );
          } catch {
            decodeValueType(testCase.valueType, encodedValue);
          }
        });
      });
    });

    describe('when encoding a value that exceeds the maximal length of bytes than its type', () => {
      const validTestCases = [
        {
          valueType: 'bytes32',
          decodedValue:
            '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
          encodedValue:
            '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
        },
      ];

      validTestCases.forEach((testCase) => {
        it('should throw', async () => {
          assert.throws(() =>
            encodeValueType(testCase.valueType, testCase.decodedValue),
          );
        });
      });
    });

    describe('when encoding/decoding a value that is not a number as a `uint128`', () => {
      it('throws when trying to encode a string as `uint128`', () => {
        assert.throws(() => encodeValueType('uint128', 'helloWorld'));
      });

      it('throws when trying to encode a bytes17 as `uint128`', () => {
        assert.throws(() =>
          encodeValueType('uint128', '340282366920938463463374607431768211456'),
        );
        assert.throws(() =>
          encodeValueType('uint128', '0x0100000000000000000000000000000000'),
        );
      });

      // We do not want to throw an Exception during decode. During encode we enforce the correct sizes.
      // If there is a value size exception then we should throw.

      it('throws when trying to decode a bytes17 as `uint128`', () => {
        try {
          // NOTE: Since value sizes are now forgiving, it will ignore the 17th byte and only read up to the 16th byte.
          assert.equal(
            decodeValueType('uint128', '0x000000000000000000000000000000ffff'),
            '0xff',
          );
        } catch {
          decodeValueType('uint128', '0x000000000000000000000000000000ffff');
        }
        assert.equal(
          decodeValueType('uint128', '0x0100000000000000000000000000000000'),
          '0x01000000000000000000000000000000',
        );
      });
    });

    describe('`type[CompactBytesArray]` (of static types)', () => {
      const validTestCases = [
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
          decodedValue: [1n, 43n, 73n, 255n],
          encodedValue: '0x00010100012b0001490001ff',
        },
        {
          valueType: 'bytes4[CompactBytesArray]',
          decodedValue: [
            '0xe6520726',
            '0x272696e6',
            '0x72062616',
            '0xab7f11e3',
          ],
          encodedValue: '0x0004e65207260004272696e60004720626160004ab7f11e3',
        },
      ];

      validTestCases.forEach((testCase) => {
        it(`encodes/decodes: ${testCase.decodedValue} as ${testCase.valueType}`, () => {
          try {
            const encodedValue = encodeValueType(
              testCase.valueType,
              testCase.decodedValue,
            );

            assert.deepStrictEqual(encodedValue, testCase.encodedValue);
            assert.deepStrictEqual(
              decodeValueType(testCase.valueType, encodedValue),
              testCase.decodedValue,
            );
          } catch {
            const encodedValue = encodeValueType(
              testCase.valueType,
              testCase.decodedValue,
            );

            assert.deepStrictEqual(encodedValue, testCase.encodedValue);
            assert.deepStrictEqual(
              decodeValueType(testCase.valueType, encodedValue),
              testCase.decodedValue,
            );
          }
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

          const erc725 = new ERC725([]);
          const encodedValue2 = erc725.encodeValueType(
            testCase.valueType,
            testCase.decodedValue,
          );
          assert.deepStrictEqual(encodedValue2, testCase.encodedValue);

          const encodedValue3 = ERC725.encodeValueType(
            testCase.valueType,
            testCase.decodedValue,
          );
          assert.deepStrictEqual(encodedValue3, testCase.encodedValue);
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
              `0x${'ab'.repeat(66_0000)}`,
            ]);
          }).to.throw(
            "Couldn't encode bytes[CompactBytesArray], value at index 0 exceeds 65_535 bytes",
          );
        });
      });

      describe('when encoding uintN[CompactBytesArray]', () => {
        it('should throw if trying to encode a value that exceeds the maximal length of bytes for this type', async () => {
          expect(() => {
            encodeValueType('uint8[CompactBytesArray]', [15, 178, 266]);
          }).to.throw(/Hex size \(2\) exceeds padding size \(1\)./);
        });

        it('should throw if trying to decode a value that exceeds the maximal length of bytes for this type', async () => {
          expect(() => {
            decodeValueType(
              'uint8[CompactBytesArray]',
              '0x00010100012b00014900020100',
            );
          }).to.throw('Hex uint8 value at index 3 does not fit in 1 bytes');
        });
      });

      describe('when encoding bytesN[CompactBytesArray]', () => {
        it('should throw if trying to encode a value that exceeds the maximal length of bytes for this type', async () => {
          expect(() => {
            encodeValueType('bytes4[CompactBytesArray]', [
              '0xe6520726',
              '0x272696e6',
              '0x72062616',
              '0xab7f11e3aabbcc',
            ]);
          }).to.throw('Hex bytes4 value at index 3 does not fit in 4 bytes');
        });

        it('should throw if trying to decode a value that exceeds the maximal length of bytes for this type', async () => {
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
    });

    it('should throw when valueType is unknown', () => {
      assert.throws(() => {
        encodeValueType('????', 'hi');
      });
      assert.throws(() => {
        decodeValueType('whatIsthisType', 'hi');
      });
    });
  });

  describe('valueContent', () => {
    const testCases = [
      {
        valueContent: 'Keccak256',
        decodedValue:
          '0x7f37518252ad8c46b3eecd357685e7cd0e2ed88534c10751b1b81ac04dc40bc3',
        encodedValue:
          '0x7f37518252ad8c46b3eecd357685e7cd0e2ed88534c10751b1b81ac04dc40bc3',
      },
      {
        valueContent: 'Number',
        decodedValue: 876n,
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
        valueContent: 'Markdown',
        decodedValue: `# Lorem Ipsum
        dolor sit amet ebriscus lanfogern`,
        encodedValue:
          '0x23204c6f72656d20497073756d0a2020202020202020646f6c6f722073697420616d6574206562726973637573206c616e666f6765726e',
      },
      {
        valueContent: 'URL',
        decodedValue: 'http://test.com',
        encodedValue: '0x687474703a2f2f746573742e636f6d',
      },
      // AssetURL is deprecated since:
      // https://github.com/lukso-network/LIPs/pull/263
      // We keep it in our tests for backward compatibility testing for v0.22.0 release
      {
        valueContent: 'AssetURL',
        decodedValue: {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168',
          },
          url: 'http://test.com/asset.glb',
        },
        // Starting from v0.22.0, we force AssetURL encode to VerifiableURI as AssetURL is deprecated
        encodedValue:
          '0x00006f357c6a0020027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168687474703a2f2f746573742e636f6d2f61737365742e676c62',
      },
      {
        valueContent: 'VerifiableURI',
        decodedValue: {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168',
          },
          url: 'http://test.com/asset.glb',
        },
        encodedValue:
          '0x00006f357c6a0020027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168687474703a2f2f746573742e636f6d2f61737365742e676c62',
      },
      {
        valueContent: 'VerifiableURI', // Actual content is (bytes4,URI)
        decodedValue: {
          verification: {
            method: NONE_VERIFICATION_METHOD,
            data: '0x',
          },
          url: 'https://name.universal.page/',
        },
        encodedValue:
          '0x6f357c6a68747470733a2f2f6e616d652e756e6976657273616c2e706167652f',
        reencodedValue:
          '0x000000000000000068747470733a2f2f6e616d652e756e6976657273616c2e706167652f',
      },
      {
        valueContent: 'BitArray',
        encodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000008', // ... 0000 0000 1000
        decodedValue:
          '0x0000000000000000000000000000000000000000000000000000000000000008',
      },
      {
        valueContent: 'Boolean',
        encodedValue: '0x00',
        decodedValue: false,
      },
      {
        valueContent: 'Boolean',
        encodedValue: '0x01',
        decodedValue: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(`encodes/decodes: ${testCase.valueContent}`, () => {
        const encodedValue = encodeValueContent(
          testCase.valueContent,
          testCase.decodedValue,
        );

        assert.deepStrictEqual(
          encodedValue,
          testCase.reencodedValue || testCase.encodedValue,
        );

        const value = decodeValueContent(testCase.valueContent, encodedValue);
        assert.deepStrictEqual(value, testCase.decodedValue);
      });
      it(`encodes/decodes: ${testCase.valueContent} (instance)`, () => {
        const erc725 = new ERC725([]);
        const encodedValue = erc725.encodeValueContent(
          testCase.valueContent,
          testCase.decodedValue,
        );

        assert.deepStrictEqual(
          encodedValue,
          testCase.reencodedValue || testCase.encodedValue,
        );

        const value = erc725.decodeValueContent(
          testCase.valueContent,
          encodedValue,
        );
        assert.deepStrictEqual(value, testCase.decodedValue);
      });
      it(`encodes/decodes: ${testCase.valueContent}`, () => {
        const encodedValue = ERC725.encodeValueContent(
          testCase.valueContent,
          testCase.decodedValue,
        );

        assert.deepStrictEqual(
          encodedValue,
          testCase.reencodedValue || testCase.encodedValue,
        );

        const value = ERC725.decodeValueContent(
          testCase.valueContent,
          encodedValue,
        );
        assert.deepStrictEqual(value, testCase.decodedValue);
      });
    });

    it('encodes/decodes: JSONURL', () => {
      const dataToEncode: URLDataToEncode = {
        url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
        json: {
          myProperty: 'is a string',
          anotherProperty: {
            key: 123456,
          },
        },
      };
      const encodedValue = encodeValueContent('JSONURL', dataToEncode);

      const verificationMethod =
        SUPPORTED_VERIFICATION_METHOD_HASHES.HASH_KECCAK256_UTF8;
      const hexUrl = utf8ToHex(dataToEncode.url).substring(2);
      const jsonVerificationData = keccak256(
        JSON.stringify(dataToEncode.json),
      ).substring(2);

      // Starting from v0.22.0, we force JSONURL encode to VerifiableURI as JSONURL is deprecated
      assert.deepStrictEqual(
        encodedValue,
        `0x0000${stripHexPrefix(verificationMethod)}${stripHexPrefix(
          padLeft(jsonVerificationData.length / 2, 4),
        )}${jsonVerificationData}${hexUrl}`,
      );

      const expectedDecodedValue: URLDataWithHash = {
        verification: {
          data: `0x${jsonVerificationData}`,
          method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
        },
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

    it('should be able to use encodeDataSourceWithHash', () => {
      assert.equal(
        encodeDataSourceWithHash(
          {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          mockJson.url,
        ),
        '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
      );
      assert.equal(
        ERC725.encodeDataSourceWithHash(
          {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          mockJson.url,
        ),
        '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
      );
      const erc725 = new ERC725([]);
      assert.equal(
        erc725.encodeDataSourceWithHash(
          {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          mockJson.url,
        ),
        '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
      );
    });

    it('should be able to use decodeDataSourceWithHash', () => {
      assert.deepEqual(
        decodeDataSourceWithHash(
          '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
        ),
        {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          url: mockJson.url,
        },
      );
      assert.deepEqual(
        ERC725.decodeDataSourceWithHash(
          '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
        ),
        {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          url: mockJson.url,
        },
      );
      const erc725 = new ERC725([]);
      assert.deepEqual(
        erc725.decodeDataSourceWithHash(
          '0x00006f357c6a0020733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264',
        ),
        {
          verification: {
            method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
            data: mockJson.hash || '0x',
          },
          url: mockJson.url,
        },
      );
    });

    it('should be able to use getVerificationMethod', () => {
      assert.equal(
        getVerificationMethod('keccak256(utf8)')?.name,
        SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
      );
      assert.equal(
        ERC725.getVerificationMethod('keccak256(utf8)')?.name,
        SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
      );
      const erc725 = new ERC725([]);
      assert.equal(
        erc725.getVerificationMethod('keccak256(utf8)')?.name,
        SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
      );
    });

    it('should throw when valueContent is unknown', () => {
      assert.throws(() => {
        encodeValueContent('wrongContent', 'hi');
      });
      assert.throws(() => {
        decodeValueContent('wrongContent', 'hi');
      });
    });

    it('should return the value if the valueContent == value', () => {
      const value =
        '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168';

      assert.deepStrictEqual(encodeValueContent(value, value), value);
      assert.deepStrictEqual(decodeValueContent(value, value), value);
    });

    describe('JSONURL', () => {
      it('throws when the verification method of JSON of JSONURL to encode is not keccak256(utf8)', () => {
        assert.throws(() => {
          valueContentEncodingMap('JSONURL').encode({
            // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
            verification: {
              method: 'whatever',
              data: '0x321',
            },
            url: 'https://file-desination.com/file-name',
          });
        }, `Chosen verification method 'whatever' is not supported. Supported verification methods: keccak256(utf8),keccak256(bytes)`);
      });

      it('throws when JSONURL encode a JSON without json or verificationData key', () => {
        assert.throws(() => {
          valueContentEncodingMap('JSONURL').encode({
            // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
            verification: {
              method: 'keccak256(utf8)',
            },
            url: 'https://file-desination.com/file-name',
          });
        }, 'You have to provide either the verification.data or the json via the respective properties');
      });
    });
  });
});
