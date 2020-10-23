## erc725.js

Library to interact with ERC725 smart contracts

**This package is currently empty, please don't use just yet**

## Installation

### Node

```bash
npm install erc725.js
```


## Usage

```js
// in node.js
var ERC725 = require('erc725.js');
let provider = web3.currentProvider || ethereumProvider || graphQlApollo;
let ERC725YJsonSchema = {...} // see https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md

let universalprofile = new ERC725(ERC725YJsonSchema, address, provider);

universalprofile.getData('LSP2IssuedAssets[]')
> ['0x1234567...', '0x2345678...']

universalprofile.getData('LSPXassetURI')
> {
    hashFunction: 'keccak256',
    hash: '0x23456789...',
    uri: 'ipfs://Q3456789..'
}

universalprofile.getData('LSPXjsonURI')
> {
    myCustomJsonContent: '123456789',
    otherCoolProp: 'Wow'
} // this json hash has been verified

universalprofile.getData('LSP2Name')
> 'My Cool name'
```
