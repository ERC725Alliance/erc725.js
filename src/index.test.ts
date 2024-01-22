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

import Web3 from 'web3';
import * as sinon from 'sinon';
import { hexToNumber, leftPad, numberToHex } from 'web3-utils';

// examples of schemas to load (for testing)
import { LSP1Schema, LSP12Schema, LSP3Schema, LSP6Schema } from './schemas';

import ERC725 from '.';
import {
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

import 'isomorphic-fetch';

import {
  ERC725Y_INTERFACE_IDS,
  SUPPORTED_VERIFICATION_METHOD_STRINGS,
} from './constants/constants';
import { decodeKey } from './lib/decodeData';
import { INTERFACE_IDS_0_12_0 } from './constants/interfaces';

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';

describe('Running @erc725/erc725.js tests...', () => {
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
    it('should return true if the signature is valid [using rpcUrl]', async () => {
      const rpcUrl = 'https://rpc.l14.lukso.network';
      const erc725 = new ERC725(
        [],
        '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42', // result is mocked so we can use any address
        rpcUrl,
      );
      const res = await erc725.isValidSignature(
        'hello',
        '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
      );
      assert.deepStrictEqual(res, true);
    });

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

    it('should return false if the signature is invalid [using rpcUrl]', async () => {
      const contractAddress = '0xD295E4748c1DFDFE028D7Dd2FEC3e52de2b1EB42';
      const rpcUrl = 'https://rpc.l14.lukso.network';
      const erc725 = new ERC725(
        [],
        contractAddress, // result is mocked so we can use any address
        rpcUrl,
      );

      try {
        await erc725.isValidSignature(
          'wrong message',
          '0x6c54ad4814ed6de85b9786e79de48ad0d597a243158194fa6b3604254ff58f9c2e4ffcc080e18a68c8e813f720b893c8d47d6f757b9e288a5814263642811c1b1c',
        );
        // should not reach this line
        assert.deepStrictEqual(true, false);
      } catch (error: any) {
        assert.deepStrictEqual(
          error.message,
          `Error when checking signature. Is ${contractAddress} a valid contract address which supports EIP-1271 standard?`,
        );
      }
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

      const expectedResult = {
        name: 'ThisKeyDoesNotExist',
        key: '0xb12a0af5f83066646eb63c96bf29dcb827024d9a33189f5a61652a03951d1fbe',
        value: null,
      };

      assert.deepStrictEqual(data, expectedResult);

      const dataArray = await erc725.getData(['ThisKeyDoesNotExist']);
      assert.deepStrictEqual(dataArray, [expectedResult]);
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
      assert.deepStrictEqual(data, {
        name: 'NonExistingArray[]',
        key: '0xd6cbdbfc8d25c9ce4720b5fe6fa8fc536803944271617bf5425b4bd579195840',
        value: [],
      });

      const dataArray = await erc725.getData(['NonExistingArray[]']);
      assert.deepStrictEqual(dataArray, [
        {
          name: 'NonExistingArray[]',
          key: '0xd6cbdbfc8d25c9ce4720b5fe6fa8fc536803944271617bf5425b4bd579195840',
          value: [],
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
      },
    ];

    it('with web3.currentProvider [legacy]', async () => {
      const erc725 = new ERC725(
        e2eSchema,
        LEGACY_ERC725_CONTRACT_ADDRESS,
        web3.currentProvider,
      );
      const result = await erc725.getData();
      assert.deepStrictEqual(result, e2eResults);
    });

    it('with web3.currentProvider', async () => {
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

    describe('By HttpProvider', () => {
      const provider = new HttpProvider(
        {
          returnData: [
            {
              key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
              value:
                '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001436e4Eb6Ee168EF54B1E8e850ACBE51045214B313000000000000000000000000',
            },
          ],
        },
        [ERC725Y_INTERFACE_IDS['5.0']],
      );

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
          provider,
        );

        const [result] = await erc725.getData();
        assert.deepStrictEqual(result, {
          name: 'LSP1UniversalReceiverDelegate',
          key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
          value: '0x36e4Eb6Ee168EF54B1E8e850ACBE51045214B313',
        });
      });
    });

    describe('By HttpProvider to retrieve single dynamic key with getDataBatch', () => {
      const provider = new HttpProvider(
        {
          returnData: [
            {
              key: '0x4b80742de2bf82acb36300009139def55c73c12bcda9c44f12326686e3948634',
              value:
                '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002',
            },
          ],
        },
        [ERC725Y_INTERFACE_IDS['5.0']],
      );

      it('should return data even with a single BitArray key', async () => {
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
          provider,
        );

        const data = await erc725.getData([
          {
            keyName: 'AddressPermissions:Permissions:<address>',
            dynamicKeyParts: '0x9139def55c73c12bcda9c44f12326686e3948634',
          },
        ]);
        assert.deepStrictEqual(data[0], {
          key: '0x4b80742de2bf82acb36300009139def55c73c12bcda9c44f12326686e3948634',
          name: 'AddressPermissions:Permissions:9139def55c73c12bcda9c44f12326686e3948634',
          value:
            '0x0000000000000000000000000000000000000000000000000000000000000002',
        });
      });
    });

    describe('By HttpProvider to retrieve single dynamic key with getDataBatch', () => {
      const provider = new HttpProvider(
        {
          returnData: [
            {
              key: '0x6de85eaf5d982b4e5da000009139def55c73c12bcda9c44f12326686e3948634',
              value:
                '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001424871b3d00000000000000000000000000000000000000000000000000000000',
            },
          ],
        },
        [ERC725Y_INTERFACE_IDS['5.0']],
      );

      it('should return data even with a single BitArray key', async () => {
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
          provider,
        );

        const data = await erc725.getData([
          {
            keyName: 'LSP4CreatorsMap:<address>',
            dynamicKeyParts: '0x9139def55c73c12bcda9c44f12326686e3948634',
          },
        ]);
        assert.deepStrictEqual(data[0], {
          key: '0x6de85eaf5d982b4e5da000009139def55c73c12bcda9c44f12326686e3948634',
          name: 'LSP4CreatorsMap:9139def55c73c12bcda9c44f12326686e3948634',
          value: ['0x24871b3d', 0],
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
        },
      ];

      it('with web3.currentProvider [ERC725Y_BATCH]', async () => {
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
        [ERC725Y_INTERFACE_IDS.legacy],
      );
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
        provider,
      );

      const data = await erc725.fetchData('LSP3Profile');
      assert.deepStrictEqual(data, {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: null,
      });
    });

    it('should getData with multiple kind of input', async () => {
      // "Manual test" which checks if it handles well multiple kind of keys
      const provider = new HttpProvider(
        {
          returnData: [
            {
              key: '0x48643a15ac5407a175674ab0f8c92df5ae90694dac72ebf0a058fb2599e3b06a', // MyURL
              value:
                '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a62640000000000000000000000',
            },
            {
              key: '0x74ac2555c10b9349e78f0000b74a88c43bcf691bd7a851f6603cb1868f6fc147', // LSP12IssuedAssetsMap:b74a88C43BCf691bd7A851f6603cb1868f6fc147
              value:
                '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000141098603b193d276f5fa176cc02007b609f9dae6b000000000000000000000000',
            },
            {
              key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347', // SupportedStandards:LSP3Profile
              value:
                '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045ef83ad900000000000000000000000000000000000000000000000000000000',
            },
          ],
        },
        [ERC725Y_INTERFACE_IDS['3.0']],
      );
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
        provider,
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
          value: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
        },
        {
          key: '0x74ac2555c10b9349e78f0000b74a88c43bcf691bd7a851f6603cb1868f6fc147',
          name: 'LSP12IssuedAssetsMap:b74a88C43BCf691bd7A851f6603cb1868f6fc147',
          value: '0x1098603B193d276f5fA176CC02007B609F9DAE6b',
        },
        {
          key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
          name: 'SupportedStandards:LSP3Profile',
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
      // Construct the full data and results
      const fullResults = generateAllResults(mockSchema);
      const allRawData = generateAllRawData(
        mockSchema,
        contractVersion.interface === ERC725Y_INTERFACE_IDS['3.0'],
      );

      it('with web3.currentProvider', async () => {
        const provider = new HttpProvider({ returnData: allRawData }, [
          contractVersion.interface,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
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

      const testJSONURLSchema: ERC725JSONSchema = {
        name: 'TestJSONURL',
        key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      };

      it('fetchData JSONURL', async () => {
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

        const erc725 = new ERC725([testJSONURLSchema], address, provider);

        const jsonString = `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`;

        const fetchStub = sinon.stub(global, 'fetch');
        try {
          fetchStub.onCall(0).returns(
            Promise.resolve(
              new Response(jsonString, {
                headers: { 'content-type': 'application/json' },
              }),
            ),
          );
          const result = await erc725.fetchData('TestJSONURL');
          assert.deepStrictEqual(result, {
            key: testJSONURLSchema.key,
            name: testJSONURLSchema.name,
            value: JSON.parse(jsonString),
          });
        } finally {
          fetchStub.restore();
        }
      });

      it('fetchData JSONURL with custom config.ipfsGateway', async () => {
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

        const ipfsGateway = 'https://api.universalprofile.cloud';

        const erc725 = new ERC725([testJSONURLSchema], address, provider, {
          ipfsGateway,
        });

        const jsonString = `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`;

        const fetchStub = sinon.stub(global, 'fetch');
        try {
          fetchStub.onCall(0).returns(
            Promise.resolve(
              new Response(jsonString, {
                headers: { 'content-type': 'application/json' },
              }),
            ),
          );
          const result = await erc725.fetchData('TestJSONURL');
          assert.deepStrictEqual(result, {
            key: testJSONURLSchema.key,
            name: testJSONURLSchema.name,
            value: JSON.parse(jsonString),
          });

          assert.ok(
            fetchStub.calledWith(
              `${ipfsGateway}/ipfs/QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd`, // this value comes from the mockSchema
            ),
          );
        } finally {
          fetchStub.restore();
        }
      });

      if (contractVersion.interface === ERC725Y_INTERFACE_IDS['3.0']) {
        it('fetchData JSONURL with dynamic key', async () => {
          const provider = new HttpProvider(
            {
              returnData: [
                {
                  key: '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe',
                  value:
                    '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a626400000000000000',
                },
              ],
            },
            [contractVersion.interface],
          );
          const erc725 = new ERC725(
            [
              {
                name: 'JSONForAddress:<address>',
                key: '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe',
                keyType: 'Singleton',
                valueContent: 'JSONURL',
                valueType: 'bytes',
              },
            ],
            address,
            provider,
          );

          const jsonString = `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`;

          const fetchStub = sinon.stub(global, 'fetch');
          try {
            fetchStub
              .onCall(0)
              .returns(Promise.resolve(new Response(jsonString)));
            const result = await erc725.fetchData({
              keyName: 'JSONForAddress:<address>',
              dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
            });

            assert.deepStrictEqual(result, {
              name: 'JSONForAddress:cafecafecafecafecafecafecafecafecafecafe',
              key: '0x84b02f6e50a0a0819a4f0000cafecafecafecafecafecafecafecafecafecafe',
              value: JSON.parse(jsonString),
            });
          } finally {
            fetchStub.restore();
          }
        });
      }

      if (contractVersion.interface === ERC725Y_INTERFACE_IDS.legacy) {
        it('fetchData AssetURL', async () => {
          const fetchStub = sinon.stub(global, 'fetch');
          try {
            fetchStub
              .onCall(0)
              .returns(Promise.resolve(new Response('{"hello": "world"}')));

            const provider = new HttpProvider(
              {
                returnData: [
                  {
                    key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
                    value:
                      '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000598019f9b1586e9b1e1681ba3ebad5ff5e6f673d3e3aa129fcdb76f92083dbc386cdde4312697066733a2f2f516d596f387967347a7a6d647532364e537674736f4b6555356f56523668326f686d6f61324378356939316d506600000000000000',
                  },

                  // Encoded value of:
                  // {
                  //   verification: {
                  //     method: 'keccak256(bytes)', // 0x8019f9b1
                  //     data: '0xc41589e7559804ea4a2080dad19d876a024ccb05117835447d72ce08c1d020ec',
                  //   },
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

            assert.deepStrictEqual(result.value, {
              hello: 'world',
            });
          } finally {
            fetchStub.restore();
          }
        });
      }
    });
  });

  describe('Getting data by schema element by provider', () => {
    mockSchema.forEach((schemaElement) => {
      it(schemaElement.name + ' with web3.currentProvider', async () => {
        const returnRawData = generateAllRawData([schemaElement], false);
        const provider = new HttpProvider({ returnData: returnRawData }, [
          ERC725Y_INTERFACE_IDS.legacy,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(
          schemaElement.dynamicKeyParts
            ? {
                keyName: schemaElement.key,
                dynamicKeyParts: schemaElement.dynamicKeyParts,
              }
            : schemaElement.key,
        );
        assert.deepStrictEqual(result, {
          name: schemaElement.name,
          key: schemaElement.key,
          value: schemaElement.expectedResult,
        });
      });

      it(schemaElement.name + ' with ethereumProvider EIP 1193', async () => {
        const returnRawData = generateAllRawData([schemaElement], false);
        const provider = new HttpProvider({ returnData: returnRawData }, [
          ERC725Y_INTERFACE_IDS.legacy,
        ]);
        const erc725 = new ERC725(mockSchema, address, provider);
        const result = await erc725.getData(
          schemaElement.dynamicKeyParts
            ? {
                keyName: schemaElement.key,
                dynamicKeyParts: schemaElement.dynamicKeyParts,
              }
            : schemaElement.key,
        );
        assert.deepStrictEqual(result, {
          name: schemaElement.name,
          key: schemaElement.key,
          value: schemaElement.expectedResult,
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

        it('decodes data values in array: ' + schemaElement.name, async () => {
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

        it(`encodes all data values for keyType "Array" in: ${schemaElement.name}`, async () => {
          const data = schemaElement.expectedResult;
          const intendedResults = allGraphData.filter(
            (e) => e.key.slice(0, 34) === schemaElement.key.slice(0, 34),
          );
          // handle '0x'....
          // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
          const results = encodeKey(schemaElement, data);
          assert.deepStrictEqual(results, intendedResults);
        });

        it(`decodes all data values for keyType "Array" in: ${schemaElement.name}`, async () => {
          const values = allGraphData.filter(
            (e) => e.key.slice(0, 34) === schemaElement.key.slice(0, 34),
          );
          const intendedResults = schemaElement.expectedResult;
          const results = decodeKey(schemaElement, values);
          assert.deepStrictEqual(results, intendedResults);
        });

        it(`encodes all data values for keyType "Array" in naked class instance: ${schemaElement.name}`, async () => {
          const data = schemaElement.expectedResult;

          const keyValuePairs = allGraphData.filter(
            (e) => e.key.slice(0, 34) === schemaElement.key.slice(0, 34),
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

          const results = erc725.encodeData([
            {
              keyName: schemaElement.name,
              value: data,
            },
          ]);
          assert.deepStrictEqual(results, intendedResult);
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
      } else {
        if (schemaElement.dynamicKeyParts) {
          // eslint-disable-next-line no-continue
          continue;
        }

        // SINGLETON type: This is not an array, assumed 'Singleton'
        it('encodes data value for: ' + schemaElement.name, async () => {
          const result = encodeKeyValue(
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.expectedResult,
            schemaElement.name,
          );
          assert.deepStrictEqual(result, schemaElement.returnGraphData);
        });

        it('decodes data value for: ' + schemaElement.name, async () => {
          const result = decodeKeyValue(
            schemaElement.valueContent,
            schemaElement.valueType,
            schemaElement.returnGraphData,
            schemaElement.name,
          );
          assert.deepStrictEqual(result, schemaElement.expectedResult);
        });

        it(`Encode data value from naked class instance for ${schemaElement.name}`, async () => {
          const erc725 = new ERC725([schemaElement]);
          const result = erc725.encodeData([
            {
              keyName: schemaElement.name,
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
    const testCases: { hex: string; permissions }[] = [
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
        },
        hex: '0x0000000000000000000000000000000000000000000000000000000000000a00',
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

  it('is available on instance and class', () => {
    assert.deepStrictEqual(
      ERC725.encodeKeyName('MyKeyName'),
      '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
    );
    assert.deepStrictEqual(
      erc725Instance.encodeKeyName('MyKeyName'),
      '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2',
    );
  });

  it('works for dynamic keys', () => {
    assert.deepStrictEqual(
      ERC725.encodeKeyName(
        'FavouriteFood:<address>',
        '0xa4FBbFe353124E6fa6Bb7f8e088a9269dF552EA2',
      ),
      '0x31145577efe228036af40000a4fbbfe353124e6fa6bb7f8e088a9269df552ea2',
    );
    assert.deepStrictEqual(
      erc725Instance.encodeKeyName(
        'FavouriteFood:<address>',
        '0xa4FBbFe353124E6fa6Bb7f8e088a9269dF552EA2',
      ),
      '0x31145577efe228036af40000a4fbbfe353124e6fa6bb7f8e088a9269df552ea2',
    );
  });
});

describe('supportsInterface', () => {
  const erc725Instance = new ERC725([]);

  it('is available on instance and class', () => {
    assert.typeOf(ERC725.supportsInterface, 'function');
    assert.typeOf(erc725Instance.supportsInterface, 'function');
  });

  const interfaceId = INTERFACE_IDS_0_12_0.LSP1UniversalReceiver;
  const rpcUrl = 'https://my.test.provider';
  const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe';

  it('should throw when provided address is not an address', async () => {
    try {
      await ERC725.supportsInterface(interfaceId, {
        address: 'notAnAddress',
        rpcUrl,
      });
    } catch (error: any) {
      assert.deepStrictEqual(error.message, 'Invalid address');
    }
  });

  it('should throw when rpcUrl is not provided on non instantiated class', async () => {
    try {
      await ERC725.supportsInterface(interfaceId, {
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
    assert.typeOf(ERC725.checkPermissions, 'function');

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
});

describe('decodeMappingKey', () => {
  const erc725Instance = new ERC725([]);

  it('is available on instance and class', () => {
    assert.deepStrictEqual(
      ERC725.decodeMappingKey(
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
      erc725Instance.decodeMappingKey(
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
  });
});
