# erc725.js &middot; [![GitHub license](https://img.shields.io/github/license/ERC725Alliance/erc725.js)](./LICENSE) [![npm version](https://img.shields.io/npm/v/@erc725/erc725.js.svg?style=flat)](https://www.npmjs.com/package/@erc725/erc725.js) [![Codecov](https://codecov.io/gh/ERC725Alliance/erc725.js/branch/main/graph/badge.svg)](https://codecov.io/gh/ERC725Alliance/erc725.js) [![Tests](https://github.com/ERC725Alliance/erc725.js/actions/workflows/lint-test-build.yml/badge.svg)](https://github.com/ERC725Alliance/erc725.js/actions)

<p align="center">
 <h2 align="center"><strong>@erc725/erc725.js</strong></h2>
 <p align="center">Allows for interfacing with <a href="https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md">ERC725Y</a> compliant contracts on an EVM blockchain.</p>
</p>

<p align="center">For more information see <a href="https://docs.lukso.tech/tools/erc725js/getting-started">Documentation</a>.</p>

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## Installation

```shell script
npm install @erc725/erc725.js
```

```js
import { ERC725 } from '@erc725/erc725.js';
// Or alternatively the default export
import ERC725 from '@erc725/erc725.js';
```

## Example Instantiation

```js
import { ERC725 } from '@erc725/erc725.js';
import Web3 from 'web3';

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
const schema = [
  {
    name: 'SupportedStandards:ERC725Account',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
    keyType: 'Mapping',
    valueContent: '0xafdeb5d6',
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
];

const address = '0x3000783905Cc7170cCCe49a4112Deda952DDBe24';
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
};

const erc725 = new ERC725(schema, address, provider, config);
```

## Usage

```js
await erc725.getOwner();
// > '0x28D25E70819140daF65b724158D00c373D1a18ee'

await erc725.getData('SupportedStandards:ERC725Account');
/* > {
  'SupportedStandards:ERC725Account': '0xafdeb5d6'
}
*/

await erc725.getData('LSP3Profile');
/* > {
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
    url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
  }
}
*/

await erc725.fetchData('LSP3Profile'); // downloads and verifies the linked JSON
/* > {
  LSP3Profile: { // key of the schema
    LSP3Profile: { // content of the JSON structure as per https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
      name: '...',
      links: [Array],
      description: "...",
      profileImage: [Array],
      backgroundImage: [Array],
      tags: [Array]
    }
  }
}
*/
```

## Contributing

Please check [CONTRIBUTING](./CONTRIBUTING.md).

### License

erc725.js is [Apache 2.0 licensed](./LICENSE).
