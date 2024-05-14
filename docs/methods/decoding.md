# Decoding functions

## decodeData

```js
myErc725.decodeData(data [, schemas]);
```

```js
ERC725.decodeData(data, schemas);
```

If you are reading the key-value store from an ERC725 smart contract you can use the `decodeData` function to do the decoding for you.

:::tip
If you want total convenience, it is recommended to use the [`fetchData`](ERC725.md#fetchdata) function, which automatically `decodes` and `fetches` external references.
:::

#### Parameters

##### 1. `data` - Object or array of Objects

An object or array of objects containing the following properties:

| Name                         | Type                           | Description                                                                                                                                                      |
| :--------------------------- | :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyName`                    | string                         | Can be either the named key (i.e. `LSP3Profile`, `LSP12IssuedAssetsMap:<address>`) or the hashed key (with or without `0x` prefix, i.e. `0x5ef...` or `5ef...`). |
| `dynamicKeyParts` (optional) | string or <br/> string[&nbsp;] | If `keyName` is a dynamic key, the dynamic parts of the `keyName` that will be used for encoding the key.                                                        |
| `value`                      | string or <br/> string[&nbsp;] | The value that should be decoded. Can be a string, an array of string, or a JSON.                                                                                |

The `keyName` also supports dynamic keys for [`Mapping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping) and [`MappingWithGrouping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping). Therefore, you can use variables in the key name such as `LSP12IssuedAssetsMap:<address>`. In that case, the value should also set the `dynamicKeyParts` property:

- `dynamicKeyParts`: string or string[&nbsp;] which holds the variables that needs to be encoded.

##### 2. `schemas` - Array of Objects (optional)

An array of extra [LSP-2 ERC725YJSONSchema] objects that can be used to find the schema. If called on an instance, the parameter is optional and will be concatenated with the schema provided on instantiation.

#### Returns

| Name          | Type            | Description                                                        |
| :------------ | :-------------- | :----------------------------------------------------------------- |
| `decodedData` | Object or Array | The decoded data as defined and expected in the following schemas. |

:::info

- If the input is an array of objects, the values will be returned in an array.
- If the input is a single object, the output will be the decodedData object directly.

:::

### Single-Key Example

```javascript title="Decoding an object with one key"
myErc725.decodeData([
  {
    keyName: 'LSP3Profile',
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
  },
]);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361'
      },
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
]
*/

