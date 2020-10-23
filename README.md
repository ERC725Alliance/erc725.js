## erc725.js

Library to interact with ERC725 smart contracts

**This package is currently in early stages of development, please don't use just yet**

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


### Example Schema

```js
let schema = [
    {
        "name": "LSP2Name",
        "key": "0xf9e26448acc9f20625c059a95279675b8f58ba4f06d262f83a32b4dd35dee019",
        "keyType": "Singleton",
        "valueContent": "String",
        "valueType": "string"
    },
    {
        "name": "LSP2Links",
        "key": "0xb95a64d66e66f5c0cd985e2c3cc93fbea7f9259eadbe81c3ab0ff4e68df564d6",
        "keyType": "Singleton",
        "valueContent": "URI",
        "valueType": "string"
    },
    {
        "name": "LSP2IssuedAssets[]",
        "key": "0xb8c4a0b76ed8454e098b20a987a980e69abe3b1a88567ae5472af5f863f8c8f9",
        "keyType": "Array",
        "valueContent": "ArrayLength",
        "valueType": "uint256",
        "elementKey": "0xb8c4a0b76ed8454e098b20a987a980e6",
        "elementKeyType": "ArrayElement",
        "elementValueContent": "Address",
        "elementValueType": "address"
    }
]
```


