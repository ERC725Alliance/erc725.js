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
// eslint-disable-next-line import/no-extraneous-dependencies
import Web3 from 'web3';
import { hexToNumber, leftPad, numberToHex } from 'web3-utils';

import ERC725 from '.';
import {
  decodeKey,
  decodeKeyValue,
  encodeKey,
  encodeKeyValue,
  hashData,
} from './lib/utils';
import { ERC725JSONSchema } from './types/ERC725JSONSchema';
import { EthereumProvider, HttpProvider } from '../test/mockProviders';
import { mockSchema } from '../test/mockSchema';
import {
  generateAllData,
  generateAllRawData,
  generateAllResults,
} from '../test/testHelpers';

// eslint-disable-next-line import/no-extraneous-dependencies
import 'isomorphic-fetch';

import { Schema } from '../test/generatedSchema';
import {
  INTERFACE_IDS,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from './lib/constants';

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
    } catch (error: any) {
      assert.deepStrictEqual(error.message, 'Missing ERC725 contract address.');
    }

    try {
      erc725.options.address = address;
      await erc725.getData('LSP3Profile');
    } catch (error: any) {
      assert.deepStrictEqual(error.message, 'Missing provider.');
    }
  });

  describe('isValidSignature', () => {
    it('should return true if the signature is valid [mock HttpProvider]', async () => {
      const provider = new HttpProvider({ returnData: [] }, [], true); // we mock a valid return response (magic number)
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        provider,
      );

      const res = await erc725.isValidSignature(
        'hello',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, true);
    });

    it('should return true if the signature is valid [mock EthereumProvider]', async () => {
      const provider = new EthereumProvider({ returnData: [] }, [], true); // we mock a valid return response (magic number)
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        provider,
      );

      const res = await erc725.isValidSignature(
        'hello',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, true);
    });

    it('should return false if the signature is valid [mock EthereumProvider]', async () => {
      const provider = new EthereumProvider({ returnData: [] }, [], false); // we mock a valid return response
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        provider,
      );

      const res = await erc725.isValidSignature(
        'hello',
        '0xcafecafecafecafecafe6ce85b786ef79de48a43158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, false);
    });
  });

  describe('Getting all data in schema by provider [e2e]', () => {
    const web3 = new Web3('https://rpc.l14.lukso.network');

    const LEGACY_ERC725_CONTRACT_ADDRESS =
      '0xb8E120e7e5EAe7bfA629Db5CEFfA69C834F74e99';
    const ERC725_CONTRACT_ADDRESS =
      '0x320e678bEb3369702EA14555a74414B2C531c510';

    it('should return null if the key does not exist in the contract', async () => {
      const erc725 = new ERC725(
        [
          {
            name: 'ThisKeyDoesNotExist',
            key: '0xb12a0af5f83066646eb63c96bf29dcb827024d9a33189f5a61652a03951d1fbe',
            keyType: 'Singleton',
            valueContent: 'String',
            valueType: 'string',
          },
        ],
        ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );

      const data = await erc725.getData('ThisKeyDoesNotExist');
      assert.deepStrictEqual(data, null);

      const dataArray = await erc725.getData(['ThisKeyDoesNotExist']);
      assert.deepStrictEqual(dataArray, { ThisKeyDoesNotExist: null });
    });

    it('should return [] if the key of type Array does not exist in the contract', async () => {
      const erc725 = new ERC725(
        [
          {
            name: 'NonExistingArray[]',
            key: '0xd6cbdbfc8d25c9ce4720b5fe6fa8fc536803944271617bf5425b4bd579195840',
            keyType: 'Array',
            valueContent: 'Address',
            valueType: 'address',
          },
        ],
        ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );

      const data = await erc725.getData('NonExistingArray[]');
      assert.deepStrictEqual(data, []);

      const dataArray = await erc725.getData(['NonExistingArray[]']);
      assert.deepStrictEqual(dataArray, { 'NonExistingArray[]': [] });
    });

    const e2eSchema: any = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
      {
        name: 'SupportedStandards:ERC725Account',
        key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
        keyType: 'Singleton',
        valueContent: '0xafdeb5d6',
        valueType: 'bytes',
      },
      {
        name: 'LSP1UniversalReceiverDelegate',
        key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        keyType: 'Singleton',
        valueContent: 'Address',
        valueType: 'address',
      },
    ];

    const e2eResults = {
      LSP3Profile: {
        hashFunction: 'keccak256(utf8)',
        hash: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
        url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
      },
      'SupportedStandards:ERC725Account': '0xafdeb5d6',
      LSP1UniversalReceiverDelegate:
        '0x36e4Eb6Ee168EF54B1E8e850ACBE51045214B313',
    };

    it('with web3.currentProvider [legacy]', async () => {
      const erc725 = new ERC725<Schema>(
        e2eSchema,
        LEGACY_ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );
      const result = await erc725.getData();
      assert.deepStrictEqual(result, e2eResults);
    });

    it('with web3.currentProvider', async () => {
      const erc725 = new ERC725<Schema>(
        e2eSchema,
        ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );
      const result = await erc725.getData();
      assert.deepStrictEqual(result, e2eResults);
    });
  });

  describe('Get/fetch edge cases [mock]', () => {
    it('should return null if the JSONURL is not set [fetchData]', async () => {
      const provider = new HttpProvider(
        {
          returnData: [
            {
              key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
              value:
                '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
            },
          ],
        },
        [INTERFACE_IDS.ERC725Y_LEGACY],
      );
      const erc725 = new ERC725(
        [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueContent: 'JSONURL',
            valueType: 'bytes',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        provider,
      );

      const data = await erc725.fetchData('LSP3Profile');
      assert.deepStrictEqual(data, null);
    });
  });

  [
    { name: 'legacy', interface: INTERFACE_IDS.ERC725Y_LEGACY },
    { name: 'latest', interface: INTERFACE_IDS.ERC725Y },
  ].forEach((contractVersion) => {
    describe(`Getting all data in schema by provider [ERC725Y ${contractVersion.name}][mock]`, () => {
      // Construct the full data and results
      const fullResults = generateAllResults(mockSchema);
      const allRawData = generateAllRawData(
        mockSchema,
        contractVersion.interface === INTERFACE_IDS.ERC725Y,
      );

      it('with web3.currentProvider', async () => {
        const provider = new HttpProvider({ returnData: allRawData }, [
          contractVersion.interface,
        ]);
        const erc725 = new ERC725<Schema>(mockSchema, address, provider);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      it('with ethereumProvider EIP 1193', async () => {
        const provider = new EthereumProvider({ returnData: allRawData }, [
          contractVersion.interface,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      it('fetchData JSONURL', async () => {
        // this test does a real request, TODO replace with mock?
        const provider = new HttpProvider(
          {
            returnData: allRawData.filter(
              (rawData) =>
                rawData.key ===
                '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            ),
          },
          [contractVersion.interface],
        );
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
        assert.deepStrictEqual(result, {
          LSP3Profile: {
            backgroundImage:
              'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
            description:
              "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
            profileImage:
              'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf',
          },
        });
      });

      it('fetchData JSONURL with custom config.ipfsGateway', async () => {
        // this test does a real request, TODO replace with mock?

        const provider = new HttpProvider(
          {
            returnData: allRawData.filter(
              (rawData) =>
                rawData.key ===
                '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
            ),
          },
          [contractVersion.interface],
        );
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
            ipfsGateway: 'https://2eff.lukso.dev/ipfs/',
          },
        );
        const result = await erc725.fetchData('TestJSONURL');
        assert.deepStrictEqual(result, {
          LSP3Profile: {
            backgroundImage:
              'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
            description:
              "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
            profileImage:
              'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf',
          },
        });
      });

      if (contractVersion.interface === INTERFACE_IDS.ERC725Y_LEGACY) {
        // We run this broken test only on legacy for now until it is fixed
        it('fetchData AssetURL', async () => {
          // this test does a real request, TODO replace with mock?

          const provider = new HttpProvider(
            {
              returnData: [
                {
                  key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
                  value:
                    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000598019f9b1ea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f697066733a2f2f516d596f387967347a7a6d647532364e537674736f4b6555356f56523668326f686d6f61324378356939316d506600000000000000',
                },

                // Encoded value of:
                // {
                //   hashFunction: 'keccak256(bytes)', // 0x8019f9b1
                //   hash: '0xea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f',
                //   url: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf',
                // },
              ],
            },
            [contractVersion.interface],
          );
          const erc725 = new ERC725(
            [
              {
                name: 'TestAssetURL',
                key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
                keyType: 'Singleton',
                valueContent: 'AssetURL',
                valueType: 'bytes',
              },
            ],
            address,
            provider,
          );
          const result = await erc725.fetchData('TestAssetURL');

          assert.strictEqual(
            Object.prototype.toString.call(result),
            '[object Uint8Array]',
          );
        });
      }
    });
  });

  describe('Getting data by schema element by provider', () => {
    mockSchema.forEach((schemaElement) => {
      it(schemaElement.name + ' with web3.currentProvider', async () => {
        const returnRawData = generateAllRawData([schemaElement], false);
        const provider = new HttpProvider({ returnData: returnRawData }, [
          INTERFACE_IDS.ERC725Y_LEGACY,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(schemaElement.key);
        assert.deepStrictEqual(result, schemaElement.expectedResult);
      });

      it(schemaElement.name + ' with ethereumProvider EIP 1193', async () => {
        const returnRawData = generateAllRawData([schemaElement], false);
        const provider = new HttpProvider({ returnData: returnRawData }, [
          INTERFACE_IDS.ERC725Y_LEGACY,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(schemaElement.key);
        assert.deepStrictEqual(result, schemaElement.expectedResult);
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

            results.push(
              encodeKeyValue(
                schemaElement.valueContent,
                schemaElement.valueType,
                schemaElement.expectedResult[i],
                schemaElement.name,
              ),
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
              const result = decodeKeyValue(
                schemaElement.valueContent,
                schemaElement.valueType,
                element,
                schemaElement.name,
              );

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

            const keyValuePairs = allGraphData.filter(
              (e) => e.key.substr(0, 34) === schemaElement.key.substr(0, 34),
            );

            const intendedResult: { keys: string[]; values: string[] } = {
              keys: [],
              values: [],
            };

            keyValuePairs.forEach((keyValuePair) => {
              intendedResult.keys.push(keyValuePair.key);
              intendedResult.values.push(keyValuePair.value);
            });

            const erc725 = new ERC725([schemaElement]);

            const results = erc725.encodeData({
              [schemaElement.name]: data,
            });
            assert.deepStrictEqual(results, intendedResult);
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
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.expectedResult,
            schemaElement.name,
          );
          assert.deepStrictEqual(result, schemaElement.returnGraphData);
        });

        it('Decode data value for: ' + schemaElement.name, async () => {
          const result = decodeKeyValue(
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.returnGraphData,
            schemaElement.name,
          );
          assert.deepStrictEqual(result, schemaElement.expectedResult);
        });

        it('Encode data value from naked class instance!', async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.encodeData({
            [schemaElement.name]: schemaElement.expectedResult,
          });
          assert.deepStrictEqual(result, {
            keys: [schemaElement.key],
            values: [schemaElement.returnGraphData],
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
      LSP3Profile: encodedData.values[0],
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

  describe('permissions', () => {
    const testCases: { hex: string; permissions }[] = [
      {
        permissions: {
          CHANGEOWNER: true,
          CHANGEPERMISSIONS: true,
          ADDPERMISSIONS: true,
          SETDATA: true,
          CALL: true,
          STATICCALL: true,
          DELEGATECALL: true,
          DEPLOY: true,
          TRANSFERVALUE: true,
          SIGN: true,
        },
        hex: '0x00000000000000000000000000000000000000000000000000000000000003ff',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          CHANGEPERMISSIONS: false,
          ADDPERMISSIONS: false,
          SETDATA: false,
          CALL: false,
          STATICCALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          TRANSFERVALUE: false,
          SIGN: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          CHANGEPERMISSIONS: false,
          ADDPERMISSIONS: false,
          SETDATA: false,
          CALL: true,
          STATICCALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          TRANSFERVALUE: true,
          SIGN: true,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000310',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          CHANGEPERMISSIONS: false,
          ADDPERMISSIONS: false,
          SETDATA: true,
          CALL: true,
          STATICCALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          TRANSFERVALUE: false,
          SIGN: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000018',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          CHANGEPERMISSIONS: true,
          ADDPERMISSIONS: false,
          SETDATA: true,
          CALL: false,
          STATICCALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          TRANSFERVALUE: false,
          SIGN: false,
        },
        hex: '0x000000000000000000000000000000000000000000000000000000000000000a',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          CHANGEPERMISSIONS: false,
          ADDPERMISSIONS: false,
          SETDATA: false,
          CALL: true,
          STATICCALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          TRANSFERVALUE: true,
          SIGN: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000110',
      },
    ];

    const erc725Instance = new ERC725([]);

    describe(`encodePermissions`, () => {
      testCases.forEach((testCase) => {
        it(`Encodes ${testCase.hex} permission correctly`, () => {
          assert.deepStrictEqual(
            ERC725.encodePermissions(testCase.permissions),
            testCase.hex,
          );
          assert.deepStrictEqual(
            erc725Instance.encodePermissions(testCase.permissions),
            testCase.hex,
          );
        });
      });

      it('Defaults permissions to false if not passed', () => {
        assert.deepStrictEqual(
          ERC725.encodePermissions({
            CHANGEPERMISSIONS: true,
            SETDATA: true,
          }),
          '0x000000000000000000000000000000000000000000000000000000000000000a',
        );
        assert.deepStrictEqual(
          erc725Instance.encodePermissions({
            CHANGEPERMISSIONS: true,
            SETDATA: true,
          }),
          '0x000000000000000000000000000000000000000000000000000000000000000a',
        );
      });
    });

    describe('decodePermissions', () => {
      testCases.forEach((testCase) => {
        it(`Decodes ${testCase.hex} permission correctly`, () => {
          assert.deepStrictEqual(
            ERC725.decodePermissions(testCase.hex),
            testCase.permissions,
          );
          assert.deepStrictEqual(
            erc725Instance.decodePermissions(testCase.hex),
            testCase.permissions,
          );
        });
      });
      it(`Decodes 0xfff...fff admin permission correctly`, () => {
        assert.deepStrictEqual(
          ERC725.decodePermissions(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ),
          {
            CHANGEOWNER: true,
            CHANGEPERMISSIONS: true,
            ADDPERMISSIONS: true,
            SETDATA: true,
            CALL: true,
            STATICCALL: true,
            DELEGATECALL: true,
            DEPLOY: true,
            TRANSFERVALUE: true,
            SIGN: true,
          },
        );
        assert.deepStrictEqual(
          erc725Instance.decodePermissions(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ),
          {
            CHANGEOWNER: true,
            CHANGEPERMISSIONS: true,
            ADDPERMISSIONS: true,
            SETDATA: true,
            CALL: true,
            STATICCALL: true,
            DELEGATECALL: true,
            DEPLOY: true,
            TRANSFERVALUE: true,
            SIGN: true,
          },
        );
      });
    });
  });
});

describe('getSchema', () => {
  it('should find key in schema used for instantiation', async () => {
    const schema: ERC725JSONSchema = {
      name: 'InstantiationSchema',
      key: '0xdbc90d23b2e4ff291c111a658864f9723a77b8c1f22b707e51a686413948206d',
      keyType: 'Singleton',
      valueContent: 'JSONURL',
      valueType: 'bytes',
    };

    const erc725 = new ERC725([schema]);

    const foundSchema = erc725.getSchema(schema.key);

    assert.deepStrictEqual(foundSchema, schema);
  });
  it('should find key in schema provided as parameter', async () => {
    const schema: ERC725JSONSchema = {
      name: 'ParameterSchema',
      key: '0x777f55baf2e0c9f73d3bb456dfb8dbf6e609bf557969e3184c17ff925b3c402c',
      keyType: 'Singleton',
      valueContent: 'JSONURL',
      valueType: 'bytes',
    };

    const erc725 = new ERC725([]);

    const foundSchema = erc725.getSchema(schema.key, [schema]);

    assert.deepStrictEqual(foundSchema, schema);
  });
});

describe('encodeKeyName', () => {
  const erc725Instance = new ERC725([]);

  describe('Singleton', () => {
    it('Encodes MyKeyName correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('MyKeyName'),
        '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('MyKeyName'),
        '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
      );
    });
    it('Encodes LSP3Profile correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('LSP3Profile'),
        '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('LSP3Profile'),
        '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      );
    });
  });
  describe('Array', () => {
    it('Encodes LSP3IssuedAssets[] correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('LSP3IssuedAssets[]'),
        '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('LSP3IssuedAssets[]'),
        '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
      );
    });
    it('Encodes LSP5ReceivedAssets[] correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('LSP5ReceivedAssets[]'),
        '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('LSP5ReceivedAssets[]'),
        '0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b',
      );
    });
  });
  describe('Mapping', () => {
    it('Encodes SupportedStandards:ERC725Account correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('SupportedStandards:ERC725Account'),
        '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('SupportedStandards:ERC725Account'),
        '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
      );
    });
    it('Encodes SupportedStandards:LSP3UniversalProfile correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName('SupportedStandards:LSP3UniversalProfile'),
        '0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName('SupportedStandards:LSP3UniversalProfile'),
        '0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6',
      );
    });
  });
  describe('Bytes20Mapping', () => {
    it('Encodes MyCoolAddress:cafecafecafecafecafecafecafecafecafecafe correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName(
          'MyCoolAddress:cafecafecafecafecafecafecafecafecafecafe',
        ),
        '0x22496f48a493035f00000000cafecafecafecafecafecafecafecafecafecafe',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName(
          'MyCoolAddress:cafecafecafecafecafecafecafecafecafecafe',
        ),
        '0x22496f48a493035f00000000cafecafecafecafecafecafecafecafecafecafe',
      );
    });
    it('Encodes LSP3IssuedAssetsMap:b74a88C43BCf691bd7A851f6603cb1868f6fc147 correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName(
          'LSP3IssuedAssetsMap:b74a88C43BCf691bd7A851f6603cb1868f6fc147',
        ),
        '0x83f5e77bfb14241600000000b74a88C43BCf691bd7A851f6603cb1868f6fc147',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName(
          'LSP3IssuedAssetsMap:b74a88C43BCf691bd7A851f6603cb1868f6fc147',
        ),
        '0x83f5e77bfb14241600000000b74a88C43BCf691bd7A851f6603cb1868f6fc147',
      );
    });
  });
  describe('Bytes20MappingWithGrouping', () => {
    it('Encodes AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName(
          'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
        ),
        '0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName(
          'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
        ),
        '0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe',
      );
    });
    it('Encodes AddressPermissions:AllowedAddresses:b74a88C43BCf691bd7A851f6603cb1868f6fc147 correctly', () => {
      assert.deepStrictEqual(
        ERC725.encodeKeyName(
          'AddressPermissions:AllowedAddresses:b74a88C43BCf691bd7A851f6603cb1868f6fc147',
        ),
        '0x4b80742d00000000c6dd0000b74a88C43BCf691bd7A851f6603cb1868f6fc147',
      );
      assert.deepStrictEqual(
        erc725Instance.encodeKeyName(
          'AddressPermissions:AllowedAddresses:b74a88C43BCf691bd7A851f6603cb1868f6fc147',
        ),
        '0x4b80742d00000000c6dd0000b74a88C43BCf691bd7A851f6603cb1868f6fc147',
      );
    });
  });
});
