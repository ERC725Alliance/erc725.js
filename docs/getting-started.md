---
sidebar_position: 1
---

# Getting Started

:::caution
This package is currently in the early stages of development. Please use it for testing or experimentation purposes only.
:::

The `@erc725/erc725.js` package allows you to interact with the ERC-725 schemas easily.

- GitHub repo: https://github.com/ERC725Alliance/erc725.js
- NPM: https://www.npmjs.com/package/@erc725/erc725.js

## Installation

```bash
npm install @erc725/erc725.js
```

:::info

If you install it on the backend side, you may need to also install [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch).

:::

## Instantiation

You need to initialise the ERC725 object with a [schema](https://docs.lukso.tech/tools/erc725js/schemas), a contract address, and an RPC URL.

```js
const address = '0x0Dc07C77985fE31996Ed612F568eb441afe5768D';
const RPC_URL = 'https://rpc.testnet.lukso.network';
const config = {
  ipfsGateway: 'https://YOUR-IPFS-GATEWAY/ipfs/',
  gas: 20_000_000, // optional, default is 1_000_000
};
```

### TypeScript

> If you are using ES6 `import` statements in Node.js, make sure your file has a `.mjs` extension, or that your project is set up to support ES6 modules.

```ts
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
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

### JavaScript

```js
import { ERC725 } require('@erc725/erc725.js');

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
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

## Usage

```js
await erc725.getOwner();
// > '0x28D25E70819140daF65b724158D00c373D1a18ee'

await erc725.getData('SupportedStandards:LSP3Profile');
/**
{
  'SupportedStandards:LSP3Profile': '0x5ef83ad9'
}
*/

await erc725.getData(['LSP3Profile', 'SupportedStandards:LSP3Profile']);
/**
{
  LSP3Profile: {
    url: 'ipfs://QmXybv2LdJWscy1C6yRKUjvnaj6aqKktZX4g4xmz2nyYj2',
    verification: {
      data: '0xb4f9d72e83bbe7e250ed9ec80332c493b7b3d73e0d72f7b2c7ab01c39216eb1a',
      method: 'keccak256(utf8)'
    }
  },
  'SupportedStandards:LSP3Profile': '0x5ef83ad9'
}
*/

await erc725.fetchData('LSP3Profile'); // downloads and verifies the linked JSON
/**
{
  LSP3Profile: {
    LSP3Profile: {
        name: 'frozeman',
        description: 'The inventor of ERC725 and ERC20...',
        links: [
            { title: 'Twitter', url: 'https://twitter.com/feindura' },
            { title: 'lukso.network', url: 'https://lukso.network' }
        ],
        ...
    }
  }
}
*/
```

:::tip Try it out
You can run the code snippet within your browser using the corresponding [StackBlitz example](https://stackblitz.com/edit/erc725js-instantiation?devtoolsheight=66&file=index.js).

:::note
Whenever you can you should import `ERC725` via the named export. However currently we are also providing a default export.

```javascript
import ERC725 from 'erc725.js';
```

:::

After the instance has been created, it is still possible to change settings through the options property.

```javascript
myERC725.options.schema = '<schema>' // change schema
myERC725.options.address '<address>' // change address
myERC725.options.ipfsGateway = '<url>' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
myERC725.options.gas = 20_000_000 // change gas setting

// NOTE: ERC725.provider can not be changed
```
