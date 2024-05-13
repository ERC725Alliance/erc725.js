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

import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import { getDataFromExternalSources } from './getDataFromExternalSources';
import { DecodeDataOutput } from '../types/decodeData';

const IPFS_GATEWAY_MOCK = 'https://mock-ipfs.mock/ipfs/';

describe('getDataFromExternalSources', () => {
  it('should not throw if the value of a JSONURL/ASSETURL is null', async () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    const dataFromChain: DecodeDataOutput[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        // @ts-ignore
        value: null,
      },
    ];

    expect(async () => {
      await getDataFromExternalSources(
        schemas,
        dataFromChain,
        IPFS_GATEWAY_MOCK,
      );
    }).to.not.throw();
  });

  it("should return the right data when the schema's valueContent is VerifiableURI", async () => {
    const schema: ERC725JSONSchema = {
      name: 'LSP3Profile',
      key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'VerifiableURI',
    };

    const dataFromChain: DecodeDataOutput[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: {
          verification: {
            data: '0xdb864ed42104cee179785036cb4ff1183ebc57e5532ae766ad8533fa48acfbb3',
            method: 'keccak256(utf8)',
          },
          url: 'ipfs://QmdMGUxuQsm1U9Qs8oJSn5PfY4B1apGG75YBRxQPybtRVm',
        },
      },
    ];

    const result = await getDataFromExternalSources(
      [schema],
      dataFromChain,
      'https://api.universalprofile.cloud/ipfs/',
    );

    expect(result).to.deep.equal([
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: {
          LSP3Profile: {
            name: 'test',
            description: '',
            tags: ['profile'],
            links: [],
            profileImage: [
              {
                width: 1024,
                height: 709,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x6a0a28680d65b69f5696859be7e0fcebbbcf0df47f1f767926de35402c7d525c',
                },
                url: 'ipfs://QmVUYyft3j2JVrG4RzDe1Qx7K5gNtJGFhrExHQFeiRXz1C',
              },
              {
                width: 640,
                height: 443,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x7cd399f2a2552aa5cd21b1584a98db3efa39c701c311c38a60c680343cfa6d82',
                },
                url: 'ipfs://QmeU8FUZC9F1qMYmcWyBhfGqaf7g3kLzGb4xBpoCfyVLZW',
              },
              {
                width: 320,
                height: 221,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x272d2e57ae1710ac7c5e3d1c9f9d24f48954ad43d0e821f8bd041a4734e309a5',
                },
                url: 'ipfs://QmdViKPWYhZv7u86z7HBTgAkTAwEkNSRi1VkYEU8K5yUsH',
              },
              {
                width: 180,
                height: 124,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x1a464ff7e0eff05da98ed309a25195d8666b6211a5dfa2214865c3fd50ead810',
                },
                url: 'ipfs://QmXZUCW6MqCNfYJEFsi54Vkj6PRrUoiPjzTuA2mWtas3RJ',
              },
            ],
            backgroundImage: [
              {
                width: 1800,
                height: 1012,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x3f6be73b35d348fb8f0b87a47d8c8b6b9db8858ee044cb13734cdfe5d28031d8',
                },
                url: 'ipfs://QmfLCPmL31f31RRB4R7yoTg3Hsk5PjrWyS3ZaaYyhRPT4n',
              },
              {
                width: 1024,
                height: 576,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0xcb57ed802bcd7dc4964395a609b3a0f557c5f46a602b28b058b9587bb77bb54f',
                },
                url: 'ipfs://QmPoPEaoGNVYhiMTwBWp6XzLPRXyuLjZWnuMobdCbfqsU9',
              },
              {
                width: 640,
                height: 360,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x57e8039288c3e1a7f891c839e03805984ab36524b710656f072492c1c8ebd967',
                },
                url: 'ipfs://QmU3pDA4eDNPMeARsJXxKaZsMC5MgFLgzGQccnydbU9WLV',
              },
              {
                width: 320,
                height: 180,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x2bebf9baac33d719bbd3b481b1af468701409ad7578f84be04e8f7563d5a1509',
                },
                url: 'ipfs://QmcKtenPsRvrqZJQ1gLCdUFkex4i9DGp7RFvucb9nbkzsz',
              },
              {
                width: 180,
                height: 101,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0xe32154c03c892d7c41c91220b8757ec5b7847eb2dd91413f7238b0c25f55b475',
                },
                url: 'ipfs://QmU7ueJ467E9HRahaqQmSPhvkTkMhCLXRxV45P4kmMk6vm',
              },
            ],
          },
        },
      },
    ]);
  });
});
