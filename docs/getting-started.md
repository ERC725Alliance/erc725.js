---
sidebar_position: 1
---

# Getting Started

:::caution
This package is currently in the early stages of development. Feel free to [report issues or feature requests](https://github.com/ERC725Alliance/erc725.js/issues) through the Github repository.
:::

<a href="https://github.com/ERC725Alliance/erc725.js" target="_blank" rel="noopener noreferrer"><img style={{verticalAlign: 'middle'}} alt="github badge" src="https://img.shields.io/github/v/release/ERC725Alliance/erc725.js?logo=github&label=Github"/></a>
<a href="https://www.npmjs.com/package/@erc725/erc725.js" target="_blank" rel="noopener noreferrer"><img style={{verticalAlign: 'middle'}} alt="npm badge" src="https://img.shields.io/npm/v/@erc725/erc725.js.svg?style=flat&label=NPM&logo=npm"/></a>

<br/><br/>

The `@erc725/erc725.js` package allows you to retrieve, encode and decode data easily from any ERC725Y smart contracts using ERC725Y JSON Schemas.

## Installation

:::info

If you install it on the backend side, you may need to also install [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch).

:::

```bash
npm install @erc725/erc725.js
```

## Usage

> If you are using ES6 `import` statements in Node.js, make sure your file has a `.mjs` extension, or that your project is set up to support ES6 modules.

There are 3 main ways to use _erc725.js_.

### Option 1: using with schema only

Create an instance of `ERC725` with just a [schema](https://docs.lukso.tech/tools/erc725js/schemas): **useful for just encoding / decoding data.**

```js
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

const schemas: ERC725JSONSchema[] = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

const erc725 = new ERC725(schemas);
```

### Option 2: connect a contract to fetch + decode data from

Same as option 1 where you can pass an ERC725Y contract address, an RPC URL and some additional confits (IPFS gateway): **useful to fetch and decode data automatically from a contract deployed on a network**.

```js
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js';

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
const address = '0x0Dc07C77985fE31996Ed612F568eb441afe5768D';
const RPC_URL = 'https://rpc.testnet.lukso.network';
const config = {
  ipfsGateway: 'https://YOUR-IPFS-GATEWAY/ipfs/',
  gas: 20_000_000, // optional, default is 1_000_000
};

const erc725 = new ERC725(schemas, address, RPC_URL, config);
```

### Option 3: use only specific functions

You can import only specific functions (or using static methods of the `ERC725` class): **useful when needing only specific functionalities for your dApp (_e.g:_ decoding `VerifiableURI`, encoding dynamic keys).**

```js
import {
  encodeValueType,
  encodeDataSourceWithHash,
  decodeDataSourceWithHash,
} from '@erc725/erc725.js';

const someNumber = encodeValueType('uint128', 3);
// 0x00000000000000000000000000000003

const reEncodedVerifiableURI = decodeDataSourceWithHash(
  '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
);
// verification: {
//     data: '820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
//     method: 'keccak256(utf8)',
//     source: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
//   },

const verifiableURI = encodeDataSourceWithHash(
  {
    method: 'keccak256(utf8)',
    data: '820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
  },
  'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
);
// 0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178
```

## Functionalities

:::tip Try it out
Try running the code snippets below within your browser using [StackBlitz](https://stackblitz.com/edit/erc725js-instantiation?devtoolsheight=66&file=index.js).
:::

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

After the `ERC725` instance has been created, it is still possible to change settings through the `options` property.

```javascript
myERC725.options.schema = '<schema>' // change schema
myERC725.options.address '<address>' // change address
myERC725.options.ipfsGateway = '<url>' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
myERC725.options.gas = 20_000_000 // change gas setting

// NOTE: ERC725.provider can not be changed
```
