# ERC725.js

This library allows for interfacing with ERC725 compliant contracts instances or chain based datastores on Ethereum type blockchains supporting the EVM.

**This package is currently in early stages of development, use only for testing or experimentation purposes**

## Installation

npm
```shell script
$ npm install erc725.js
```

## Usage

```js
import ERC725 from 'erc725.js'

const erc725 = new ERC725(schema, address, provider)

erc725.....
```




## Schema

*Example schema from a universal profile (LSP3)*

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
        "elementValueContent": "Address",
        "elementValueType": "address"
    }
]
```


## Instantiation

```js
import ERC725 from 'erc725.js'

const schema = [{...}]
const web3 = new Web3(...)

const erc725 = new ERC725(schema, '0x09098...', web3.currentProvider)
```

**Parameters**

- `schema`: a [ERC725Y JSON Schema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)

- `provider`: one of either a Web3 provider, or a ethereumProvider EIP 1193, or a ERC725 compliant **subgraph**
<!-- TODO: Show more examples & links for the providers -->

Currently tested and supported providers include: web3.currentProvider, Metamask's and 
 
 - `address`: the ERC725(Y) contract address 
 

Creates a new instance of the ERC725 class with associated address, schema, and provider.

## Methods

#### getData
```js
const keyData = erc725.getData(keyName [, schemaElement])
```

**Parameters**

`keyName` - `string`: The name or the hash of the key name as defined in the schema.

`schemaElement` - `Object`(optinal): An optional custom schema element to use for decoding the returned value.

This will return the decoded value as defined by the associated schema element from the ERC725 contract.

**Returns**

`Mixed`: Returns the decoded value.


### getAllData

```js
const allData = erc725.getAllData()
```

Returns all key value pairs from the ERC725 contract as defined in the provided schema.

**Returns**

`Array`: An array of objects with schema element keys and the decoded data.


## Utility Methods

These methods are made available for data encoding and decoding.

```js
// Direct import
import { utils } from `erc725.js`

// or
erc725.utils
```


### decodeKeyValue()

```js
erc725.utils.decodeKeyValue(schemaKeyOrElement, hexValue)
```

**Parameters**

`schemaKeyOrElement` - `string|Object`: An object containing keys and values as required and defined by the ER725 standards (see above).

`hexValue` - `String`: A string of hex bytes as expected to be returned form a ABI call to a contract instance.

**Returns**

`Mixed`: The decoded value.

**Example**

```js
erc725.utils.decodeKeyValue(
    // The schema definition
    {
      name: "LSP3Name",
      key: "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
      keyType: "Singleton",
      valueContent: "String",
      valueType: "string",
    },
    // The value to decode, returned as epected from smart contract
    '0x6d792d636f6f6c2d6e616d65'
)
>  'my-cool-name'
```


### encodeKeyValue()

```js
erc725.utils.encodeKeyValue(schemaKeyOrElement, value)
```

**Parameters**

`schemaKeyOrElement` - `string|Object`: An object containing keys and values as required and defined by the ER725 standards (see above).

`value` - `Mixed`: A value associated with type expected by the schema element definition.

**Returns**

`string`: Hex encoded bytes to be stored in a ERC725 contract (via `setData(bytes32, bytes)`)

**Example**

```js
erc725.utils.encodeKeyValue(
    // The schema definition
    {
      name: "Username",
      key: "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
      keyType: "Singleton",
      valueContent: "String",
      valueType: "string",
    },
    // the value to encode
    'my-cool-name'
)
> '0x6d792d636f6f6c2d6e616d65'
```



### decodeAllData()

This method will take an array of key/value pairs as would be expected to be returned from and ERC725 contract through and ABI using `web3.contract` (for instance).

```js
erc725.utils.decodeAllData(schema, data)
```

**Parameters**

`schema` - `Array`: An array of schema definition objects `[{name:'fieldName',key: '0x49fwe...'},...]` as described above.

`data` - `Array`: An array of {key,value} pairs. `[{key:'0x9df80s...',value:'some-value'},...]`, as would be expected to be returned form a ERC725 compliant smart contract through the contract ABI.

**Returns**

`Array`: Array of decoded data under and element key and arranged as described by the schema

**Example**

```js
erc725.decodeAllData(
    // Array of schema keys
    [
        {
            name: "Username",
            key: "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
            keyType: "Singleton",
            valueContent: "String",
            valueType: "string",
        },
        {
            name: "Description",
            key: "0xfc5327884a7fb1912dcdd0d78d7e6753f03e61a8e0b845a4b62f5efde472d0a8",
            keyType: "Singleton",
            valueContent: "URL",
            valueType: "string",
        }
    ],
    // Array of data to decode
    [
        {
            key: "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
            value: "0x6d792d636f6f6c2d6e616d65"
        },
        {
            key: "0xfc5327884a7fb1912dcdd0d78d7e6753f03e61a8e0b845a4b62f5efde472d0a8",
            value: "0x687474703a2f2f6d792d636f6f6c2d776562736974652e68746d6c"
        }
    ]
)

> { Username: 'my-cool-name', Description'http://my-cool-website.html' }

]
```


### encodeAllData()

```js
erc725.utils.encodeAllData(schema, data)
```

**Parameters**

`schema` - `Array`: An array of scheme definition elements (see above).

`data` - `Array`: An array of objects with element keys as assumed to be delivered from decoded blockchain data. Ie `[{schemaElement1Name: data...},{schemaElement2Name: data...}]`

**Returns**

`Array`: An array of key-value pairs with keys being the schema definition key, and the value being the encoded value of the data as per the schema definitions.

**Example**

```js
erc725.encodeAllData(
    [
        {
            name: "Username",
            key: "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
            keyType: "Singleton",
            valueContent: "String",
            valueType: "string",
        },
        {
            name: "Description",
            key: "0xfc5327884a7fb1912dcdd0d78d7e6753f03e61a8e0b845a4b62f5efde472d0a8",
            keyType: "Singleton",
            valueContent: "URL",
            valueType: "string",
        }
    ],
    {
        Username: 'my-cool-name',
        Description: 'http://my-cool-website.html
    }
)
> [
    {key: '0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da', value: '0x6d792d636f6f6c2d6e616d65' },
    {key: '0xfc5327884a7fb1912dcdd0d78d7e6753f03e61a8e0b845a4b62f5efde472d0a8', value: '0x687474703a2f2f6d792d636f6f6c2d776562736974652e68746d6c' }
  ]
```


