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
import { assert } from 'chai';

import Web3, { type EthExecutionAPI, type Web3BaseProvider } from 'web3';
import { leftPad, numberToHex, toNumber } from 'web3-utils';

// examples of schemas to load (for testing)
import { LSP1Schema, LSP12Schema, LSP3Schema, LSP6Schema } from './schemas';

import ERC725, {
  checkPermissions,
  decodeMappingKey,
  decodePermissions,
  encodeKeyName,
  encodePermissions,
  getSchema,
  mapPermission,
  supportsInterface,
} from '.';
import {
  decodeKeyValue,
  encodeData,
  encodeKey,
  encodeKeyValue,
  hashData,
} from './lib/utils';
import type { ERC725JSONSchema } from './types/ERC725JSONSchema';
import { mockJson, mockSchema } from '../test/mockSchema';
import { generateAllData, generateAllResults } from '../test/testHelpers';

import {
  ERC725Y_INTERFACE_IDS,
  LSP6_DEFAULT_PERMISSIONS,
  SUPPORTED_VERIFICATION_METHOD_STRINGS,
} from './constants/constants';
import { decodeKey } from './lib/decodeData';
import { INTERFACE_IDS_0_12_0 } from './constants/interfaces';
import { IPFS_GATEWAY, resetMocks, responseStore } from '../test/serverHelpers';
import { after } from 'mocha';
import { getDefaultProvider } from 'ethers';
import { createPublicClient, Hex, http, slice } from 'viem';
import { luksoTestnet } from 'viem/chains';

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';

// Create legacy provider wrapper for testing.
class LegacyProviderWrapper {
  constructor(private provider: Web3BaseProvider<EthExecutionAPI>) {}

  send(payload, callback) {
    // Convert modern Promise-based provider to callback style
    Promise.resolve()
      .then(() => this.provider.request(payload))
      .then((result) => callback(null, result))
      .catch((error) => callback(error, null));
  }
}

