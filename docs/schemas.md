---
sidebar_position: 2
---

# Schemas

The `@erc725/erc725.js` library contains a range of standard [LSP ERC725 JSON schemas](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md).

Schemas allow erc725.js to know how to decode and encode data written in an [ERC725Y](https://eips.ethereum.org/EIPS/eip-725) smart contract.

_A quick reference for keys used in schema definitions can be seen below_

[Official Documentation](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md).

- `name`: An arbitrary name
- `key`: The sha3 hash of the name
- `keyType`: One of the supported erc725 keyTypes
- `valueType`: The type of the content data in store for decoding
- `valueContent`: The described content type for parsing

## Standard LSP Schemas

The most common schemas of [LUKSO Standard Proposals](https://github.com/lukso-network/LIPs/tree/main/LSPs) are available under the [`schemas/`](https://github.com/ERC725Alliance/erc725.js/tree/develop/schemas) folder.

Current provided LSPs are:

```
LSP1UniversalReceiverDelegate.json
LSP3ProfileMetadata.json
LSP4DigitalAssetLegacy.json
LSP4DigitalAsset.json
LSP5ReceivedAssets.json
LSP6KeyManager.json
LSP9Vault.json
LSP10ReceivedVaults.json
LSP12IssuedAssets.json
```

You can import them from:

```js
import LSP3 from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import LSP5 from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
// ...

// Later use them on instantiation
const myErc725Contract = new ERC725js(LSP3, address, web3.currentProvider);
```
