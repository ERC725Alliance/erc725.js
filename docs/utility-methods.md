
## Utility Methods

These methods are made available for data encoding and decoding, utilizing the schema attached to the erc725 class instance.

```js
// Direct import
import { utils } from `erc725.js`

```


### decodeData()

```js
utils.decodeData(schemaKeyOrElement, hexValue)
```

**Parameters**

`schemaKeyOrElement` - `string|Object`: An object containing keys and values as required and defined by the ER725 standards (see above).

`hexValue` - `String`: A string of hex bytes as expected to be returned form a ABI call to a contract instance.

**Returns**

`Mixed`: The decoded value.

**Example**

```js
utils.decodeKeyValue(
    // The schema definition
    {
      name: "Username",
      key: "0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da",
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
