import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';

// this is needed because node does not support `fetch` out of the box
// cross-fetch is not needed in a browser environment
import 'cross-fetch';

const RPC_ENDPOINT = 'https://rpc.testnet.lukso.network';
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

export function getInstance() {
  const schema = [
    {
      name: 'SupportedStandards:LSP3Profile',
      key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
      keyType: 'Mapping',
      valueContent: '0x5ef83ad9',
      valueType: 'bytes',
    },
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
    {
      name: 'LSP3IssuedAssets[]',
      key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
      keyType: 'Array',
      valueContent: 'Address',
      valueType: 'address',
    },
  ];

  // const address = '0xbAB4d9fAaCCE0764d8663137aD14B2F9933C0Cb7';
  const address = '0x7b2C957209897bc4423162e57D8C3CA863DCfBCc';
  const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
  const config = {
    ipfsGateway: IPFS_GATEWAY,
  };

  return new ERC725(schema, address, provider, config);
}

export const profileJson = {
  LSP3Profile: {
    name: 'frozeman',
    links: [
      { title: 'Twitter', url: 'https://twitter.com/feindura' },
      { title: 'lukso.network', url: 'https://lukso.network' },
    ],
    description: 'The inventor fo ERC725 and ERC20.....',
    profileImage: [
      {
        width: 1800,
        height: 1712,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xfbcfcbbc86d886e862419361c48251d778884a90429d36c8d002559cbcb52972',
        },
        url: 'ipfs://QmNPh6hP5igFzPf4mPtKBa6Wttnmi3YNVMAptC7drzyeDB',
      },
      {
        width: 1024,
        height: 974,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xa9399df007997de92a820c6c2ec1cb2d3f5aa5fc1adf294157de563eba39bb6e',
        },
        url: 'ipfs://QmW4wM4r9yWeY1gUCtt7c6v3ve7Fzdg8CKvTS96NU9Uiwr',
      },
      {
        width: 640,
        height: 609,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xb316a695125cb0566da252266cfc9d5750a740bbdffa86712bb17508e70e6a31',
        },
        url: 'ipfs://QmXGELsqGidAHMwYRsEv6Z4emzMggtc5GXZYGFK7r6zFBg',
      },
      {
        width: 320,
        height: 304,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xd22a272ff5b257056cc302bcdcca1c0ea00bf912aef310eb3fa7556696b1e780',
        },
        url: 'ipfs://QmRr2urTVi12VzYa5cSHDjJXACfapaeGZW2BuNmQ8rHjCG',
      },
      {
        width: 180,
        height: 171,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xf80d0c1492de5e148392b3a724739682e9b9564ef5fb97c06c1574bbb5e5f340',
        },
        url: 'ipfs://QmVeFyhHtdXR34UZanqU2qSuBTfGtBraG7hhN5byjJNAY5',
      },
    ],
    backgroundImage: [
      {
        width: 1800,
        height: 1013,
        verification: {
          method: 'keccak256(bytes)',
          data: '0x98fe032f81c43426fbcfb21c780c879667a08e2a65e8ae38027d4d61cdfe6f55',
        },
        url: 'ipfs://QmPJESHbVkPtSaHntNVY5F6JDLW8v69M2d6khXEYGUMn7N',
      },
      {
        width: 1024,
        height: 576,
        verification: {
          method: 'keccak256(bytes)',
          data: '0xfce1c7436a77a009a97e48e4e10c92e89fd95fe1556fc5c62ecef57cea51aa37',
        },
        url: 'ipfs://QmZc9uMJxyUeUpuowJ7AD6MKoNTaWdVNcBj72iisRyM9Su',
      },
      {
        width: 640,
        height: 360,
        verification: {
          method: 'keccak256(bytes)',
          data: '0x10a5cf2479992f1c555ad71e0a2866827f66fef6941a0c99f8d3b03e6b8b4009',
        },
        url: 'ipfs://QmbP3eTmUx1UQ2eZ8hrDz8j98yP2CTmsJvfp72LZKnkKj1',
      },
    ],
    tags: ['public profile'],
  },
};
