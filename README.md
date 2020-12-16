# ERC725.js

This library allows for interfacing with ERC725(Y) compliant contract instances on Ethereum type blockchains supporting the EVM.

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
let myERC725 = new ERC725(schema[, address, provider])

// change options
myERC725.options.ipfsGateway = 'https://ipfs.infura-ipfs.io/ipfs/' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
myERC725.options.schema // change schema
myERC725.options.address // change address
myERC725.options.provider // change the provider
```

**Parameters**

1. `schema` - `Array`: An array of objects of schema definitions compliant with [ERC725Y JSON Schema specifications](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md).

1. `address` - `String`: (optional) The ERC725 contract address 

2. `provider` - `Object`: (optional) One of either a Web3 provider, an EIP 1193 compliant Ethereum provider, or a ERC725 compliant graphQL service. The library will attempt to automatically detect the provider type, but can also handle an object of a `{provider: <Object>, type: <String>` to avoid issues with code minification or uglification. If the provider is omitted the, instance will not be able to fetch blockchain data, but will be available for all utility encoding and decoding functions.

Currently tested and supported providers include: 
* Web3: `web3.currentProvider`
* Ethereum provider (Metamask): `window.ethereum`
* ApploClient graphQL client: `ApolloClient` (experimental)

**Examples**

```js
// The LSP3-UniversalProfile Schema
// https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
const schema = [
    {
        "name": "SupportedStandards:ERC725Account",
        "key": "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
        "keyType": "Mapping",
        "valueContent": "0xafdeb5d6",
        "valueType": "bytes"
    },
    {
        "name": "LSP3Profile",
        "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
        "keyType": "Singleton",
        "valueContent": "JSONURL",
        "valueType": "bytes"
    },
    {
        "name": "LSP1UniversalReceiverDelegate",
        "key": "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
        "keyType": "Singleton",
        "valueContent": "Address",
        "valueType": "address"
    },
    {
        "name": "LSP3IssuedAssets[]",
        "key": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
        "keyType": "Array",
        "valueContent": "Number",
        "valueType": "uint256",
        "elementValueContent": "Address",
        "elementValueType": "address"
    }
]

// The contract address
const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'

```

**Creating a provider object**

*With Web3 Provider*
```js
import Web3 from 'web3'

const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.l14.lukso.network"))

const erc725 = new ERC725(schema, address, web3.currentProvider)
```

*With Ethereum/Metamask Provider*
```js
const erc725 = new ERC725(schema, address, window.ethereum)
```

*With Graph Provider*
```js
import { ApolloClient, InMemoryCache } from '@apollo/client';

const graphProvider = new ApolloClient({
  uri: 'http://183.23.0.2:8000/subgraphs/name/lukso/LS14', // Example only
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors'
  }
})

const erc725 = new ERC725(schema, '0x0adf8ce0fe...', { provider:graphProvider, type: 'ApolloClient' })
```

**Create a new instance of the ERC725 class with associated schema, contract address, and provider.**

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

### getOwner

```js
erc725.getOwner([address])
```

Returns the owner address for the ERC725(Y) compliant contract (as per [ERC173](https://eips.ethereum.org/EIPS/eip-173))).

**Parameters**

1. `address` - `String`: (optional), Address to fetch the owner of another ER725n smart contract, otherwise it uses `this.options.address`


**Returns**

`Address`: An Ethereum address.

**Example**
```js
const owner = erc725.getOwner()

> '0x28D25E70819140daF65b724158D00c373D1a18ee'
```


### getData
```js
erc725.getData(schemaKey [, schemaElement])
```

**Parameters**

1. `schemaKey` - `String`: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

1. `schemaElement` - `Object`: (optional) An optional custom schema element to use for decoding the returned value. Overrides attached schema of instance on this call only.

**Returns**

`Mixed`: Returns the decoded value as expected by the schema.

**Example**

```js
erc725.getData('SupportedStandards:ERC725Account')

> '0xafdeb5d6'


erc725.getData('LSP3Profile')

> {
    url: 'ipfs://QmXybv2LdJWscy1C6yRKUjvnaj6aqKktZX4g4xmz2nyYj2',
    hash: '0xb4f9d72e83bbe7e250ed9ec80332c493b7b3d73e0d72f7b2c7ab01c39216eb1a',
    hashFunction: 'keccak256(utf8)'
}
```


### getAllData

```js
erc725.getAllData()
```

Returns all available data from the ERC725 contract as defined in class's schema.

**Returns**

`Object`: An object with schema element key names as members, with the associated decoded data.

**Example**

```js
erc725.getAllData()

