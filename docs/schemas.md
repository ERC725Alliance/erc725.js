---
sidebar_position: 1.2
---

# Schemas

The `@erc725/erc725.js` library supports a range of ERC725 specification schemas.

The below are the schema element definitions supported by and tested
with `@erc725/erc725.js`. There are certainly more possibilities, and even several
nonsensical or redundant possibilities which will not or may not be
supported.

_Quick reference for keys used in schema definitions below see_
[official
documentation](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md).

- `name`: An arbitrary name
- `key`: The sha3 hash of the name
- `keyType`: One of the supported erc725 keyTypes
- `valueContent`: The described content type for parsing
- `valueType`: The type of the content data in store for decoding

## LSP Schemas

The most common schemas from LUKSO [LSPs](https://github.com/lukso-network/LIPs/tree/main/LSPs) are available in the [`schemas/`](https://github.com/ERC725Alliance/erc725.js/tree/develop/schemas) folder.

You can import them from:

```js
import LSP3 from '@erc725/erc725.js/schemas/LSP3UniversalProfile.json';
import LSP5 from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json';
// ...
```
