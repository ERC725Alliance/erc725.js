<p align="center">
 <h1 align="center"><strong>@erc725/erc725.js</strong></h1>
 <p align="center">Allows to read, encode and decode data from <a href="https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md">ERC725Y</a> compliant contracts using ERC725Y JSON schemas.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@erc725/erc725.js">
    <img alt="NPM version" src="https://img.shields.io/npm/v/@erc725/erc725.js.svg?style=flat" />
  </a>
  <a href="https://github.com/ERC725Alliance/erc725.js/actions">
    <img alt="Tests Passing" src="https://github.com/ERC725Alliance/erc725.js/actions/workflows/lint-test-build.yml/badge.svg" />
  </a>
</p>

<p align="center">
  <!-- <a href="https://codecov.io/gh/ERC725Alliance/erc725.js">
    <img src="https://codecov.io/gh/ERC725Alliance/erc725.js/branch/main/graph/badge.svg" />
  </a> -->
  <a href="https://github.com/ERC725Alliance/erc725.js/issues">
    <img alt="Issues" src="https://img.shields.io/github/issues/ERC725Alliance/erc725.js?color=0088ff" />
  </a>
  <a href="https://github.com/ERC725Alliance/erc725.js/pulls">
    <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/ERC725Alliance/erc725.js?color=0088ff" />
  </a>
</p>
<p align="center">For more information see the <a href="https://docs.lukso.tech/tools/erc725js/getting-started">Documentation</a>.</p>

## Installation

> If you install it on the backend side, you may need to also install [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch).

```shell script
npm install @erc725/erc725.js
```

```js
import { ERC725 } from '@erc725/erc725.js';
// Or alternatively the default export
import ERC725 from '@erc725/erc725.js';
```

## Instantiation

> If you are using ES6 `import` statements in Node.js, make sure your file has a `.mjs` extension, or that your project is set up to support ES6 modules.

You can initialize the ERC725 object with a [schema](https://docs.lukso.tech/tools/erc725js/schemas), a contract address, and an RPC URL.

```js
const address = '0x0Dc07C77985fE31996Ed612F568eb441afe5768D';
const RPC_URL = 'https://rpc.testnet.lukso.network';
const config = {
  ipfsGateway: 'https://YOUR-IPFS-GATEWAY/ipfs/',
  gas: 20_000_000, // optional, default is 1_000_000
};
```

<details>
  <summary>TypeScript</summary>

```ts
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';

// Part of LSP3-Profile-Metadata Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-Profile-Metadata.md
const schemas: ERC725JSONSchema[] = [
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: '0x5ef83ad9',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const erc725 = new ERC725(schemas, address, RPC_URL, config);
```

</details>

<details>
  <summary>Javascript</summary>

```js
const { ERC725 } = require('@erc725/erc725.js');

// Part of LSP3-Profile-Metadata Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-Profile-Metadata.md
const schemas = [
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: '0x5ef83ad9',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const erc725 = new ERC725(schemas, address, RPC_URL, config);
```

</details>

## Usage

> See the **Getting Started** pages for more examples on how to use _erc725.js_

```js
await myErc725.getOwner();
// > '0x28D25E70819140daF65b724158D00c373D1a18ee'

await myErc725.getData();
/**
[
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    value: '0x5ef83ad9',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0x50A02EF693fF6961A7F9178d1e53CC8BbE1DaD68',
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    value: [
      '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
      '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
      '0xB92a8DdA288638491AEE5C2a003D4CAbfa47aE3F',
      '0x1e52e7F1707dcda57dD33F003B2311652A465acA',
      '0x0BDA71aA980D37Ea56E8a3784E4c309101DAf3E4',
      '0xfDB4D9C299438B9839e9d04E34B9609C5b56600D',
      '0x081D3F0bff8ae2339cb65113822eEc1510704d5c',
      '0x55C98c6944B7497FaAf4db0386a1aD1E6efF526E',
      '0x90D1a1D68fa23AEEE991220703f1a1C3782e0b35',
      '0xdB5AB19792d9fB61c1Dff57810Fb7C6f839Af8ED'
    ],
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3'
      },
      url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
    },
  },
]
*/

await myErc725.fetchData();
/**
[
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    value: '0x5ef83ad9'
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: { LSP3Profile: [Object] }
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    value: [
      '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
      '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
      '0xB92a8DdA288638491AEE5C2a003D4CAbfa47aE3F',
      '0x1e52e7F1707dcda57dD33F003B2311652A465acA',
      '0x0BDA71aA980D37Ea56E8a3784E4c309101DAf3E4',
      '0xfDB4D9C299438B9839e9d04E34B9609C5b56600D',
      '0x081D3F0bff8ae2339cb65113822eEc1510704d5c',
      '0x55C98c6944B7497FaAf4db0386a1aD1E6efF526E',
      '0x90D1a1D68fa23AEEE991220703f1a1C3782e0b35',
      '0xdB5AB19792d9fB61c1Dff57810Fb7C6f839Af8ED'
    ]
  }
]
*/
```

For more information 👉 [check the docs](https://docs.lukso.tech/tools/erc725js/classes/ERC725).

## Contributing

Please check [CONTRIBUTING](./CONTRIBUTING.md).

## License

erc725.js is [Apache 2.0 licensed](./LICENSE).