myErc725.decodeData({
  keyName: 'LSP3Profile',
  value:
    '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
});
/**
{
  name: 'LSP3Profile',
  key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  value: {
    verification: {
      method: 'keccak256(utf8)',
      data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361'
    },
    url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
}
*/
```

### Multi-Key Example

```javascript title="Decoding an object with multiple keys"
myErc725.decodeData([
  {
    keyName: 'LSP3Profile',
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
  },
  {
    keyName: 'LSP12IssuedAssets[]',
    value: [
      {
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        value: '0x00000000000000000000000000000002',
      },
      {
        key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
        value: '0xd94353d9b005b3c0a9da169b768a31c57844e490',
      },
      {
        key: '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
        value: '0xdaea594e385fc724449e3118b2db7e86dfba1826',
      },
    ],
  },
]);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
        method: 'keccak256(utf8)'
      },
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    value: [
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
    ],
  },
];
*/
```

### Dynamic-Key Example

```javascript title="Decoding an object with dynamic key and a custom schema"
const schemas = [
  {
    name: 'MyKeyName:<bytes32>:<bool>',
    key: '0x...',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

myErc725.decodeData(
  [
    {
      keyName: 'MyKeyName:<bytes32>:<bool>',
      dynamicKeyParts: [
        '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
        'true',
      ],
      value:
        '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    },
  ],
  schemas,
);
/**
[
  {
    name: 'MyKeyName:aaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa:true',
    key: '0x35e6950bc8d2aaaabbbb00000000000000000000000000000000000000000001',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361'
      },
      url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
];
*/
```

---

## decodeValueType

```js
myErc725.decodeValueType(type, data);
```

```js
ERC725.decodeValueType(type, data);
```

Decode some data according to a provided value type.

#### Parameters

| Name   | Type   | Description                                                                   |
| :----- | :----- | :---------------------------------------------------------------------------- |
| `type` | string | The value type to decode the data (i.e. `uint256`, `bool`, `bytes4`, etc...). |
| `data` | string | A hex encoded string starting with `0x` to decode                             |

#### Returns

| Name           | Type                   | Description                          |
| :------------- | :--------------------- | :----------------------------------- |
| `decodedValue` | string or <br/> number | A value decoded according to `type`. |

#### Examples

```javascript
myErc725.decodeValueType('uint128', '0x0000000000000000000000000000000a');
// 10

myErc725.decodeValueType('bool', '0x01');
// true

myErc725.decodeValueType('string', '0x48656c6c6f21');
// 'Hello!';

// also available for ABI encoded array + CompactBytesArray
myErc725.decodeValueType(
  'uint256[]',
  '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001e',
);
// [ 10, 20, 30 ]

myErc725.decodeValueType(
  'uint256[CompactBytesArray]'',
  '0x0020000000000000000000000000000000000000000000000000000000000000000500200000000000000000000000000000000000000000000000000000000000000008'
)
// [ 5, 8 ]
```

This method is also available as a static method:

```js
ERC725.decodeValueType(
  'uint256',
  '0x000000000000000000000000000000000000000000000000000000000000002a',
);
// 42
```

---

## decodeValueContent

```js
const erc725js = new ERC725();

erc725js.decodeValueContent(valueContent, value);
```

OR

```js
ERC725.decodeValueContent(valueContent, value);
```

OR

```js
import { decodeValueContent } from '@erc725/erc725.js';

decodeValueContent(valueContent, value);
```

Decode a hex encoded value and return it as if it was interpreted as a `valueContent`.

Available `valueContent` are:

- `Address` (checksummed)
- `AssetURL` (deprecated)
- `Boolean`
- `BytesN`
- `JSONURL` (deprecated)
- `Keccak256`
- `Markdown` (similar to `String`)
- `Number`
- `String`
- `URL`
- `VerifiableURI`
- Any Hex `Literal` (e.g.: 0x1345ABCD...)

#### Parameters

| Name           | Type     | Description                                                        |
| :------------- | :------- | :----------------------------------------------------------------- |
| `valueContent` | `string` | One of the value content options defined by the LSP2 standard.     |
| `value`        | `string` | A hex encoded string starting with `0x` to decode as `valueContent |

#### Returns

| Name           | Type                                                                                     | Description                                  |
| :------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------- |
| `decodedValue` | `string` or <br/> `URLDataWithHash` or <br/> `number` or <br/> `boolean` or <br/> `null` | A value decoded according to `valueContent`. |

### Examples

```javascript title="decodeValueContent example"
erc725js.decodeValueContent(
  'VerifiableURI',
  '0x00006f357c6a0020027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168687474703a2f2f746573742e636f6d2f61737365742e676c62',
);
// {
//      verification: {
//          method: SUPPORTED_VERIFICATION_METHOD_STRINGS.KECCAK256_UTF8,
//          data: '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168',
//      },
//      url: 'http://test.com/asset.glb',
// }

erc725js.decodeValueContent('String', '0x232068656c6c6f');
// # hello

erc725js.decodeValueContent('String', '0x68656c6c6f');
// hello

// `Address` will be checksummed
erc725js.decodeValueContent(
  'Address',
  '0xa29afb8f3cce086b3992621324e9d7c104f03d1b',
);
// 0xa29Afb8F3ccE086B3992621324E9d7c104F03D1B

erc725js.decodeValueContent(
  'Number',
  '0x000000000000000000000000000000000000000000000000000000000000000a',
);
// 10

erc725js.decodeValueContent(
  'Number',
  '0x000000000000000000000000000000000000000000000000000000000000036c',
);
// 876

erc725js.decodeValueContent('Boolean', '0x01');
// true

erc725js.decodeValueContent('Boolean', '0x00');
// false
```

---

## decodeMappingKey

```js
ERC725.decodeMappingKey(keyNameOrSchema, keyHash);
```

Decode the values of the dynamic parts of a hashed key used on an [ERC725Y contract](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md#erc725y) according to the [LSP2 ERC725Y JSON Schema Standard](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md).

:::info

`decodeMappingKey` is available as either a static or non-static method, so it can be called without instantiating an ERC725 object.

:::

#### Parameters

##### 1. `keyHash` - String

The bytes32 key hash that needs to be decoded

##### 2. `keyNameOrSchema` - String or ERC725JSONSchema

The key name or erc725y json schema associated to the key hash to decode, for instance: `MySuperKey:<address>`.

#### Returns

| Name              | Type                                                   | Description                                      |
| :---------------- | :----------------------------------------------------- | :----------------------------------------------- |
| `dynamicKeyParts` | \{type: string, value: string OR number OR boolean\}[] | The dynamic key parts decoded from the key hash. |

#### Example

```javascript title="Decode the mapping key"
ERC725.decodeMappingKey(
  '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
  'MyKeyName:<address>',
);
// Decoding will checksum addresses
// [{
//   type: 'address',
//   value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe'
// }]

ERC725.decodeMappingKey(
  '0x35e6950bc8d21a1699e5000000000000000000000000000000000000f342d33d',
  'MyKeyName:<uint32>',
);
// [{ type: 'uint32', value: 4081242941 }]

ERC725.decodeMappingKey(
  '0x35e6950bc8d21a1699e5000000000000000000000000000000000000abcd1234',
  'MyKeyName:<bytes4>',
);
// [{ type: 'bytes4', value: 'abcd1234' }]

ERC725.decodeMappingKey(
  '0x35e6950bc8d21a1699e50000aaaabbbbccccddddeeeeffff1111222233334444',
  'MyKeyName:<bytes32>',
);
// [{
//   type: 'bytes32',
//   value: 'aaaabbbbccccddddeeeeffff1111222233334444'
// }]

ERC725.decodeMappingKey(
  '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000001',
  'MyKeyName:<bool>',
);
// [{ type: 'bool', value: true }]

ERC725.decodeMappingKey(
  '0x35e6950bc8d20000ffff000000000000000000000000000000000000f342d33d',
  'MyKeyName:<bytes2>:<uint32>',
);
// [
//   { type: 'bytes2', value: 'ffff' },
//   { type: 'uint32', value: 4081242941 }
// ]

// This method is also available on the instance:
myErc725.decodeMappingKey(
  '0x35e6950bc8d20000ffff000000000000000000000000000000000000f342d33d',
  'MyKeyName:<bytes2>:<uint32>',
);
```

---
