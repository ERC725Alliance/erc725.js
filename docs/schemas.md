---
sidebar_position: 2
---

# Schemas

:::info 📄 Schema Specification

For more details on schemas, see the [**official specification** of the LSP2 ERC725 JSON schemas](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md) standard specification

:::

The ⚒️ [erc725.js](https://npmjs.com/package/@erc725/erc725.js) library works with [ERC725Y JSON schemas](../../standards/generic-standards/lsp2-json-schema). These schemas are JSON structures that tell developers and programs how to decode and encode 🗂️ [ERC725Y data keys](../../standards/lsp-background/erc725#erc725y-generic-data-keyvalue-store) from any [ERC725Y](https://eips.ethereum.org/EIPS/eip-725) smart contract.. You need to load the required schemas of the data keys you want to fetch when initializing the `ERC725` class.

The most common and standard schemas are [available](../../tools/erc725js/schemas.md) directly within the _erc725.js_ library. But you can also create and load your own ERC725Y JSON schemas if you want to use custom data keys.

_A quick reference for keys used in schema definitions can be seen below_

- `name`: An arbitrary name
- `key`: The sha3 hash of the name
- `keyType`: One of the supported erc725 keyTypes
- `valueType`: The type of the content data in store for decoding
- `valueContent`: The described content type for parsing

## Standard LSP Schemas

The most common schemas of [LUKSO Standard Proposals](https://github.com/lukso-network/LIPs/tree/main/LSPs) are available to import. These are typed automatically with the Typescript type `ERC725JSONSchema[]` for when instantiating `new ERC725(...)` from Typescript projects.

```ts
import {
  LSP1Schema,
  LSP3Schema,
  LSP4Schema,
  LSP4LegacySchema,
  LSP5Schema,
  LSP6Schema,
  LSP8Schema,
  LSP9Schema,
  LSP10Schema,
  LSP12Schema,
  LSP17Schema,
} from '@erc725/erc725.js/schemas';

const erc725js = new ERC725(LSP12Schema);
```

The raw JSON schemas are also available for import from the [`schemas/`](https://github.com/ERC725Alliance/erc725.js/tree/develop/schemas) folder.

Current provided LSPs JSON schemas are:

```
LSP1UniversalReceiverDelegate.json
LSP3ProfileMetadata.json
LSP4DigitalAssetLegacy.json
LSP4DigitalAsset.json
LSP5ReceivedAssets.json
LSP6KeyManager.json
LSP8IdentifiableDigitalAsset.json
LSP9Vault.json
LSP10ReceivedVaults.json
LSP12IssuedAssets.json
LSP17ContractExtension.json
```

You can import the raw JSON as follow:

```js
import LSP3 from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';
import LSP5 from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
// ...

// Later use them on instantiation
const myErc725Contract = new ERC725js(LSP3, address, web3.currentProvider);

// You can retrieve the current loaded schema via
myErc725Contract.options.schemas;
```