describe('Running @erc725/erc725.js tests...', () => {
  const web3 = new Web3('https://rpc.testnet.lukso.network');
  after(() => {
    resetMocks();
  });
  it('should throw when no arguments are supplied', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725();
    }, 'Missing schema.');
  });

  it('should throw when incorrect or unsupported provider is provided', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725(mockSchema, address, { test: false });
    }, /Incorrect or unsupported provider/);
  });

  it('should throw warn with invalid schema', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725(
        [
          {
            key: 'bogus',
          } as any,
          ...mockSchema,
        ],
        address,
        web3.currentProvider,
      );
    }, /Input schema object is missing/);
  });

  it('should throw warn with invalid schema', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725(
        [
          {
            name: 'AddressPermissions:Permissions:<blah>',
            key: '0x4b80742de2bf82acb3630000<blah>',
            keyType: 'MappingWithGrouping',
            valueType: 'bytes32',
            valueContent: 'BitArray',
          },
          ...mockSchema,
        ],
        address,
        web3.currentProvider,
        { throwSchemaErrors: true, gas: 20000 },
      );
    }, 'The schema with keyName: AddressPermissions:Permissions:<blah> is skipped because invalid dynamic key type: blah in name');
  });

  it('should throw warn with invalid schema', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725(
        [
          {
            name: 'SupportedStandards:LSP3Profile',
            dynamicName: 'SupportedStandards:LSP3Profile',
            key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdc6666347',
            keyType: 'Mapping',
            valueContent: '0x5ef83ad9',
            valueType: 'bytes',
          },
          ...mockSchema,
        ],
        address,
        web3.currentProvider,
        { throwSchemaErrors: true, gas: 100000 },
      );
    }, 'The schema with keyName: SupportedStandards:LSP3Profile is skipped because key hash 0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347 != 0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdc6666347');
  });

  it('should throw warn with invalid schema', () => {
    assert.throws(() => {
      // @ts-ignore
      // eslint-disable-next-line no-new
      new ERC725(
        [
          {
            name: 'AddressPermissions:Permissions:<address>',
            key: '0x4b80742de2bf82acb3630000<bytes32>',
            keyType: 'MappingWithGrouping',
            valueType: 'bytes32',
            valueContent: 'BitArray',
          },
          ...mockSchema,
        ],
        address,
        web3.currentProvider,
        { throwSchemaErrors: true, gas: 10000 },
      );
    }, 'The schema with keyName: AddressPermissions:Permissions:<address> is skipped because dynamic address != bytes32 in key');
  });

  it('should skit invalid schema', () => {
    // @ts-ignore
    // eslint-disable-next-line no-new
    const { options } = new ERC725(
      [
        {
          name: 'AddressPermissions:Permissions:<blah>',
          key: '0x4b80742de2bf82acb3630000<blah>',
          keyType: 'MappingWithGrouping',
          valueType: 'bytes32',
          valueContent: 'BitArray',
        },
        ...mockSchema,
      ],
      address,
      web3.currentProvider,
    );
    const item = options.schemas.find((schema) => {
      return schema.name === 'AddressPermissions:Permissions:<blah>';
    });
    assert.strictEqual(item, undefined);
  });

  it('should allow importing the schemas and instantiating with them', async () => {
    const schemasToLoad = [
      ...LSP1Schema,
      ...LSP12Schema,
      ...LSP3Schema,
      ...LSP6Schema,
    ];
    const erc725 = new ERC725(schemasToLoad);

    assert.deepStrictEqual(erc725.options.schemas, schemasToLoad);
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
    it('should error on invalid signature', async () => {
      const rpcUrl = 'https://rpc.testnet.lukso.network';
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        rpcUrl,
      );
      responseStore.isValidSignature = true;
      try {
        await erc725.isValidSignature(
          'hello',
          '0x6c54ad4814ed6de85b9786e79de48ad0d5194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
        );
        assert.fail('Expected error to thrown');
      } catch (error) {
        assert.deepStrictEqual(
          (error as { message: string }).message,
          'Signature length should be 132 (65bytes)',
        );
      }
    });

    it('should error on no address', async () => {
      const rpcUrl = 'https://rpc.testnet.lukso.network';
      const erc725 = new ERC725(
        [],
        '', // result is mocked so we can use any address
        rpcUrl,
      );
      responseStore.isValidSignature = true;
      try {
        await erc725.isValidSignature(
          'hello',
          '0x6c54ad4814ed6de85b9786e79de48ad0d5194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
        );
        assert.fail('Expected error to thrown');
      } catch (error) {
        assert.deepStrictEqual(
          (error as { message: string }).message,
          'Missing ERC725 contract address.',
        );
      }
    });

    it('should error on no provider', async () => {
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
      );
      responseStore.isValidSignature = true;
      try {
        await erc725.isValidSignature(
          'hello',
          '0x6c54ad4814ed6de85b9786e79de48ad0d5194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
        );
        assert.fail('Expected error to thrown');
      } catch (error) {
        assert.deepStrictEqual(
          (error as { message: string }).message,
          'Missing provider.',
        );
      }
    });

    it('should return true if the signature is valid [using rpcUrl]', async () => {
      const rpcUrl = 'https://rpc.testnet.lukso.network';
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        rpcUrl,
      );
      responseStore.isValidSignature = true;
      const res = await erc725.isValidSignature(
        'hello',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );
      assert.deepStrictEqual(res, true);
    });

    it('should return true if the signature is valid [HttpProvider]', async () => {
      const provider = new web3.providers.HttpProvider(
        'https://rpc.testnet.lukso.network',
      ); // we mock a valid return response (magic number)
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

    it('should return true if the signature is valid [EthereumProvider (ethers)]', async () => {
      const provider = getDefaultProvider('https://rpc.testnet.lukso.network'); // we mock a valid return response (magic number)
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

    it('should return true if the signature is valid [EthereumProvider (legacy)]', async () => {
      const provider = new LegacyProviderWrapper(
        new web3.providers.HttpProvider('https://rpc.testnet.lukso.network'),
      );
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

    it('should return true if teh signature is valid [mock viem client]', async () => {
      const client = createPublicClient({
        chain: luksoTestnet,
        transport: http('https://rpc.testnet.lukso.network'),
      });
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        client,
      );

      responseStore.isValidSignature = true;

      const res = await erc725.isValidSignature(
        'hello',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, true);
    });

    it('should return false if the signature is invalid [using rpcUrl]', async () => {
      const contractAddress = '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42';
      const rpcUrl = 'https://rpc.testnet.lukso.network';
      const erc725 = new ERC725(
        [],
        contractAddress, // result is mocked so we can use any address
        rpcUrl,
      );
      responseStore.isValidSignature = false;

      const result = await erc725.isValidSignature(
        'wrong message',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );
      // should not reach this line
      assert.deepStrictEqual(result, false);
    });

    it('should return false if the signature is valid [EthereumProvider (ethers)]', async () => {
      const provider = getDefaultProvider('https://rpc.testnet.lukso.network'); // we mock a valid return response
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        provider,
      );
      responseStore.isValidSignature = false;

      const res = await erc725.isValidSignature(
        'hello',
        '0xcafecafecafecafecafe6ce85b786ef79de48a43158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, false);
    });

    it('should return false if the signature is valid [EthereumProvider (legacy)]', async () => {
      const provider = new LegacyProviderWrapper(
        new web3.providers.HttpProvider('https://rpc.testnet.lukso.network'),
      );
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        provider,
      );
      responseStore.isValidSignature = false;

      const res = await erc725.isValidSignature(
        'hello',
        '0xcafecafecafecafecafe6ce85b786ef79de48a43158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, false);
    });

    it('should return false if the signature is valid [mock viem]', async () => {
      const client = createPublicClient({
        chain: luksoTestnet,
        transport: http('https://rpc.testnet.lukso.network'),
      });
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        client,
      );
      responseStore.isValidSignature = false;

      const res = await erc725.isValidSignature(
        'hello',
        '0xcafecafecafecafecafe6ce85b786ef79de48a43158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );

      assert.deepStrictEqual(res, false);
    });
  });

  describe('Getting all data in schema by provider [e2e]', () => {
    const web3 = new Web3('https://rpc.testnet.lukso.network');

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

      const expectedResult = {
        name: 'ThisKeyDoesNotExist',
        key: '0xb12a0af5f83066646eb63c96bf29dcb827024d9a33189f5a61652a03951d1fbe',
        value: null,
        dynamicName: 'ThisKeyDoesNotExist',
      };

      assert.deepStrictEqual(data, expectedResult);

      const dataArray = await erc725.getData(['ThisKeyDoesNotExist']);
      assert.deepStrictEqual(dataArray, [expectedResult]);
    });

    it('should return [] if the key of type Array does not exist in the contract', async () => {
      after(() => {
        resetMocks();
      });

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
      assert.deepStrictEqual(data, {
        name: 'NonExistingArray[]',
        key: '0xd6cbdbfc8d25c9ce4720b5fe6fa8fc536803944271617bf5425b4bd579195840',
        value: [],
        dynamicName: 'NonExistingArray[]',
      });

      const dataArray = await erc725.getData(['NonExistingArray[]']);
      assert.deepStrictEqual(dataArray, [
        {
          name: 'NonExistingArray[]',
          key: '0xd6cbdbfc8d25c9ce4720b5fe6fa8fc536803944271617bf5425b4bd579195840',
          value: [],
          dynamicName: 'NonExistingArray[]',
        },
      ]);
    });

    const e2eSchema: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
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

    const e2eResults = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        dynamicName: 'LSP3Profile',
        value: {
          verification: {
            method: 'keccak256(utf8)',
            data: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
          },
          url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
        },
      },
      {
        name: 'LSP1UniversalReceiverDelegate',
        key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        value: '0x36e4Eb6Ee168EF54B1E8e850ACBE51045214B313',
        dynamicName: 'LSP1UniversalReceiverDelegate',
      },
    ];
    const e2eResponses: Map<`0x${string}`, `0x${string}`> = new Map<
      `0x${string}`,
      `0x${string}`
    >(
      e2eResults.map<[`0x${string}`, `0x${string}`]>((item) => [
        item.key as `0x${string}`,
        encodeData({ keyName: item.name, value: item.value }, e2eSchema)
          .values[0] as `0x${string}`,
      ]),
    );

    it('with web3.currentProvider [legacy]', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        const result = e2eResponses.get(key);
        if (result) {
          return result;
        }
        return;
      };
      const erc725 = new ERC725(
        e2eSchema,
        LEGACY_ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );
      const result = await erc725.getData();
      assert.deepStrictEqual(result, e2eResults);
    });

    it('with web3.currentProvider', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        const result = e2eResponses.get(key);
        if (result) {
          return result;
        }
        return;
      };

      const erc725 = new ERC725(
        e2eSchema,
        ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );
      const result = await erc725.getData();
      assert.deepStrictEqual(result, e2eResults);
    });
  });

  describe('Getting data (using new getDataBatch) in schema', () => {
    const ERC725_V5_CONTRACT_ADDRESS =
      '0x4b30900F119E11D2A8CAe18176c4f9840E586Cc4';
    const web3 = new Web3('https://rpc.testnet.lukso.network');
    after(() => {
      resetMocks();
    });
    describe('By HttpProvider', () => {
      responseStore.supportsInterfaces = [
        ERC725Y_INTERFACE_IDS['5.0'] as `0x${string}`,
      ];
      responseStore.rpc.getData = (key: `0x${string}`) => {
        if (
          key ===
          '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47'
        ) {
          return '0x36e4eb6ee168ef54b1e8e850acbe51045214b313';
        }
        return;
      };
      it('with http provider [ERC725Y_BATCH]', async () => {
        const erc725 = new ERC725(
          [
            {
              name: 'LSP1UniversalReceiverDelegate',
              key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
              keyType: 'Singleton',
              valueContent: 'Address',
              valueType: 'address',
            },
          ],
          '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
          web3.currentProvider,
        );

        const [result] = await erc725.getData();
        assert.deepStrictEqual(result, {
          name: 'LSP1UniversalReceiverDelegate',
          key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
          value: '0x36e4Eb6Ee168EF54B1E8e850ACBE51045214B313',
          dynamicName: 'LSP1UniversalReceiverDelegate',
        });
      });
    });

    describe('By HttpProvider to retrieve single dynamic key with getDataBatch', () => {
      responseStore.supportsInterfaces = [
        ERC725Y_INTERFACE_IDS['5.0'] as `0x${string}`,
      ];

      it('should return data even with a single BitArray key', async () => {
        responseStore.rpc.getData = (key: `0x${string}`) => {
          if (
            key ===
            '0x4b80742de2bf82acb36300009139def55c73c12bcda9c44f12326686e3948634'
          ) {
            return '0x0000000000000000000000000000000000000000000000000000000000000002';
          }
          return;
        };

        const erc725 = new ERC725(
          [
            {
              name: 'AddressPermissions:Permissions:<address>',
              key: '0x4b80742de2bf82acb3630000<address>',
              keyType: 'MappingWithGrouping',
              valueType: 'bytes32',
              valueContent: 'BitArray',
            },
          ],
          '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620',
          web3.currentProvider,
        );

        const data = await erc725.getData([
          {
            keyName: 'AddressPermissions:Permissions:<address>',
            dynamicKeyParts: '0x9139def55c73c12bcda9c44f12326686e3948634',
          },
        ]);
        assert.deepStrictEqual(data[0], {
          key: '0x4b80742de2bf82acb36300009139def55c73c12bcda9c44f12326686e3948634',
          name: 'AddressPermissions:Permissions:<address>',
          dynamicName:
            'AddressPermissions:Permissions:0x9139def55c73c12bcda9c44f12326686e3948634',
          value:
            '0x0000000000000000000000000000000000000000000000000000000000000002',
        });
      });
    });

    describe('By HttpProvider to retrieve single dynamic key with getDataBatch', () => {
      responseStore.supportsInterfaces = [
        ERC725Y_INTERFACE_IDS['5.0'] as `0x${string}`,
      ];
      it('should return data even with a single BitArray key', async () => {
        responseStore.rpc.getData = (key: `0x${string}`) => {
          if (
            key ===
            '0x6de85eaf5d982b4e5da000009139def55c73c12bcda9c44f12326686e3948634'
          ) {
            return '0x24871b3d00000000000000000000000000000000';
          }
          return;
        };

        const erc725 = new ERC725(
          [
            {
              name: 'LSP4CreatorsMap:<address>',
              key: '0x6de85eaf5d982b4e5da00000<address>',
              keyType: 'Mapping',
              valueType: '(bytes4,uint128)',
              valueContent: '(Bytes4,Number)',
            },
          ],
          '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620',
          web3.currentProvider,
        );

        const data = await erc725.getData([
          {
            keyName: 'LSP4CreatorsMap:<address>',
            dynamicKeyParts: '0x9139def55c73c12bcda9c44f12326686e3948634',
          },
        ]);
        assert.deepStrictEqual(data[0], {
          key: '0x6de85eaf5d982b4e5da000009139def55c73c12bcda9c44f12326686e3948634',
          name: 'LSP4CreatorsMap:<address>',
          dynamicName:
            'LSP4CreatorsMap:0x9139def55c73c12bcda9c44f12326686e3948634',
          value: ['0x24871b3d', 0n],
        });
      });
    });

    describe('By provider [e2e] - luksoTestnet', () => {
      const e2eSchema: ERC725JSONSchema[] = [
        {
          name: 'LSP3Profile',
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          keyType: 'Singleton',
          valueContent: 'JSONURL',
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

      const e2eResults = [
        {
          name: 'LSP3Profile',
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          dynamicName: 'LSP3Profile',
          value: {
            verification: {
              method: 'keccak256(utf8)',
              data: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
            },
            url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
          },
        },
        {
          name: 'LSP1UniversalReceiverDelegate',
          key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
          value: '0x36e4Eb6Ee168EF54B1E8e850ACBE51045214B313',
          dynamicName: 'LSP1UniversalReceiverDelegate',
        },
      ];

      it('with web3.currentProvider [ERC725Y_BATCH]', async () => {
        after(() => {
          resetMocks();
        });
        responseStore.rpc.getData = (key: `0x${string}`) => {
          const result = e2eResults.find((item) => item.key === key);
          if (result) {
            const { name, value } = result;
            const encodedResult = encodeData(
              [{ keyName: name, value }],
              e2eSchema,
            );
            return encodedResult.values[0] as `0x${string}`;
          }
          return;
        };

        const erc725 = new ERC725(
          e2eSchema,
          ERC725_V5_CONTRACT_ADDRESS,
          web3.currentProvider,
        );

        const result = await erc725.getData();
        assert.deepStrictEqual(result, e2eResults);
      });
    });
  });

  describe('Get/fetch edge cases [mock]', () => {
    const web3 = new Web3('https://rpc.testnet.lukso.network');
    after(() => {
      resetMocks();
    });
    it('should return null if the JSONURL is not set [fetchData]', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        if (
          key ===
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
        ) {
          return '0x';
        }
        return;
      };
      const erc725 = new ERC725(
        [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueContent: 'URL',
            valueType: 'bytes',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        web3.currentProvider,
      );

      const data = await erc725.fetchData('LSP3Profile');
      assert.deepStrictEqual(data, {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: null,
        dynamicName: 'LSP3Profile',
      });
    });

    it('should return null if the JSONURL is not set [fetchData (array input)]', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        if (
          key ===
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
        ) {
          return '0x';
        }
        return;
      };
      const erc725 = new ERC725(
        [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueContent: 'URL',
            valueType: 'bytes',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        web3.currentProvider,
      );

      const data = await erc725.fetchData(['LSP3Profile']);
      assert.deepStrictEqual(data[0], {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: null,
        dynamicName: 'LSP3Profile',
      });
    });

    it('should return null if the JSONURL is not set [fetchData] with ipfsGateway config', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        if (
          key ===
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
        ) {
          return '0x';
        }
        return;
      };
      const erc725 = new ERC725(
        [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueContent: 'URL',
            valueType: 'bytes',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        web3.currentProvider,
        { ipfsGateway: 'https://api.universalprofile.cloud/ipfs/' },
      );

      const data = await erc725.fetchData('LSP3Profile');
      assert.deepStrictEqual(data, {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: null,
        dynamicName: 'LSP3Profile',
      });
    });

    it('should return null if the JSONURL is not set [fetchData] with ipfsFetch config', async () => {
      responseStore.rpc.getData = (key: `0x${string}`) => {
        if (
          key ===
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
        ) {
          return '0x';
        }
        return;
      };
      const erc725 = new ERC725(
        [
          {
            name: 'LSP3Profile',
            key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
            keyType: 'Singleton',
            valueContent: 'URL',
            valueType: 'bytes',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        web3.currentProvider,
        {
          ipfsConvertUrl(url) {
            return url.replace(
              'ipfs://',
              'https://api.universalprofile.cloud/ipfs/',
            );
          },
          ipfsFetch(url) {
            return fetch(url);
          },
        },
      );

      const data = await erc725.fetchData('LSP3Profile');
      assert.deepStrictEqual(data, {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: null,
        dynamicName: 'LSP3Profile',
      });
    });

    it('should getData with multiple kind of input', async () => {
      // "Manual test" which checks if it handles well multiple kind of keys
      responseStore.rpc.getData = (key: `0x${string}`) => {
        switch (key) {
          case '0x48643a15ac5407a175674ab0f8c92df5ae90694dac72ebf0a058fb2599e3b06a':
            return '0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264';
          case '0x74ac2555c10b9349e78f0000b74a88c43bcf691bd7a851f6603cb1868f6fc147':
            return '0x1098603b193d276f5fa176cc02007b609f9dae6b';
          case '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347':
            return '0x5ef83ad9';
        }
        return;
      };
      const erc725 = new ERC725(
        [
          {
            name: 'MyURL',
            key: '0x48643a15ac5407a175674ab0f8c92df5ae90694dac72ebf0a058fb2599e3b06a',
            keyType: 'Singleton',
            valueContent: 'URL',
            valueType: 'bytes',
          },
          {
            name: 'SupportedStandards:LSP3Profile',
            key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
            keyType: 'Mapping',
            valueContent: '0x5ef83ad9',
            valueType: 'bytes',
          },
          {
            name: 'LSP12IssuedAssetsMap:<address>',
            key: '0x74ac2555c10b9349e78f0000<address>',
            keyType: 'Mapping',
            valueContent: 'Address',
            valueType: 'address',
          },
        ],
        '0x24464DbA7e7781a21eD86133Ebe88Eb9C0762620', // result is mocked so we can use any address
        web3.currentProvider,
      );

      const data = await erc725.getData([
        'MyURL',
        {
          keyName: 'LSP12IssuedAssetsMap:<address>',
          dynamicKeyParts: '0xb74a88C43BCf691bd7A851f6603cb1868f6fc147',
        },
        'SupportedStandards:LSP3Profile',
      ]);
      assert.deepStrictEqual(data, [
        {
          key: '0x48643a15ac5407a175674ab0f8c92df5ae90694dac72ebf0a058fb2599e3b06a',
          name: 'MyURL',
          dynamicName: 'MyURL',
          value: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
        },
        {
          key: '0x74ac2555c10b9349e78f0000b74a88c43bcf691bd7a851f6603cb1868f6fc147',
          name: 'LSP12IssuedAssetsMap:<address>',
          dynamicName:
            'LSP12IssuedAssetsMap:0xb74a88C43BCf691bd7A851f6603cb1868f6fc147',
          value: '0x1098603B193d276f5fA176CC02007B609F9DAE6b',
        },
        {
          key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
          name: 'SupportedStandards:LSP3Profile',
          dynamicName: 'SupportedStandards:LSP3Profile',
          value: '0x5ef83ad9',
        },
      ]);
    });
  });
  [
    { name: 'legacy', interface: ERC725Y_INTERFACE_IDS.legacy },
    { name: 'latest', interface: ERC725Y_INTERFACE_IDS['3.0'] },
  ].forEach((contractVersion) => {
    describe(`Getting all data in schema by provider [ERC725Y ${contractVersion.name}][mock]`, () => {
      const web3 = new Web3('https://rpc.testnet.lukso.network');
      const fullResults = generateAllResults(mockSchema);
      after(() => {
        resetMocks();
      });
      it('with web3.currentProvider', async () => {
        const erc725 = new ERC725(mockSchema, address, web3.currentProvider);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      it('with ethereumProvider EIP 1193 (ethers)', async () => {
        responseStore.supportsInterfaces = [
          contractVersion.interface as `0x${string}`,
        ];
        const provider = getDefaultProvider(
          'https://rpc.testnet.lukso.network',
        );
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      it('with ethereumProvider EIP 1193 (legacy ethereum provider)', async () => {
        responseStore.supportsInterfaces = [
          contractVersion.interface as `0x${string}`,
        ];
        const provider = new LegacyProviderWrapper(
          new web3.providers.HttpProvider('https://rpc.testnet.lukso.network'),
        );
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      it('with ethereumProvider viem', async () => {
        responseStore.supportsInterfaces = [
          contractVersion.interface as `0x${string}`,
        ];
        const client = createPublicClient({
          chain: luksoTestnet,
          transport: http('https://rpc.testnet.lukso.network'),
        });
        const erc725 = new ERC725(mockSchema, address, client);
        const result = await erc725.getData();
        assert.deepStrictEqual(result, fullResults);
      });

      const testJSONURLSchema: ERC725JSONSchema = {
        name: 'TestJSONURL',
        key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      };

      it('fetchData JSONURL', async () => {
        const erc725 = new ERC725(
          [testJSONURLSchema], // Normal entry with old JSONURL name.
          address,
          web3.currentProvider,
          {
            ipfsGateway: IPFS_GATEWAY,
          },
        );

        const jsonString = mockJson.data;

        const result = await erc725.fetchData('TestJSONURL');
        assert.deepStrictEqual(result, {
          dynamicName: testJSONURLSchema.name,
          key: testJSONURLSchema.key,
          name: testJSONURLSchema.name,
          value: JSON.parse(jsonString),
        });
      });

      it('fetchData JSONURL with custom config.ipfsGateway', async () => {
        const erc725 = new ERC725(
          [testJSONURLSchema],
          address,
          web3.currentProvider,
          {
            ipfsGateway: IPFS_GATEWAY,
          },
        );

        const jsonString = mockJson.data;

        const result = await erc725.fetchData('TestJSONURL');
        assert.deepStrictEqual(result, {
          key: testJSONURLSchema.key,
          name: testJSONURLSchema.name,
          value: JSON.parse(jsonString),
          dynamicName: testJSONURLSchema.name,
        });
      });

      it('fetchData JSONURL with custom config.ipfsGateway (all)', async () => {
        const erc725 = new ERC725(
          [testJSONURLSchema],
          address,
          web3.currentProvider,
          {
            ipfsGateway: IPFS_GATEWAY,
          },
        );

        const jsonString = mockJson.data;

        const result = await erc725.fetchData();
        assert.deepStrictEqual(result, [
          {
            key: testJSONURLSchema.key,
            name: testJSONURLSchema.name,
            value: JSON.parse(jsonString),
            dynamicName: testJSONURLSchema.name,
          },
        ]);
      });

      if (contractVersion.interface === ERC725Y_INTERFACE_IDS['3.0']) {
        it('fetchData JSONURL with dynamic key', async () => {
          const extraSchema: ERC725JSONSchema[] = [
            {
              name: 'JSONForAddress:<address>',
              key: '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe',
              keyType: 'Singleton',
              valueContent: 'JSONURL',
              valueType: 'bytes',
            },
          ];
          responseStore.rpc.getData = (key: `0x${string}`) => {
            if (
              key ===
              '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe'
            ) {
              return encodeData(
                {
                  keyName: 'JSONForAddress:<address>',
                  value: {
                    json: JSON.parse(mockJson.data),
                    url: mockJson.url,
                  } as any,
                  dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
                },
                extraSchema,
              ).values[0] as `0x${string}`;
            }
            return;
          };
          const erc725 = new ERC725(extraSchema, address, web3.currentProvider);

          const jsonString = mockJson.data;

          const result = await erc725.fetchData({
            keyName: 'JSONForAddress:<address>',
            dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
          });

          assert.deepStrictEqual(result, {
            name: 'JSONForAddress:<address>',
            dynamicName:
              'JSONForAddress:0xcafecafecafecafecafecafecafecafecafecafe',
            key: '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe',
            value: JSON.parse(jsonString),
          });
        });
      }

      if (contractVersion.interface === ERC725Y_INTERFACE_IDS.legacy) {
        it('fetchData AssetURL', async () => {
          responseStore.supportsInterfaces = [
            contractVersion.interface as `0x${string}`,
          ];
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
            web3.currentProvider,
          );
          const result = await erc725.fetchData('TestAssetURL');

          assert.deepStrictEqual(result.value, {
            // Changed to reuse one of the existing mock data.
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
      }
    });
  });

  describe('Getting data by schema element by provider', () => {
    after(() => {
      resetMocks();
    });
    const web3 = new Web3('https://rpc.testnet.lukso.network');
    mockSchema.forEach((schemaElement) => {
      it(`${schemaElement.name} with web3.currentProvider`, async () => {
        responseStore.supportsInterfaces = [
          ERC725Y_INTERFACE_IDS.legacy as `0x${string}`,
        ];
        // fetchData JSONURL with dynamic key
        const provider = new web3.providers.HttpProvider(
          'https://rpc.testnet.lukso.network',
        );
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(
          schemaElement.dynamicKeyParts
            ? {
                keyName: schemaElement.name,
                dynamicKeyParts: schemaElement.dynamicKeyParts,
              }
            : schemaElement.key,
        );
        assert.deepStrictEqual(result, {
          name: schemaElement.name,
          key: schemaElement.key,
          value: schemaElement.expectedResult,
          dynamicName: schemaElement.dynamicName,
        });
      });

      it(`${schemaElement.name} with ethereumProvider EIP 1193`, async () => {
        responseStore.supportsInterfaces = [
          ERC725Y_INTERFACE_IDS.legacy as `0x${string}`,
        ];
        const erc725 = new ERC725(mockSchema, address, web3.currentProvider);
        const result = await erc725.getData(
          schemaElement.dynamicKeyParts
            ? {
                keyName: schemaElement.name,
                dynamicKeyParts: schemaElement.dynamicKeyParts,
              }
            : schemaElement.key,
        );
        assert.deepStrictEqual(result, {
          name: schemaElement.name,
          key: schemaElement.key,
          value: schemaElement.expectedResult,
          dynamicName: schemaElement.dynamicName,
        });
      });
    });
  });

  describe('Testing `encodeData`', () => {
    describe('for `uintN` as `Number`', () => {
      [
        {
          valueType: 'uint8',
          valueToEncode: 10n,
          expectedEncodedValue: '0x0a',
        },
        {
          valueType: 'uint16',
          valueToEncode: 10n,
          expectedEncodedValue: '0x000a',
        },
        {
          valueType: 'int16',
          valueToEncode: 10n,
          expectedEncodedValue: '0x000a',
        },
        {
          valueType: 'uint24',
          valueToEncode: 10n,
          expectedEncodedValue: '0x00000a',
        },
        {
          valueType: 'uint32',
          valueToEncode: 10n,
          expectedEncodedValue: '0x0000000a',
        },
        {
          valueType: 'int32',
          valueToEncode: 10n,
          expectedEncodedValue: '0x0000000a',
        },
        {
          valueType: 'uint128',
          valueToEncode: 10n,
          expectedEncodedValue: '0x0000000000000000000000000000000a',
        },
        {
          valueType: 'uint256',
          valueToEncode: 10n,
          expectedEncodedValue:
            '0x000000000000000000000000000000000000000000000000000000000000000a',
        },
      ].forEach((testCase) => {
        it('should encode a valueType `uintN` as valueContent `Number` correctly with the right padding', () => {
          const schema = {
            name: 'ExampleUintN',
            key: '0x512cddbe2654abd240fafbed308d91e82ff977301943f08ea825ba3e435bfa57',
            keyType: 'Singleton',
            valueType: testCase.valueType,
            valueContent: 'Number',
          };
          const erc725js = new ERC725([schema]);
          const result = erc725js.encodeData([
            { keyName: schema.name, value: testCase.valueToEncode },
          ]);

          assert.equal(result.values[0], testCase.expectedEncodedValue);
        });
      });
    });

    describe('for tuples', () => {
      it('encode `(bytes4,uint128)`', () => {
        const schema = {
          name: 'LSP4CreatorsMap:<address>',
          key: '0x6de85eaf5d982b4e5da00000<address>',
          keyType: 'Mapping',
          valueType: '(bytes4,uint128)',
          valueContent: '(Bytes4,Number)',
        };

        const expectedEncodedValue =
          '0xb3c4928f00000000000000000000000000000005';

        const result = ERC725.encodeData(
          [
            {
              keyName: 'LSP4CreatorsMap:<address>',
              dynamicKeyParts: address,
              value: ['0xb3c4928f', 5],
            },
          ],
          [schema],
        );

        assert.equal(result.values[0], expectedEncodedValue);
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
        it(`Encode data values in array: ${schemaElement.name}`, async () => {
          const results: string[] = [];

          // Encode array loop
          for (let i = 0; i < schemaElement.expectedResult.length; i++) {
            if (i === 0) {
              // Push the array length into the first element of results array
              results.push(
                leftPad(numberToHex(schemaElement.expectedResult.length), 32),
              );
            }

            results.push(
              encodeKeyValue(
                schemaElement.valueContent,
                schemaElement.valueType,
                schemaElement.expectedResult[i],
                schemaElement.name,
              ) as string,
            );
          } // end for loop
          assert.deepStrictEqual(results, schemaElement.returnGraphData);
        });

        it(`decodes data values in array: ${schemaElement.name}`, async () => {
          const results: any[] = [];

          // decode array loop
          for (let i = 0; i < schemaElement.returnGraphData.length; i++) {
            const element = schemaElement.returnGraphData[i];

            if (i === 0) {
              // toNumber will now work with bigint and will no longer
              // throw an error for address values as before.
              toNumber(element);
            } else {
              const result = decodeKeyValue(
                schemaElement.valueContent,
                schemaElement.valueType,
                element,
                schemaElement.name,
              );

              // Handle object types
              const keys =
                result && typeof result === 'object' && Object.keys(result);
              if (keys && keys.length > 0) {
                const objResult = {};

                for (let j = 0; j < keys.length; j++) {
                  const key = keys[j];
                  const e = result[key];
                  objResult[key] = e;
                }

                results.push(objResult);
              } else {
                results.push(result);
              }
            }
          } // end for loop
          assert.deepStrictEqual(results, schemaElement.expectedResult);
        });

        it(`encodes all data values for keyType "Array" in: ${schemaElement.name}`, async () => {
          const data = schemaElement.expectedResult;
          const intendedResults = allGraphData.filter(
            (e) =>
              slice(e.key, 0, 16) === slice(schemaElement.key as Hex, 0, 16),
          );
          // handle '0x'....
          // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
          const results = encodeKey(schemaElement, data);
          assert.deepStrictEqual(results, intendedResults);
        });

        it(`decodes all data values for keyType "Array" in: ${schemaElement.name}`, async () => {
          const values = allGraphData.filter(
            (e) =>
              slice(e.key, 0, 16) === slice(schemaElement.key as Hex, 0, 16),
          );
          const intendedResults = schemaElement.expectedResult;
          const results = decodeKey(schemaElement, values);
          assert.deepStrictEqual(results, intendedResults);
        });

        it(`encodes all data values for keyType "Array" in naked class instance: ${schemaElement.name}`, async () => {
          const data = schemaElement.expectedResult;

          const keyValuePairs = allGraphData.filter(
            (e) =>
              slice(e.key, 0, 16) === slice(schemaElement.key as Hex, 0, 16),
          );

          const intendedResult: { keys: string[]; values: string[] } = {
            keys: [],
            values: [],
          };

          keyValuePairs.forEach(({ key, value }) => {
            intendedResult.keys.push(key);
            intendedResult.values.push(value);
          });

          const erc725 = new ERC725([schemaElement]);

          const results = erc725.encodeData([
            {
              keyName: schemaElement.name,
              value: data,
            },
          ]);
          assert.deepStrictEqual(results, intendedResult);
        });

        it('encodes subset of elements for keyType "Array" in naked class instance', () => {
          const schemas: ERC725JSONSchema[] = [
            {
              name: 'AddressPermissions[]',
              key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
              keyType: 'Array',
              valueType: 'address',
              valueContent: 'Address',
            },
          ];
          const erc725 = new ERC725(schemas);
          const encodedArraySection = erc725.encodeData([
            {
              keyName: 'AddressPermissions[]',
              value: [
                '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
                '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
              ],
              totalArrayLength: 23,
              startingIndex: 21,
            },
          ]);

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
          assert.deepStrictEqual(encodedArraySection, expectedResult);
        });

        it(`decode all data values for keyType "Array" in naked class instance: ${schemaElement.name}`, async () => {
          const values = allGraphData.filter(
            (e) => e.key.slice(0, 34) === schemaElement.key.slice(0, 34),
          );
          const intendedResults = schemaElement.expectedResult;
          const erc725 = new ERC725([schemaElement]);
          const results = erc725.decodeData([
            {
              keyName: schemaElement.name,
              value: values,
            },
          ]);
          assert.deepStrictEqual(results[0].value, intendedResults);
        });

        it(`decode all data values for keyType "Array" in naked class instance: ${schemaElement.name}`, async () => {
          const values = allGraphData.filter(
            (e) => e.key.slice(0, 34) === schemaElement.key.slice(0, 34),
          );
          const intendedResults = schemaElement.expectedResult;
          const results = ERC725.decodeData(
            [
              {
                keyName: schemaElement.name,
                value: values,
              },
            ],
            [schemaElement],
          );
          assert.deepStrictEqual(results[0].value, intendedResults);
        });
      } else {
        if (schemaElement.dynamicKeyParts) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // SINGLETON type: This is not an array, assumed 'Singleton'
        it(`encodes data value for: ${schemaElement.name}`, async () => {
          const result = encodeKeyValue(
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.expectedResult,
            schemaElement.name,
          );
          assert.deepStrictEqual(result, schemaElement.returnGraphData);
        });

        it(`decodes data value for: ${schemaElement.name}`, async () => {
          const result = decodeKeyValue(
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.returnGraphData,
            schemaElement.name,
          );
          try {
            assert.deepStrictEqual(result, schemaElement.expectedResult);
          } catch {
            decodeKeyValue(
              schemaElement.valueContent,
              schemaElement.valueType,
              schemaElement.returnGraphData,
              schemaElement.name,
            );
          }
        });

        it(`Encode data value from naked class instance for ${schemaElement.name}`, async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.encodeData([
            {
              keyName: schemaElement.name,
              dynamicKeyParts: schemaElement.dynamicKeyParts,
              value: schemaElement.expectedResult,
            },
          ]);
          assert.deepStrictEqual(result, {
            keys: [schemaElement.key],
            values: [schemaElement.returnGraphData],
          });
        });

        it(`Decode data value from naked class instance for ${schemaElement.name}`, async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.decodeData([
            {
              keyName: schemaElement.name,
              value: schemaElement.returnGraphData,
              dynamicKeyParts: schemaElement.dynamicKeyParts,
            },
          ]);
          assert.deepStrictEqual(result[0].value, schemaElement.expectedResult);
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

    const myERC725 = new ERC725(schema);

    const json = {
      name: 'rryter',
      description: 'Web Developer located in Switzerland.',
      profileImage: [
        {
          width: 1350,
          height: 1800,
          verification: {
            method: 'keccak256(bytes)',
            data: '0x229b60ea5b58e1ab8e6f1063300be110bb4fa663ba75d3814d60104ac6b74497',
          },
          url: 'ipfs://Qmbv9j6iCDDYJ1NXHTZnNHDJ6qaaKkZsf79jhUMFAXcfDR',
        },
        {
          width: 768,
          height: 1024,
          verification: {
            method: 'keccak256(bytes)',
            data: '0x320db57770084f114988c8a94bcf219ca66c69421590466a45f382cd84995c2b',
          },
          url: 'ipfs://QmS4m2LmRpay7Jij4DCpvaW5zKZYy43ATZdRxUkUND6nG3',
        },
      ],
      backgroundImage: [
        {
          width: 1024,
          height: 768,
          verification: {
            method: 'keccak256(bytes)',
            data: '0xbe2d39fe1e0b1911155afc74010db3483528a2b645dea8fcf47bdc34147769be',
          },
          url: 'ipfs://QmQ6ujfKSc91F44KtMe6WRTSCXoSdCjomQUy8hCUxHMr28',
        },
        {
          width: 640,
          height: 480,
          verification: {
            method: 'keccak256(bytes)',
            data: '0xb115f2bf09994e79726db27a7b8d5a0de41a5b81d11b59b3038fa158718266ff',
          },
          url: 'ipfs://QmakaRZxJMMqwQFJY98J3wjbqYVDnaSZ9sEqBF9iMv3GNX',
        },
      ],
      tags: ['public profile'],
      links: [],
    };

    const encodedData = myERC725.encodeData([
      {
        keyName: 'LSP3Profile',
        value: {
          json,
          url: 'ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
        },
      },
    ]);

    const decodedData = myERC725.decodeData([
      {
        keyName: 'LSP3Profile',
        value: encodedData.values[0],
      },
    ]);

    assert.deepStrictEqual(
      decodedData[0].value.url,
      'ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
    );
    assert.deepStrictEqual(
      decodedData[0].value.verification.data,
      hashData(json, SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8),
    );
    assert.deepStrictEqual(
      decodedData[0].value.verification.method,
      SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
    );
  });

  describe('permissions', () => {
    const testCases: { hex: Hex; permissions }[] = [
      {
        permissions: {
          CHANGEOWNER: true,
          ADDCONTROLLER: true,
          EDITPERMISSIONS: true,
          ADDEXTENSIONS: true,
          CHANGEEXTENSIONS: true,
          ADDUNIVERSALRECEIVERDELEGATE: true,
          CHANGEUNIVERSALRECEIVERDELEGATE: true,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: true,
          TRANSFERVALUE: true,
          SUPER_CALL: true,
          CALL: true,
          SUPER_STATICCALL: true,
          STATICCALL: true,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: true,
          SUPER_SETDATA: true,
          SETDATA: true,
          ENCRYPT: true,
          DECRYPT: true,
          SIGN: true,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x00000000000000000000000000000000000000000000000000000000003f3f7f',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          ADDCONTROLLER: false,
          EDITPERMISSIONS: false,
          ADDEXTENSIONS: false,
          CHANGEEXTENSIONS: false,
          ADDUNIVERSALRECEIVERDELEGATE: false,
          CHANGEUNIVERSALRECEIVERDELEGATE: false,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: false,
          TRANSFERVALUE: false,
          SUPER_CALL: false,
          CALL: false,
          SUPER_STATICCALL: false,
          STATICCALL: false,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          SUPER_SETDATA: false,
          SETDATA: false,
          ENCRYPT: false,
          DECRYPT: false,
          SIGN: false,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          ADDCONTROLLER: false,
          EDITPERMISSIONS: false,
          ADDEXTENSIONS: false,
          CHANGEEXTENSIONS: false,
          ADDUNIVERSALRECEIVERDELEGATE: false,
          CHANGEUNIVERSALRECEIVERDELEGATE: false,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: false,
          TRANSFERVALUE: true,
          SUPER_CALL: false,
          CALL: true,
          SUPER_STATICCALL: false,
          STATICCALL: false,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          SUPER_SETDATA: false,
          SETDATA: false,
          ENCRYPT: false,
          DECRYPT: false,
          SIGN: true,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000200a00',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          ADDCONTROLLER: false,
          EDITPERMISSIONS: false,
          ADDEXTENSIONS: false,
          CHANGEEXTENSIONS: false,
          ADDUNIVERSALRECEIVERDELEGATE: false,
          CHANGEUNIVERSALRECEIVERDELEGATE: false,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: false,
          TRANSFERVALUE: false,
          SUPER_CALL: false,
          CALL: true,
          SUPER_STATICCALL: false,
          STATICCALL: false,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          SUPER_SETDATA: false,
          SETDATA: true,
          ENCRYPT: false,
          DECRYPT: false,
          SIGN: false,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000040800',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          ADDCONTROLLER: false,
          EDITPERMISSIONS: true,
          ADDEXTENSIONS: false,
          CHANGEEXTENSIONS: false,
          ADDUNIVERSALRECEIVERDELEGATE: false,
          CHANGEUNIVERSALRECEIVERDELEGATE: false,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: false,
          TRANSFERVALUE: false,
          SUPER_CALL: false,
          CALL: false,
          SUPER_STATICCALL: false,
          STATICCALL: false,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          SUPER_SETDATA: false,
          SETDATA: true,
          ENCRYPT: false,
          DECRYPT: false,
          SIGN: false,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000040004',
      },
      {
        permissions: {
          CHANGEOWNER: false,
          ADDCONTROLLER: false,
          EDITPERMISSIONS: false,
          ADDEXTENSIONS: false,
          CHANGEEXTENSIONS: false,
          ADDUNIVERSALRECEIVERDELEGATE: false,
          CHANGEUNIVERSALRECEIVERDELEGATE: false,
          REENTRANCY: false,
          SUPER_TRANSFERVALUE: false,
          TRANSFERVALUE: true,
          SUPER_CALL: false,
          CALL: true,
          SUPER_STATICCALL: false,
          STATICCALL: false,
          SUPER_DELEGATECALL: false,
          DELEGATECALL: false,
          DEPLOY: false,
          SUPER_SETDATA: false,
          SETDATA: false,
          ENCRYPT: false,
          DECRYPT: false,
          SIGN: false,
          EXECUTE_RELAY_CALL: false,
          ERC4337_PERMISSION: false,
          ALL_PERMISSIONS: false,
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000a00',
      },
    ];

    const erc725Instance = new ERC725([]);

    describe('encodePermissions', () => {
      testCases.forEach((testCase) => {
        it(`Encodes ${testCase.hex} permission correctly`, () => {
          assert.deepStrictEqual(
            encodePermissions(testCase.permissions),
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
          encodePermissions({
            EDITPERMISSIONS: true,
            SETDATA: true,
          }),
          '0x0000000000000000000000000000000000000000000000000000000000040004',
        );
        assert.deepStrictEqual(
          ERC725.encodePermissions({
            EDITPERMISSIONS: true,
            SETDATA: true,
          }),
          '0x0000000000000000000000000000000000000000000000000000000000040004',
        );
        assert.deepStrictEqual(
          erc725Instance.encodePermissions({
            EDITPERMISSIONS: true,
            SETDATA: true,
          }),
          '0x0000000000000000000000000000000000000000000000000000000000040004',
        );
      });
    });

    describe('Randomized Permissions Encoding', () => {
      function convertToPermissionBits(permissions: {
        [key: string]: string;
      }) {
        const permissionBits = {};
        Object.entries(permissions).forEach(([key, hexValue]) => {
          // Convert hex to binary, then find the position of the '1' bit
          const bitPosition = BigInt(hexValue).toString(2).length - 1;
          permissionBits[key] = bitPosition;
        });
        return permissionBits;
      }

      // remove LSP6_DEFAULT_PERMISSIONS.ALL_PERMISSIONS from LSP6_DEFAULT_PERMISSIONS
      const ALL_PERMISSIONS_WITHOUT_ALL_PERMISSIONS = Object.keys(
        LSP6_DEFAULT_PERMISSIONS,
      ).reduce((acc, key) => {
        if (key !== 'ALL_PERMISSIONS') {
          acc[key] = LSP6_DEFAULT_PERMISSIONS[key];
        }
        return acc;
      }, {});

      // Use the function to generate permissionBits
      const permissionBits = convertToPermissionBits(
        ALL_PERMISSIONS_WITHOUT_ALL_PERMISSIONS,
      );

      // Function to generate a random permissions object
      const generateRandomPermissions = () => {
        return Object.keys(permissionBits).reduce((acc, key) => {
          // Randomly assign true or false
          acc[key] = Math.random() < 0.5;
          return acc;
        }, {});
      };

      // Function to calculate expected hex based on permissions
      const calculateExpectedHex = (permissions) => {
        let basePermissions = BigInt(0);
        Object.entries(permissions).forEach(([key, value]) => {
          if (value) {
            const bitPosition = permissionBits[key];
            basePermissions |= BigInt(1) << BigInt(bitPosition);
          }
        });
        // Convert to hex string, properly padded
        return `0x${basePermissions.toString(16).padStart(64, '0')}`;
      };

      // Run the randomized test multiple times
      const numberOfTests = 100; // Number of random tests
      for (let i = 0; i < numberOfTests; i++) {
        it(`Randomized test #${i + 1}`, () => {
          const randomPermissions = generateRandomPermissions();
          const encoded = encodePermissions(randomPermissions);
          const expectedHex = calculateExpectedHex(randomPermissions);
          assert.strictEqual(
            encoded,
            expectedHex,
            `Failed at randomized test #${i + 1}`,
          );
        });
      }
    });

    describe('all permissions', () => {
      it('should encode ALL_PERMISSIONS correctly', () => {
        const permissions = { ALL_PERMISSIONS: true };
        const encoded = encodePermissions(permissions);

        assert.strictEqual(
          encoded,
          LSP6_DEFAULT_PERMISSIONS.ALL_PERMISSIONS,
          'Encoded permissions do not match expected value for ALL_PERMISSIONS',
        );
      });

      it('should decode ALL_PERMISSIONS', () => {
        const permissions = { ALL_PERMISSIONS: true };
        const encoded = encodePermissions(permissions);

        const decodedPermissions = decodePermissions(encoded);

        assert.strictEqual(
          decodedPermissions.ALL_PERMISSIONS,
          true,
          'Decoded permissions includes ALL_PERMISSIONS',
        );
      });

      it('should decode 0x', () => {
        const decodedPermissions = decodePermissions('0x');

        assert.strictEqual(
          decodedPermissions.CHANGEOWNER,
          false,
          'Decoded permissions is empty',
        );
      });
      it('should not decode CALL or ALL_PERMISSIONS if perms are missing', () => {
        const permissions = { ALL_PERMISSIONS: true, CALL: false };
        const encoded = encodePermissions(permissions);

        const decodedPermissions = decodePermissions(encoded);

        assert.strictEqual(
          decodedPermissions.CALL,
          false,
          'Decoded permissions includes CALL',
        );
        assert.strictEqual(
          decodedPermissions.ALL_PERMISSIONS,
          false,
          'Decoded permissions includes ALL_PERMISSIONS',
        );
      });

      it('should allow editing of permissions remove from all', () => {
        const permissions = { ALL_PERMISSIONS: true };
        const encoded = encodePermissions(permissions);

        const decodedPermissions = decodePermissions(encoded);
        decodedPermissions.CALL = false;
        const reencodePermissions = encodePermissions(decodedPermissions);
        const redecodedPermissions = decodePermissions(reencodePermissions);

        assert.strictEqual(
          redecodedPermissions.CALL,
          false,
          'Re-reencoded permissions does not include CALL',
        );
      });

      it('should allow editing of permissions add extra', () => {
        const permissions = { ALL_PERMISSIONS: true };
        const encoded = encodePermissions(permissions);

        const decodedPermissions = decodePermissions(encoded);
        decodedPermissions.SUPER_DELEGATECALL = true;
        decodedPermissions.DELEGATECALL = true;
        const reencodePermissions = encodePermissions(decodedPermissions);
        const redecodedPermissions = decodePermissions(reencodePermissions);

        assert.strictEqual(
          redecodedPermissions.SUPER_DELEGATECALL,
          true,
          'Re-reencoded permissions includes SUPER_DELEGATECALL',
        );

        assert.strictEqual(
          redecodedPermissions.ALL_PERMISSIONS,
          true,
          'Re-reencoded permissions includes ALL_PERMISSIONS',
        );

        assert.strictEqual(
          redecodedPermissions.DELEGATECALL,
          true,
          'Re-reencoded permissions includes DELEGATECALL',
        );
      });

      it('should ignore individual permissions when ALL_PERMISSIONS is set', () => {
        const permissions = {
          ALL_PERMISSIONS: true,
          CHANGEOWNER: true,
        };
        const encoded = encodePermissions(permissions);
        assert.strictEqual(
          encoded,
          LSP6_DEFAULT_PERMISSIONS.ALL_PERMISSIONS,
          'ALL_PERMISSIONS did not correctly encode with additional permissions',
        );
      });
      it('should be able to disable permissions that are part of ALL_PERMISSIONS', () => {
        const permissions = {
          ALL_PERMISSIONS: true,
          CHANGEOWNER: false, // Explicitly disable CHANGEOWNER
        };

        const encoded = encodePermissions(permissions);
        const decodedPermissions = decodePermissions(encoded);

        // check that the permission is disabled
        assert.strictEqual(
          decodedPermissions.CHANGEOWNER,
          false,
          'CHANGEOWNER permission was not correctly disabled',
        );
      });
    });

    describe('decodePermissions', () => {
      testCases.forEach((testCase) => {
        it(`Decodes ${testCase.hex} permission correctly`, () => {
          assert.deepStrictEqual(
            decodePermissions(testCase.hex),
            testCase.permissions,
          );

          assert.deepStrictEqual(
            erc725Instance.decodePermissions(testCase.hex),
            testCase.permissions,
          );

          assert.deepStrictEqual(
            ERC725.decodePermissions(testCase.hex),
            testCase.permissions,
          );
        });
      });
      it('Decodes 0xfff...fff admin permission correctly but re-encodes only known', () => {
        let decoded = erc725Instance.decodePermissions(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );
        let reencoded: Hex = erc725Instance.encodePermissions(decoded);
        assert.deepStrictEqual(
          reencoded,
          '0x0000000000000000000000000000000000000000000000000000000000ffffff',
        );
        assert.deepStrictEqual(erc725Instance.decodePermissions(reencoded), {
          CHANGEOWNER: true,
          ADDCONTROLLER: true,
          EDITPERMISSIONS: true,
          ADDEXTENSIONS: true,
          CHANGEEXTENSIONS: true,
          ADDUNIVERSALRECEIVERDELEGATE: true,
          CHANGEUNIVERSALRECEIVERDELEGATE: true,
          REENTRANCY: true,
          SUPER_TRANSFERVALUE: true,
          TRANSFERVALUE: true,
          SUPER_CALL: true,
          CALL: true,
          SUPER_STATICCALL: true,
          STATICCALL: true,
          SUPER_DELEGATECALL: true,
          DELEGATECALL: true,
          DEPLOY: true,
          SUPER_SETDATA: true,
          SETDATA: true,
          ENCRYPT: true,
          DECRYPT: true,
          SIGN: true,
          EXECUTE_RELAY_CALL: true,
          ERC4337_PERMISSION: true,
          ALL_PERMISSIONS: true,
        });
        decoded = decodePermissions(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );
        reencoded = encodePermissions(decoded);
        assert.deepStrictEqual(
          reencoded,
          '0x0000000000000000000000000000000000000000000000000000000000ffffff',
        );
        assert.deepStrictEqual(decodePermissions(reencoded), {
          CHANGEOWNER: true,
          ADDCONTROLLER: true,
          EDITPERMISSIONS: true,
          ADDEXTENSIONS: true,
          CHANGEEXTENSIONS: true,
          ADDUNIVERSALRECEIVERDELEGATE: true,
          CHANGEUNIVERSALRECEIVERDELEGATE: true,
          REENTRANCY: true,
          SUPER_TRANSFERVALUE: true,
          TRANSFERVALUE: true,
          SUPER_CALL: true,
          CALL: true,
          SUPER_STATICCALL: true,
          STATICCALL: true,
          SUPER_DELEGATECALL: true,
          DELEGATECALL: true,
          DEPLOY: true,
          SUPER_SETDATA: true,
          SETDATA: true,
          ENCRYPT: true,
          DECRYPT: true,
          SIGN: true,
          EXECUTE_RELAY_CALL: true,
          ERC4337_PERMISSION: true,
          ALL_PERMISSIONS: true,
        });
      });
      it('Decodes 0xfff...fff admin permission correctly', () => {
        assert.deepStrictEqual(
          decodePermissions(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ),
          {
            CHANGEOWNER: true,
            ADDCONTROLLER: true,
            EDITPERMISSIONS: true,
            ADDEXTENSIONS: true,
            CHANGEEXTENSIONS: true,
            ADDUNIVERSALRECEIVERDELEGATE: true,
            CHANGEUNIVERSALRECEIVERDELEGATE: true,
            REENTRANCY: true,
            SUPER_TRANSFERVALUE: true,
            TRANSFERVALUE: true,
            SUPER_CALL: true,
            CALL: true,
            SUPER_STATICCALL: true,
            STATICCALL: true,
            SUPER_DELEGATECALL: true,
            DELEGATECALL: true,
            DEPLOY: true,
            SUPER_SETDATA: true,
            SETDATA: true,
            ENCRYPT: true,
            DECRYPT: true,
            SIGN: true,
            EXECUTE_RELAY_CALL: true,
            ERC4337_PERMISSION: true,
            ALL_PERMISSIONS: true,
          },
        );
        assert.deepStrictEqual(
          erc725Instance.decodePermissions(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ),
          {
            CHANGEOWNER: true,
            ADDCONTROLLER: true,
            EDITPERMISSIONS: true,
            ADDEXTENSIONS: true,
            CHANGEEXTENSIONS: true,
            ADDUNIVERSALRECEIVERDELEGATE: true,
            CHANGEUNIVERSALRECEIVERDELEGATE: true,
            REENTRANCY: true,
            SUPER_TRANSFERVALUE: true,
            TRANSFERVALUE: true,
            SUPER_CALL: true,
            CALL: true,
            SUPER_STATICCALL: true,
            STATICCALL: true,
            SUPER_DELEGATECALL: true,
            DELEGATECALL: true,
            DEPLOY: true,
            SUPER_SETDATA: true,
            SETDATA: true,
            ENCRYPT: true,
            DECRYPT: true,
            SIGN: true,
            EXECUTE_RELAY_CALL: true,
            ERC4337_PERMISSION: true,
            ALL_PERMISSIONS: true,
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

    const foundSchema = getSchema(schema.key, [schema]);

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

    const foundSchema = getSchema(schema.key, [schema]);

    assert.deepStrictEqual(foundSchema, schema);
  });
});

describe('encodeKeyName', () => {
  it('is available on instance and class', () => {
    assert.deepStrictEqual(
      encodeKeyName('MyKeyName'),
      '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
    );
    assert.deepStrictEqual(
      ERC725.encodeKeyName('MyKeyName'),
      '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
    );
    const erc725Instance = new ERC725([]);
    assert.deepStrictEqual(
      erc725Instance.encodeKeyName('MyKeyName'),
      '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
    );
  });

  it('works for dynamic keys', () => {
    assert.deepStrictEqual(
      encodeKeyName(
        'FavouriteFood:<address>',
        '0xa4FBbFe353124E6fa6Bb7f8e088a9269dF552EA2',
      ),
      '0x31145577efe228036af40000a4fbbfe353124e6fa6bb7f8e088a9269df552ea2',
    );
  });

  it('works for Array keys with index as `dynamicKeyParts', () => {
    assert.deepStrictEqual(
      encodeKeyName('MusicPlaylist[]', 2),
      '0x03573598507fc76d82171baa336b7fd700000000000000000000000000000002',
    );
  });
});

describe('supportsInterface', () => {
  const erc725Instance = new ERC725([]);

  it('is available on instance and class', () => {
    assert.typeOf(supportsInterface, 'function');
    assert.typeOf(erc725Instance.supportsInterface, 'function');
  });

  const interfaceId = INTERFACE_IDS_0_12_0.LSP1UniversalReceiver;
  const rpcUrl = 'https://my.test.provider';
  const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe';

  it('should throw when provided address is not an address', async () => {
    try {
      await supportsInterface(interfaceId, {
        address: 'notAnAddress',
        rpcUrl,
      });
    } catch (error: any) {
      assert.deepStrictEqual(error.message, 'Invalid address');
    }
  });

  it('should throw when rpcUrl is not provided on non instantiated class', async () => {
    try {
      await supportsInterface(interfaceId, {
        address: contractAddress,
        // @ts-ignore
        rpcUrl: undefined,
      });
    } catch (error: any) {
      assert.deepStrictEqual(error.message, 'Missing RPC URL');
    }
  });

  // TODO: add test to test the actual behavior of the function.
});

describe('checkPermissions', () => {
  const erc725Instance = new ERC725([]);

  it('is available on instance', () => {
    assert.typeOf(erc725Instance.checkPermissions, 'function');

    const requiredPermissions = [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000000000000000000000000000800',
    ];
    const grantedPermissions =
      '0x000000000000000000000000000000000000000000000000000000000000ff51';
    const result = erc725Instance.checkPermissions(
      requiredPermissions,
      grantedPermissions,
    );

    assert.equal(result, false);
  });

  it('is available on class', () => {
    assert.typeOf(checkPermissions, 'function');

    const requiredPermissions = [
      '0x0000000000000000000000000000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000000000000000000000000000800',
    ];
    const grantedPermissions =
      '0x000000000000000000000000000000000000000000000000000000000000ff51';

    const result = ERC725.checkPermissions(
      requiredPermissions,
      grantedPermissions,
    );

    assert.equal(result, false);
  });

  it('has mapPermissions', () => {
    assert.equal(
      mapPermission('SETDATA'),
      '0x0000000000000000000000000000000000000000000000000000000000040000',
    );
    assert.equal(
      ERC725.mapPermission('SETDATA'),
      '0x0000000000000000000000000000000000000000000000000000000000040000',
    );
    assert.equal(
      new ERC725([]).mapPermission('SETDATA'),
      '0x0000000000000000000000000000000000000000000000000000000000040000',
    );
  });
});

describe('decodeMappingKey', () => {
  it('is available on instance and class', () => {
    assert.deepStrictEqual(
      decodeMappingKey(
        '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
        'MyKeyName:<address>',
      ),
      [
        {
          type: 'address',
          value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
        },
      ],
    );
    assert.deepStrictEqual(
      ERC725.decodeMappingKey(
        encodeKeyName('MyKeyName:<bytes16>', ['0x12345678']),
        'MyKeyName:<bytes16>',
      ),
      [
        {
          type: 'bytes16',
          value: '0x12345678000000000000000000000000',
        },
      ],
    );
    const erc725 = new ERC725([]);
    assert.deepStrictEqual(
      erc725.decodeMappingKey(
        '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
        'MyKeyName:<address>',
      ),
      [
        {
          type: 'address',
          value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
        },
      ],
    );
    assert.throws(() => {
      decodeMappingKey(
        encodeKeyName('LSP8MetadataTokenURI:<string>', ['hello there']),
        // '0x1339e76a390b7b9ec9010000e753904c77f5a07e628eff190bbddad936aaffb2',
        // '0x6c2a998f88b72c27017768656c6c6f20776f726c640000000000000000000000',
        'LSP8MetadataTokenURI:<string>',
      );
    }, /String dynamic key parts cannot be decoded/);
  });
});
