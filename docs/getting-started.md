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

```js
import { ERC725 } from '@erc725/erc725.js';
import Web3 from 'web3';

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
const schemas = [
  {
    name: 'SupportedStandards:LSP3UniversalProfile',
    key: '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: '0xabe425d6',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'JSONURL',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l16.lukso.network',
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
};

const erc725 = new ERC725(schemas, address, provider, config);
```

## Usage

```js
await erc725.getOwner();
// > '0x28D25E70819140daF65b724158D00c373D1a18ee'

await erc725.getData('SupportedStandards:LSP3UniversalProfile');
/**
{
  'SupportedStandards:LSP3UniversalProfile': '0xabe425d6'
}
*/

await erc725.getData([
  'LSP3Profile',
  'SupportedStandards:LSP3UniversalProfile',
]);
/**
{
  LSP3Profile: {
    url: 'ipfs://QmXybv2LdJWscy1C6yRKUjvnaj6aqKktZX4g4xmz2nyYj2',
    hash: '0xb4f9d72e83bbe7e250ed9ec80332c493b7b3d73e0d72f7b2c7ab01c39216eb1a',
    hashFunction: 'keccak256(utf8)'
  },
  'SupportedStandards:LSP3UniversalProfile': '0xabe425d6'
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
You can run the code snippit within your browser using the corresponding [StackBlitz example](https://stackblitz.com/edit/erc725js-instantiation?devtoolsheight=66&file=index.js).

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

// NOTE: ERC725.provider can not be changed
```
