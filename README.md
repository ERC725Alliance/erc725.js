# ERC725.js

This library allows for interfacing with ERC725 ccompliant contracts instances or chain based datastores on Ethereum type blockchains supporting the EVM.

**This package is currently in early stages of development, use only for testing or experimentation purposes**

## Installation

npm
```shell script
$ npm install erc725.js
```

## Usage

```js
import ERC725 from `erc725.js`

new ERC725(schema, address, provider)
```

`schema` is a ERC725 compliant schema (see below), or refer to [https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)

`provider` is one of either a Web3 provider, or a ethereumProvider EIP 1193, or a ERC725 compliant **subgraph**
<!-- TODO: Show more examples & links for the providers -->
 
 `address` - `address` is the EVM compatible contract address for the ERC725 instance 

## Examples

Examples for usage of the library


### Schema

*Example schema from Lukso universal profile*

```js
const schema = [
    {
        "name": "LSP3Name",
        "key": "0xf9e26448acc9f20625c059a95279675b8f58ba4f06d262f83a32b4dd35dee019",
        "keyType": "Singleton",
        "valueContent": "String",
        "valueType": "string"
    },
    {
        "name": "LSP3Links",
        "key": "0xb95a64d66e66f5c0cd985e2c3cc93fbea7f9259eadbe81c3ab0ff4e68df564d6",
        "keyType": "Singleton",
        "valueContent": "URI",
        "valueType": "string"
    },
    {
        "name": "LSP3IssuedAssets[]",
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

### New Instance

**With Web3Provider**

```js
const schema = [{...}]
const provider = new Web3(...)
const erc725 = new ERC725(schema, '0x09098...',provider)
```

Creates a new instance of the ERC725 class with associated address, schema, and provider. Providing connection to the data source through the provider for querying data in the contract instance.

### getData
```js
const keyData = erc725.getData('LSP3Name[, schema])
> 'coolUserName'
```

**Parameters**

`key` - `string`: They name or the hash of the key name as defined in the schema
`schema` - `Object`(optinal): An optional custom schema to find and decode the returned value against against. 

This will return the decoded value as defined by the associated schema key at the instance of the ERC725 associated contract

**Returns**

`Object`: Returns the object with the name of the key, and the resulting data

    <keyName>:value


### getAllData

```js
const allData = erc725.getAllData()
> [{key:value},{key2:value2}...]
```

Returns all key value pairs from the ERC725 instance as defined in the schema attached to the class instance, requires and accepts no parametrs

**Returns**
`Array`: An array of objects of key value pairs

```js
const provider = new Web3(/*web3 provider*/)
const erc725 = new ERC725(schema,address,provider)
```



