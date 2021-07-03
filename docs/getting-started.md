---
sidebar_position: 1.1
slug: "/"
---
# Getting Started

## Installation

```bash
  npm install erc725.js
```

## Instantiation
```js
import { ERC725 } from 'erc725.js';
import * as Web3 from "web3";

// Part of LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
const schema = [
  {
    name: "SupportedStandards:ERC725Account",
    key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
    keyType: "Mapping",
    valueContent: "0xafdeb5d6",
    valueType: "bytes",
  },
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
  {
    name: 'LSP3IssuedAssets[]',
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    keyType: 'Array',
    valueContent: 'Number',
    valueType: 'uint256',
    elementValueContent: 'Address',
    elementValueType: 'address'
  }
];

const address = "0x3000783905Cc7170cCCe49a4112Deda952DDBe24";
const provider = new Web3.providers.HttpProvider("https://rpc.l14.lukso.network");
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
};

const myERC725 = new ERC725(schema, address, provider, config)
```

:::tip Try it
https://stackblitz.com/edit/erc725js-instantiation?devtoolsheight=66&file=index.js
:::

:::note
Whenever you can you should import `ERC725` via the named export. However currently we are also providing a default export.
```javascript
  import ERC725 from 'erc725.js'
```
:::

Parameters descriptions:

* [ERC725Schema](./api/interfaces/erc725schema.md)
* [Providers](./providers.md)

After the instance has been created is is still possible to change settings through the options property.

```javascript 
    myERC725.options.schema = '<schema>' // change schema
    myERC725.options.address '<address>' // change address
    myERC725.options.config.ipfsGateway = '<url>' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
    
    // NOTE: ERC725.provider can not be changed
```