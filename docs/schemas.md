---
sidebar_position: 1.2
---

# Schemas

The `@erc725/erc725.js` library contains a range standard [LSP ERC725 JSON schemas](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md).

Schemas allow erc725.js to know how to decode and encode data written in an [ERC725Y](https://eips.ethereum.org/EIPS/eip-725) smart contract.

_Quick reference for keys used in schema definitions below see_
[official
documentation](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md).

- `name`: An arbitrary name
- `key`: The sha3 hash of the name
- `keyType`: One of the supported erc725 keyTypes
- `valueContent`: The described content type for parsing
- `valueType`: The type of the content data in store for decoding

## Standard LSP Schemas

The most common schemas of [LUKSO Standard Proposals](https://github.com/lukso-network/LIPs/tree/main/LSPs) are available under the [`schemas/`](https://github.com/ERC725Alliance/erc725.js/tree/develop/schemas) folder.

Current provided LSPs are:

```
LSP1UniversalReceiverDelegate.json
LSP3UniversalProfileMetadata.json
LSP4DigitalAsset.json
LSP4DigitalAssetLegacy.json
LSP5ReceivedAssets.json
LSP6KeyManager.json
```

You can import them from:

```js
import LSP3 from '@erc725/erc725.js/schemas/LSP3UniversalProfile.json';
import LSP5 from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
// ...

// Later use them on instantiation
const myErc725Contract = new ERC725js(LSP3, address, web3.currentProvider);
```
