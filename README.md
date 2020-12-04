# ERC725.js

This library allows for interfacing with ERC725 compliant contracts instances on Ethereum type blockchains supporting the EVM.

**This package is currently in early stages of development, use only for testing or experimentation purposes**

## Installation

npm
```shell script
$ npm install erc725.js
```

## Usage

```js
import ERC725 from 'erc725.js'
```


## Instantiation

```js
new ERC725(schema[, address, provider])
```

**Parameters**

1. `schema` - `Array`: An array of objects of schema definitions compliant with [ERC725Y JSON Schema specifications](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md).

1. `address` - `String`: (optional) The ERC725(Y) contract address 

1. `provider` - `Object`: (optional) One of either a Web3 provider, or an EIP 1193 compliant Ethereum provider, or a ERC725 compliant graphQL service. The library will attempt to automatically detect the provider type, but can also handle an object of a `{provider: providerObj, type: 'Web3Provider | EthereumProvider | ApolloClient'` to avoid issues with code minification or uglification. If the provider is omitted the, instance will not be able to fetch blockchain data, but will be available for all utility encoding and decoding functions.

Currently tested and supported providers include: 
* Web3: `web3.currentProvider`
* Metamask Ethereum provider: `window.ethereum`
* ApploClient graphQL client: `ApolloClient`

**Examples**

*Example schema*

```js
const schema = [
    {
        "name": "Username",
        "key": "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
        "keyType": "Singleton",
        "valueContent": "String",
        "valueType": "string"
    },
    {
        "name": "Link",
        "key": "0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d",
        "keyType": "Singleton",
        "valueContent": "URL",
        "valueType": "string"
    },
    {
        "name": "IssuedAssets[]",
        "key": "0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e",
        "keyType": "Array",
        "valueContent": "ArrayLength",
        "valueType": "uint256",
        "elementValueContent": "Address",
        "elementValueType": "address"
    }
]

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'

```

**Create a provider object**

*With Web3 Provider*
```js
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.l14.lukso.network"));
erc725 = new ERC725(schema, profileId, { provider: web3.currentProvider, type: 'HttpProvider' })
```

*With Metamask Provider*
```js
erc725 = new ERC725(schema, '0x0adf8ce0fe...', { provider:window.ethereum, type:'EthereumProvider' })
```

*With Graph Provider*
```js
const graphProvider = new ApolloClient({
  uri: 'http://183.23.0.2:8000/subgraphs/name/lukso/LS14', // Example only
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors'
  }
})

erc725 = new ERC725(schema, '0x0adf8ce0fe...', { provider:graphProvider, type: 'ApolloClient' })
```

**Now create a new instance of the ERC725 class with associated schema, contract address, and provider.**

*With provider as described above*
```js
const erc725 = new ERC725(schema, address, web3.currentProvider)
```

*With No Provider (no network connection, only for utility methods)*
```js
const erc725 = new ERC725(schema)
```

## Methods

These methods are available on the erc725 class when instantiated with a contract address, and provider.

### getData
```js
erc725.getData(schemaKey [, schemaElement])
```

**Parameters**

1. `schemaKey` - `String`: The name or the key hash of the key name as defined in the schema.

1. `schemaElement` - `Object`: (optional) An optional custom schema element to use for decoding the returned value. Overrides attached schema of instance on this call only.

**Returns**

`Mixed`: Returns the decoded value as expected by the schema.

**Example**

```js
erc725.getData('Username')

> 'my-cool-username'
```


### getAllData

```js
erc725.getAllData()
```

Returns all key value pairs from the ERC725 contract as defined in the provided schema.

**Returns**

`Object`: An object with schema element key names as members, with the associated decoded data.

**Example**

```js
erc725.getAllData()

> { 'Username': 'my-cool-username', 'Description': 'A great description.', 'IssuedAssets[]': ['0x2309f...','0x0fe09...', ...] }
```

## Utility Methods

These methods are available on the erc725 class instance with or without a provider & contract address.

### decodeData

```js
erc725.decodeData(schemaKey, data)
```

**Parameters**

1. `schemaKey` - `String`: The name or the hash of the key name as defined in the schema on instatiation of the ERC725 class.

1. `data` - `Mixed`: Either an array of key/value (`[{key:'0x04f9u0weuf...',value:'0x0f3209fj...'}]` pairs if the schema `keyType` is 'Array', or the single value to be decoded for 'Singleton' or 'Mapping' keyTypes. 

**Returns**

`Mixed`: Result will be as defined in the schema.

**Example**

```js
erc725.decodeData('Username', '0x6d792d636f6f6c2d757365726e616d65')

> 'my-cool-username'
```

### encodeData

```js
erc725.encodeData(schemaKey, data)
```

**Parameters**

1. `schemaKey` - `String`: The name or the hash of the key name as defined in the schema on instatiation of the ERC725 class.

1. `data` - `Mixed`:  Data structured according to the corresponding to the schema defition.

**Returns**

`Mixed`: Result will be as defined and expected by the schema.

**Example**

```js
erc725.encodeData('Username', 'my-cool-username')

> '0x6d792d636f6f6c2d757365726e616d65'
```


### decodeAllData

```js
erc725.decodeAllData(data)
```

**Parameters**

1. `data` - `Array`: An array of key/value pairs, as epected to be returned from erc725 contract ABI.

**Returns**
`Object`: An object with keys matching the erc725 instance schema keys, with attached decoded data as expected by the schema.

**Example**

```js
erc725.decodeAllData([
    {key:'0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da', value:'0x6d792d636f6f6c2d757365726e616d65'},
    {key:'0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d', value:'0x41206772656174206465736372697074696f6e2e'},
    {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e', value:'0x00000...02'} // The length of the array
    {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000', value:'0x2309f...'} // The 0 element of the array
    {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000001', value:'0x0fe09...'} // The 1 element of the array
])

> {
    'Username':'my-cool-username',
    'Description': 'A great description.',
    'IssuedAssets[]': [
        '0x2309f...',
        '0x0fe09...'
    ]
}
```


### encodeAllData
```js
erc725.encodeAllData(data)
```
**Parameters**

1. `data` - `Object`: An object of keys corresponding to the schema key names, with associated data as per schema definition

**Returns**

`Array`: An array of key/value pairs, as epected to be returned from erc725 contract ABI.

**Example**

```js
erc725.encodeAllData({
    'Username':'my-cool-username',
    'Description': 'A great description.',
    'IssuedAssets[]': [
        '0x2309f...',
        '0x0fe09...'
    ]
})

> [
    {key:'0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da', value:'0x6d792d636f6f6c2d757365726e616d65'},
    {key:'0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d', value:'0x41206772656174206465736372697074696f6e2e'},
    {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e', value:'0x00000...02'} // The length of the array
    {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000', value:'0x2309f...'} // The element of the array at index 0
    {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000001', value:'0x0fe09...'} // The element of the array at index 1
]
```

### getOwner

```js
erc725.getOwner()
```

Returns the owner address for the ERC725 compliant contract (as per OpenZeppelin 'Ownable' standard) at the address supplied on instantiation (given that an address and provider be provided).

**Returns**

`Address`: An Ethereum address

**Example**
```js
const owner = erc725.getOwner()

> '0x30fc23....'
```