> {
    "SupportedStandards:ERC725Account": "0xafdeb5d6",
    "LSP3Profile": '{
        url: 'ipfs://QmXybv2LdJWscy1C6yRKUjvnaj6aqKktZX4g4xmz2nyYj2',
        hash: '0xb4f9d72e83bbe7e250ed9ec80332c493b7b3d73e0d72f7b2c7ab01c39216eb1a',
        hashFunction: 'keccak256(utf8)'
    },
    "LSP1UniversalReceiverDelegate": "0xF42227dd9E12B11C003de32D5241822Ec47f3674",
    "LSP3IssuedAssets[]": ['0x2309f...','0x0fe09...', ...]
}
```


### fetchData
```js
erc725.fetchData(schemaKey [, schemaElement])

// you could change the ipfsGateway
erc725.options.ipfsGateway = 'https://ipfs.infura-ipfs.io/ipfs/'
```

**Parameters**

1. `schemaKey` - `String`: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

1. `schemaElement` - `Object`: (optional) An optional custom schema element to use for decoding the returned value. Overrides attached schema of instance on this call only.

**Returns**

`Mixed`: Returns the fetched and decoded value, if valueContent is `JSONURL`, or `AssetURL`, otherwise works like `getData(key)`.
Throws if hashes of fetched data is not matching.

**Example**

```js
erc725.fetchData('LSP3Profile')

> {
    LSP3Profile: {
        name: 'frozeman',
        description: 'The inventor of ERC725 and ERC20...',
        links: [
            { title: 'Twitter', url: 'https://twitter.com/feindura' },
            { title: 'lukso.network', url: 'https://lukso.network' }
        ],
        profileImage: [
            {
                width: 1024,
                height: 974,
                hashFunction: 'keccak256(bytes)',
                hash: '0xa9399df007997de92a820c6c2ec1cb2d3f5aa5fc1adf294157de563eba39bb6e',
                url: 'ifps://QmW4wM4r9yWeY1gUCtt7c6v3ve7Fzdg8CKvTS96NU9Uiwr'
            }
        ],
        backgroundImage: [
            {
                ...
            }
        ]
    }
}

erc725.fetchData('KeyWithAssetURL')

> Uint8Array([...])
```


## Utility Methods

These methods are available on the erc725 class instance wether or not a provider and contract address was provided.

### decodeData

```js
erc725.decodeData(schemaKey, data)
```

**Parameters**

1. `schemaKey` - `String`: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

1. `data` - `Mixed`: Either the single value to be decoded for 'Singleton' or 'Mapping' keyTypes, or an array of key/value (`[{key:'0x04f9u0weuf...',value:'0x0f3209fj...'}]` pairs if the schema `keyType` is 'Array'.

**Returns**

`Mixed`: Returns decoded data as defined and expected in the schema (single value for keyTypes 'Singleton' & 'Mapping', or an array of values keyType 'Array).

**Example**

```js
erc725.decodeData('UsernameKey', '0x6d792d636f6f6c2d757365726e616d65')

> 'my-cool-username'
```

### encodeData

```js
erc725.encodeData(schemaKey, data)
```

**Parameters**

1. `schemaKey` - `String`: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

1. `data` - `Mixed`:  Data structured according to the corresponding to the schema defition.

**Returns**

`Mixed`: Returns decoded data as defined and expected in the schema (single value for keyTypes 'Singleton' & 'Mapping', or an array of encoded key/value objects for keyType 'Array).

**Example**

```js
erc725.encodeData('Username', 'my-cool-username')

> '0x6d792d636f6f6c2d757365726e616d65'
```

*Example of how to replace a single item in an array*

```js
// get address array from profile
let myAssets = await erc725Account.getData('LSP3IssuedAssets[]');

// encode same address array, to get keys
let encodedAssets = erc725Account.encodeData('LSP3IssuedAssets[]', myAssets);

// returns you e.g.
// [
//   {key: "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0", value: "0x0000000000000000000000000000000000000000000000000000000000000001"}
//   {key: "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000", value: "0x109ddf325bda390617f43388287b86da2869a360"}
// ]

// find the index of the address
let index = _.findIndex(myAssets, (asset) => { return asset === assetAddressToReplace; });

await Account.methods.setData(
    encodedAssets[index + 1].key, // + 1 as encodedAssets[0] is the key for the array length 
    newAssetAddress // to remove set to "0x"
).send({...});
```


### decodeAllData

```js
erc725.decodeAllData(data)
```

**Parameters**

1. `data` - `Array`: An array of encoded key/value object pairs.

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

1. `data` - `Object`: An object of keys matching to corresponding to the schema element names, with associated data as per schema definition attached.

**Returns**

`Array`: An array of key/value pair objects.

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
