# erc725.js &middot; [![GitHub license](https://img.shields.io/badge/license-Apache-blue.svg)](./LICENSE) [![npm version](https://img.shields.io/npm/v/@erc725/erc725.js.svg?style=flat)](https://www.npmjs.com/package/@erc725/erc725.js)

<p align="center">
 <h2 align="center"><strong>@erc725/erc725.js</strong></h2>
 <p align="center">Allows for interfacing with <a href="https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md">ERC725Y</a> compliant contracts on an EVM blockchain.</p>
</p>

<p align="center">
  <a href="https://github.com/ERC725Alliance/erc725.js/actions">
    <img alt="Tests Passing" src="https://github.com/ERC725Alliance/erc725.js/actions/workflows/lint-test-build.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/ERC725Alliance/erc725.js">
    <img src="https://codecov.io/gh/ERC725Alliance/erc725.js/branch/main/graph/badge.svg" />
  </a>
  <a href="https://github.com/ERC725Alliance/erc725.js/issues">
    <img alt="Issues" src="https://img.shields.io/github/issues/ERC725Alliance/erc725.js?color=0088ff" />
  </a>
  <a href="https://github.com/ERC725Alliance/erc725.js/pulls">
    <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ERC725Alliance/erc725.js?color=0088ff" />
  </a>
</p>
<p align="center">For more information see <a href="https://docs.lukso.tech/tools/erc725js/getting-started">Documentation</a>.</p>

## Installation

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

```shell script
npm install @erc725/erc725.js
```

```js
import { ERC725 } from '@erc725/erc725.js';
// Or alternatively the default export
import ERC725 from '@erc725/erc725.js';
```

If you install it on the backend side, you may need to also install [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch).

## Example Instantiation

```js
import { ERC725 } from '@erc725/erc725.js';
import Web3 from 'web3';

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
const schema = [
  {
    name: 'SupportedStandards:LSP3UniversalProfile',
    key: '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
    keyType: 'Mapping',
    valueContent: '0xabe425d6',
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
  'https://rpc.l16.lukso.network',
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

await erc725.getData('SupportedStandards:LSP3UniversalProfile');
/* > {
  'SupportedStandards:LSP3UniversalProfile': '0xabe425d6'
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
