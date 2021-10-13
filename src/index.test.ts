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
/**
 * @file test/test.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

// Tests for the @erc725/erc725.js package
import assert from 'assert';
import { hexToNumber, leftPad, numberToHex } from 'web3-utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GraphProviderWrapper } from '@erc725/provider-wrappers';

import ERC725 from '.';
import {
  decodeKey,
  decodeKeyValue,
  encodeKey,
  encodeKeyValue,
  hashData,
} from './lib/utils';
import { ERC725JSONSchema } from './types/ERC725JSONSchema';
import {
  ApolloClient,
  EthereumProvider,
  HttpProvider,
} from '../test/mockProviders';
import { mockSchema } from '../test/mockSchema';
import {
  generateAllData,
  generateAllRawData,
  generateAllResults,
} from '../test/testHelpers';

// eslint-disable-next-line import/no-extraneous-dependencies
import 'isomorphic-fetch';

import { Schema } from '../test/generatedSchema';
import { SUPPORTED_HASH_FUNCTION_STRINGS } from './lib/constants';

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';

describe('Running @erc725/erc725.js tests...', () => {
  it('should throw when no arguments are supplied', () => {
    assert.throws(
      () => {
        // @ts-ignore
        // eslint-disable-next-line no-new
        new ERC725();
      },
      (error: any) => error.message === 'Missing schema.',
    );
  });

  it('should throw when incorrect or unsupported provider is provided', () => {
    assert.throws(
      () => {
        // @ts-ignore
        // eslint-disable-next-line no-new
        new ERC725(mockSchema, address, { test: false });
      },
      (error: any) =>
        error.message.indexOf('Incorrect or unsupported provider') >= -1,
    );
  });

  it('should throw when calling getData without address & provider options set', async () => {
    const erc725 = new ERC725(mockSchema);
    try {
      await erc725.getData('LSP3Profile');
    } catch (error) {
      assert.deepStrictEqual(error.message, 'Missing ERC725 contract address.');
    }

    try {
      erc725.options.address = address;
      await erc725.getData('LSP3Profile');
    } catch (error) {
      assert.deepStrictEqual(error.message, 'Missing provider.');
    }
  });

  describe('Getting all data in schema by provider', () => {
    // Construct the full data and results
    const fullResults = generateAllResults(mockSchema);
    const allRawData = generateAllRawData(mockSchema);
    const allGraphData = generateAllData(mockSchema);

    it('with web3.currentProvider', async () => {
      const provider = new HttpProvider({ returnData: allRawData });
      const erc725 = new ERC725<Schema>(mockSchema, address, provider);
      const result = await erc725.getData();
      assert.deepStrictEqual(result, fullResults);
    });

    it('with ethereumProvider EIP 1193', async () => {
      const provider = new EthereumProvider({ returnData: allRawData });
      const erc725 = new ERC725(mockSchema, address, provider);
      const result = await erc725.getData();
      assert.deepStrictEqual(result, fullResults);
    });

    xit('with apollo client', async () => {
      const provider = new ApolloClient({
        returnData: allGraphData,
        getAll: true,
      });
      const erc725 = new ERC725(mockSchema, address, {
        provider,
        type: 'ApolloClient',
      });
      const result = await erc725.getData();
      assert.deepStrictEqual(result, fullResults);
    });

    it('fetchData JSONURL', async () => {
      // this test does a real request, TODO replace with mock?

      const provider = new HttpProvider({
        returnData: [
          {
            key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a626400000000000000',
          },
        ],
      });
      const erc725 = new ERC725(
        [
          {
            name: 'TestJSONURL',
            key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            keyType: 'Singleton',
            valueContent: 'JSONURL',
            valueType: 'bytes',
          },
        ],
        address,
        provider,
      );
      const result = await erc725.fetchData('TestJSONURL');
      assert.deepStrictEqual(result.TestJSONURL, {
        LSP3Profile: {
          backgroundImage:
            'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
          description:
            "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
          profileImage: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf',
        },
      });
    });

    it('fetchData JSONURL with custom config.ipfsGateway', async () => {
      // this test does a real request, TODO replace with mock?

      const provider = new HttpProvider({
        returnData: [
          {
            key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a626400000000000000',
          },
        ],
      });
      const erc725 = new ERC725(
        [
          {
            name: 'TestJSONURL',
            key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            keyType: 'Singleton',
            valueContent: 'JSONURL',
            valueType: 'bytes',
          },
        ],
        address,
        provider,
        {
          ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
        },
      );
      const result = await erc725.fetchData('TestJSONURL');
      assert.deepStrictEqual(result.TestJSONURL, {
        LSP3Profile: {
          backgroundImage:
            'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
          description:
            "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
          profileImage: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf',
        },
      });
    });

    it('fetchData AssetURL', async () => {
      // this test does a real request, TODO replace with mock?

      const provider = new HttpProvider({
        returnData: [
          {
            key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
            value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000598019f9b1ea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f697066733a2f2f516d596f387967347a7a6d647532364e537674736f4b6555356f56523668326f686d6f61324378356939316d506600000000000000',
          },
        ],
      });
      const erc725 = new ERC725(
        [
          {
            name: 'TestAssetURL',
            key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
            keyType: 'Singleton',
            valueContent: 'AssetURL',
            valueType: 'bytes',
            // Testing data
            // @ts-ignore
            expectedResult: {
              hashFunction: 'keccak256(utf8)', // 0x8019f9b1
              hash: '0xea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f', // hash of address '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'
              url: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf', // FAKE. just used from above
            },
          },
        ],
        address,
        provider,
      );
      const result = await erc725.fetchData('TestAssetURL');
      assert.strictEqual(
        Object.prototype.toString.call(result.TestAssetURL),
        '[object Uint8Array]',
      );
    });
  });

  describe('Getting data by schema element by provider', () => {
    mockSchema.forEach((schemaElement) => {
      it(schemaElement.name + ' with web3.currentProvider', async () => {
        const returnRawData = generateAllRawData([schemaElement]);
        const provider = new HttpProvider({ returnData: returnRawData });
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(schemaElement.key);
        assert.deepStrictEqual(result, {
          [schemaElement.name]: schemaElement.expectedResult,
        });
      });

      it(schemaElement.name + ' with ethereumProvider EIP 1193', async () => {
        const returnRawData = generateAllRawData([schemaElement]);
        const provider = new HttpProvider({ returnData: returnRawData });
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(schemaElement.key);
        assert.deepStrictEqual(result, {
          [schemaElement.name]: schemaElement.expectedResult,
        });
      });

      it(schemaElement.name + ' with apollo graph provider', async () => {
        const returnData = generateAllData([schemaElement]);
        const apolloClient = new ApolloClient({ returnData });
        const providerWrapper = new GraphProviderWrapper(apolloClient);
        const erc725 = new ERC725(mockSchema, address, providerWrapper);
        const result = await erc725.getData(schemaElement.key);
        assert.deepStrictEqual(result, {
          [schemaElement.name]: schemaElement.expectedResult,
        });
      });
    });
  });

  describe('Testing utility encoding & decoding functions', () => {
    const allGraphData = generateAllData(mockSchema) as any;
    /* **************************************** */
    /* Testing encoding/decoding field by field */
    for (let index = 0; index < mockSchema.length; index++) {
      const schemaElement = mockSchema[index];

      // ARRAY type:
      if (schemaElement.keyType.toLowerCase() === 'array') {
        it('Encode data values in array: ' + schemaElement.name, async () => {
          const results: string[] = [];

          // Encode array loop
          for (let i = 0; i < schemaElement.expectedResult.length; i++) {
            if (i === 0) {
              // Push the array length into the first element of results array
              results.push(
                leftPad(numberToHex(schemaElement.expectedResult.length), 64),
              );
            }
            // Change the encoding on the schema....
            // const arraySchema = schemaElement
            const arraySchema: ERC725JSONSchema = {
              name: schemaElement.name,
              key: schemaElement.key,
              keyType: 'Singleton',
              // @ts-ignore
              valueContent: schemaElement.elementValueContent,
              // @ts-ignore
              valueType: schemaElement.elementValueType,
            };

            results.push(
              encodeKeyValue(arraySchema, schemaElement.expectedResult[i]),
            );
          } // end for loop
          assert.deepStrictEqual(results, schemaElement.returnGraphData);
        });

        it('Decode data values in array: ' + schemaElement.name, async () => {
          const results: any[] = [];

          // decode array loop
          for (let i = 0; i < schemaElement.returnGraphData.length; i++) {
            const element = schemaElement.returnGraphData[i];

            try {
              // Fail silently with anything BUT the arrayLength key
              hexToNumber(element.value);
            } catch (error) {
              const result = decodeKeyValue(schemaElement, element);

              // Handle object types
              if (
                result &&
                typeof result === 'object' &&
                Object.keys(result).length > 0
              ) {
                const objResult = {};

                for (let j = 0; index < Object.keys(result).length; j++) {
                  const key = Object.keys(result)[j];
                  const e = result[key];
                  objResult[key] = e;
                }

                results.push(objResult);
              } else {
                results.push(result);
              }
              assert.deepStrictEqual(results, schemaElement.expectedResult);
            }
          } // end for loop
        });

        it(
          'Encode all data values for keyType "Array" in:: ' +
            schemaElement.name,
          async () => {
            const data = generateAllResults([schemaElement])[
              schemaElement.name
            ];
            const intendedResults = allGraphData.filter(
              (e) => e.key.substr(0, 34) === schemaElement.key.substr(0, 34),
            );
            // handle '0x'....
            // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
            const results = encodeKey(schemaElement, data);
            assert.deepStrictEqual(results, intendedResults);
          },
        );

        it(
          'Decode all data values for keyType "Array" in: ' +
            schemaElement.name,
          async () => {
            const values = allGraphData.filter(
              (e) => e.key.substr(0, 34) === schemaElement.key.substr(0, 34),
            );
            const intendedResults = generateAllResults([schemaElement])[
              schemaElement.name
            ];
            const results = decodeKey(schemaElement, values);
            assert.deepStrictEqual(results, intendedResults);
          },
        );

        it(
          'Encode all data values for keyType "Array" in naked class instance: ' +
            schemaElement.name,
          async () => {
            const data = generateAllResults([schemaElement])[
              schemaElement.name
            ];
            const intendedResults = allGraphData.filter(
              (e) => e.key.substr(0, 34) === schemaElement.key.substr(0, 34),
            );
            const erc725 = new ERC725([schemaElement]);
            // handle '0x'....
            // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
            const results = erc725.encodeData({
              [schemaElement.name]: data,
            });
            assert.deepStrictEqual(results, {
              [schemaElement.name]: {
                key: schemaElement.key,
                value: intendedResults,
              },
            });
          },
        );

        it(
          'Decode all data values for keyType "Array" in naked class instance: ' +
            schemaElement.name,
          async () => {
            const values = allGraphData.filter(
              (e) => e.key.substr(0, 34) === schemaElement.key.substr(0, 34),
            );
            const intendedResults = generateAllResults([schemaElement])[
              schemaElement.name
            ];
            const erc725 = new ERC725([schemaElement]);
            const results = erc725.decodeData({
              [schemaElement.name]: values,
            });
            assert.deepStrictEqual(results, {
              [schemaElement.name]: intendedResults,
            });
          },
        );
      } else {
        // SINGLETON type: This is not an array, assumed 'Singleton
        it('Encode data value for: ' + schemaElement.name, async () => {
          const result = encodeKeyValue(
            schemaElement,
            schemaElement.expectedResult,
          );
          assert.deepStrictEqual(result, schemaElement.returnGraphData);
        });

        it('Decode data value for: ' + schemaElement.name, async () => {
          const result = decodeKeyValue(
            schemaElement,
            schemaElement.returnGraphData,
          );
          assert.deepStrictEqual(result, schemaElement.expectedResult);
        });

        it('Encode data value from naked class instance!', async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.encodeData({
            [schemaElement.name]: schemaElement.expectedResult,
          });
          assert.deepStrictEqual(result, {
            [schemaElement.name]: {
              key: schemaElement.key,
              value: schemaElement.returnGraphData,
            },
          });
        });

        it('Decode data value from naked class instance!', async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.decodeData({
            [schemaElement.name]: schemaElement.returnGraphData,
          });
          assert.deepStrictEqual(result, {
            [schemaElement.name]: schemaElement.expectedResult,
          });
        });
      }
    }
  });

  it('should encode/decode JSON properly', () => {
    const schema: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    const myERC725 = new ERC725<Schema>(schema);

    const json = {
      name: 'rryter',
      description: 'Web Developer located in Switzerland.',
      profileImage: [
        {
          width: 1350,
          height: 1800,
          hashFunction: 'keccak256(bytes)',
          hash: '0x229b60ea5b58e1ab8e6f1063300be110bb4fa663ba75d3814d60104ac6b74497',
          url: 'ipfs://Qmbv9j6iCDDYJ1NXHTZnNHDJ6qaaKkZsf79jhUMFAXcfDR',
        },
        {
          width: 768,
          height: 1024,
          hashFunction: 'keccak256(bytes)',
          hash: '0x320db57770084f114988c8a94bcf219ca66c69421590466a45f382cd84995c2b',
          url: 'ipfs://QmS4m2LmRpay7Jij4DCpvaW5zKZYy43ATZdRxUkUND6nG3',
        },
      ],
      backgroundImage: [
        {
          width: 1024,
          height: 768,
          hashFunction: 'keccak256(bytes)',
          hash: '0xbe2d39fe1e0b1911155afc74010db3483528a2b645dea8fcf47bdc34147769be',
          url: 'ipfs://QmQ6ujfKSc91F44KtMe6WRTSCXoSdCjomQUy8hCUxHMr28',
        },
        {
          width: 640,
          height: 480,
          hashFunction: 'keccak256(bytes)',
          hash: '0xb115f2bf09994e79726db27a7b8d5a0de41a5b81d11b59b3038fa158718266ff',
          url: 'ipfs://QmakaRZxJMMqwQFJY98J3wjbqYVDnaSZ9sEqBF9iMv3GNX',
        },
      ],
      tags: ['public profile'],
      links: [],
    };

    const encodedData = myERC725.encodeData({
      LSP3Profile: {
        json,
        url: 'ifps://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
      },
    });

    const decodedData = myERC725.decodeData({
      LSP3Profile: encodedData.LSP3Profile.value,
    });

    assert.deepStrictEqual(
      decodedData.LSP3Profile.url,
      'ifps://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
    );
    assert.deepStrictEqual(
      decodedData.LSP3Profile.hash,
      hashData(json, SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8),
    );
    assert.deepStrictEqual(
      decodedData.LSP3Profile.hashFunction,
      SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
    );
  });
});