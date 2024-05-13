---
sidebar_position: 1
title: 'Encoding'
---

# Encoding utilities

## encodeData

```js
myErc725.encodeData(data [, schemas]);
```

```js
ERC725.encodeData(data, schemas);
```

Encode the data of a smart contract according to your `ERC725JSONSchema` so that you can store the information in smart contracts.

:::tip

When encoding JSON, it is possible to pass in the JSON object and the URL where it is available publicly. The JSON will be hashed with `keccak256`.

:::

:::info

When encoding some values using specific `string` or `bytesN` as `valueType`, if the data passed is a non-hex value, _erc725.js_ will convert the value
to its utf8-hex representation for you. For instance:

- If `valueType` is `string` and you provide a `number` as input.

_Example: input `42` --> will encode as `0x3432` (utf-8 hex code for `4` = `0x34`, for `2` = `0x32`)._

- If `valueType` is `bytes32` or `bytes4`, it will convert as follow:

_Example 1: input `week` encoded as `bytes4` --> will encode as `0x7765656b`._

_Example 2: input `1122334455` encoded as `bytes4` --> will encode as `0x42e576f7`._

:::

#### Parameters

##### 1. `data` - Array of Objects

An array of objects containing the following properties:

| Name                          | Type                                           | Description                                                                                                                                                      |
| :---------------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyName`                     | string                                         | Can be either the named key (i.e. `LSP3Profile`, `LSP12IssuedAssetsMap:<address>`) or the hashed key (with or without `0x` prefix, i.e. `0x5ef...` or `5ef...`). |
| `dynamicKeyParts` (optional)  | string or <br/> string[&nbsp;]                 | The dynamic parts of the `keyName` that will be used for encoding the key.                                                                                       |
| `value`                       | string or <br/> string[&nbsp;] <br/> JSON todo | The value that should be encoded. Can be a string, an array of string or a JSON...                                                                               |
| `startingIndex` (optional)    | number                                         | Starting index for `Array` types to encode a subset of elements. Defaults t `0`.                                                                                 |
| `totalArrayLength` (optional) | number                                         | Parameter for `Array` types, specifying the total length when encoding a subset of elements. Defaults to the number of elements in the `value` field.            |

The `keyName` also supports dynamic keys for [`Mapping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping) and [`MappingWithGrouping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping). Therefore, you can use variables in the key name such as `LSP12IssuedAssetsMap:<address>`. In that case, the value should also set the `dynamicKeyParts` property:

- `dynamicKeyParts`: string or string[&nbsp;] which holds the variables that needs to be encoded.

:::info Handling array subsets

The `totalArrayLength` parameter must be explicitly provided to ensure integrity when encoding subsets or modifying existing array elements. Its value specifies the total length of the array **after the operation is completed**, not just the size of the encoded subset.

**When to Use `totalArrayLength`**

- **Adding Elements:** When adding new elements to an array, `totalArrayLength` should equal the sum of the current array's length plus the number of new elements added.
- **Modifying Elements:** If modifying elements within an existing array without changing the total number of elements, `totalArrayLength` should match the previous length of the array.
- **Removing Elements:** In cases where elements are removed, `totalArrayLength` should reflect the number of elements left.

:::

:::caution Encoding array lengths

Please be careful when updating existing contract data. Incorrect usage of `startingIndex` and `totalArrayLength` can lead to improperly encoded data that changes the intended structure of the data field.

:::

##### 2. `schemas` - Array of Objects (optional)

An array of extra [LSP-2 ERC725YJSONSchema] objects that can be used to find the schema. If called on an instance, it is optional and it will be concatenated with the schema provided on instantiation.

#### Returns

| Name          | Type   | Description                                                                                                                                                                                                |
| :------------ | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encodedData` | Object | An object containing the encoded keys and values according to the [LSP2 ERC725Y JSON Schema](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md) of the data which was passed |

After the `data` is encoded, the object is ready to be stored in smart contracts.

#### Examples

<details>
    <summary>Encode a <code>VerifiableURI</code> with JSON and uploaded URL</summary>

```javascript title="Encode a VerifiableURI with JSON and uploaded URL"
myErc725.encodeData([
  {
    keyName: 'LSP3Profile',
    value: {
      json: profileJson,
      url: 'ipfs://QmQTqheBLZFnQUxu5RDs8tA9JtkxfZqMBcmGd9sukXxwRm',
    },
  },
]);
/**
{
  keys: ['0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'],
  values: ['0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1696670733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d'],
}
*/

// You can also use the hashed key (with or without 0x prefix)
myErc725.encodeData([
  {
    keyName:
      '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      json: profileJson,
      url: 'ipfs://QmQTqheBLZFnQUxu5RDs8tA9JtkxfZqMBcmGd9sukXxwRm',
    },
  },
]);
/**
{
  keys: ['0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'],
  values: ['0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1696670733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d'],
}
*/

myErc725.encodeData([
  {
    keyName: '5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      json: profileJson,
      url: 'ipfs://QmQTqheBLZFnQUxu5RDs8tA9JtkxfZqMBcmGd9sukXxwRm',
    },
  },
]);
/**
{
  keys: ['0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'],
  values: ['0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1696670733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d'],
}
*/
```

```javascript
myErc725.encodeData([
  {
    keyName: 'LSP1UniversalReceiverDelegate',
    value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
  },
]);
/**
{
  keys: ['0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47'],
  values: ['0x1183790f29be3cdfd0a102862fea1a4a30b3adab'],
}
*/
```

</details>

<details>
    <summary>Encode a <code>VerifiableURI</code> with hash function, hash and uploaded URL</summary>

```javascript title="Encode a VerifiableURI with hash function, hash and uploaded URL"
myErc725.encodeData([
  {
    keyName: 'LSP3Profile',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
      },
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
]);
/**
{
  keys: ['0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'],
  values: ['0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178'],
}
*/
```

</details>

<details>
    <summary>Encode dynamic keys</summary>

```javascript title="Encode dynamic keys"
const schemas = [
  {
    name: 'DynamicKey:<address>',
    key: '0x0fb367364e1852abc5f20000<address>',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: 'Address',
  },
];

myErc725.encodeData(
  [
    {
      keyName: 'DynamicKey:<address>',
      dynamicKeyParts: ['0xbedbedbedbedbedbedbedbedbedbedbedbedbedb'],
      value: '0xcafecafecafecafecafecafecafecafecafecafe',
    },
  ],
  schemas,
);
/**
{
  keys: ['0x0fb367364e1852abc5f20000bedbedbedbedbedbedbedbedbedbedbedbedbedb'],
  values: ['0xcafecafecafecafecafecafecafecafecafecafe]
}
*/

const schemas = [
  {
    name: 'DynamicKey:<bytes4>:<string>',
    key: '0xForDynamicKeysThisFieldIsIrrelevantAndWillBeOverwriten',
    keyType: 'Mapping',
    valueType: 'bytes',
    valueContent: 'Address',
  },
];

myErc725.encodeData(
  [
    {
      keyName: 'DynamicKey:<bytes4>:<string>',
      dynamicKeyParts: ['0x11223344', 'Summer'],
      value: '0xcafecafecafecafecafecafecafecafecafecafe',
    },
  ],
  schemas,
);
/**
{
  keys: ['0x0fb367364e1852abc5f2000078c964cd805233eb39f2db152340079088809725'],
  values: ['0xcafecafecafecafecafecafecafecafecafecafe']
}
*/
```

</details>

<details>
    <summary>Encode multiple keys at once</summary>

```javascript title="Encode multiple keys at once"
myErc725.encodeData([
  {
    keyName: 'LSP3Profile',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
      },
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
  {
    keyName: 'LSP12IssuedAssets[]',
    value: [
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
    ],
  },
  {
    keyName: 'LSP1UniversalReceiverDelegate',
    value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
  },
]);
/**
{
  keys: [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
    '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
    '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
  ],
  values: [
    '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    '0x00000000000000000000000000000002',
    '0xd94353d9b005b3c0a9da169b768a31c57844e490',
    '0xdaea594e385fc724449e3118b2db7e86dfba1826',
    '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
  ],
}
*/
```

</details>

<details>
    <summary>Encode array length</summary>

If the key is of type Array and you pass an integer as a value (for instance, the array length), it will be encoded accordingly.

```javascript title="Encode the length of an array"
myErc725.encodeData([
  {
    keyName: 'LSP3IssuedAssets[]',
    value: 5,
  },
]);
/**
{
  keys: [
    '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
  ],
  values: ['0x00000000000000000000000000000005'],
}
*/
```

</details>

<details>
    <summary>Encode a subset of array elements</summary>

```javascript title="Encode a subset of array elements"
const schemas = [
  {
    name: 'AddressPermissions[]',
    key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address',
  },
];

myErc725.encodeData(
  [
    {
      keyName: 'AddressPermissions[]',
      value: [
        '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
        '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
      ],
      totalArrayLength: 23,
      startingIndex: 21,
    },
  ],
  schemas,
);
/**
{
  keys: [
    '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000015', 
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000016',
  ],
  values: [
    '0x00000000000000000000000000000017',
    '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
    '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
  ],
}
*/
```

</details>

---

## encodeKeyName

```js
ERC725.encodeKeyName(keyName [, dynamicKeyParts]);
```

Hashes a key name for use on an [ERC725Y contract](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md#erc725y) according to the [LSP2 ERC725Y JSON Schema Standard](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md).

:::info

`encodeKeyName` is available as either a static or non-static method so can be called without instantiating an ERC725 object.

:::

#### Parameters

##### 1. `keyName` - String

The key name you want to encode, for instance: `LSP3Profile`.

##### 2. `dynamicKeyParts` - String or array of Strings (optional)

The variables used to encode the key name, if the key name is a dynamic (i.e.: `MyKey:<address>`...)

#### Returns

| Name             | Type   | Description                                  |
| :--------------- | :----- | :------------------------------------------- |
| `encodedKeyName` | string | The keccak256 hash of the provided key name. |

The hash must be retrievable from the ERC725Y contract via the [getData](#getdata) function.

#### Example

```javascript title="Encode the key name"
ERC725.encodeKeyName('LSP3Profile');
// '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'

ERC725.encodeKeyName('SupportedStandards:LSP3Profile');
// '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347'

ERC725.encodeKeyName(
  'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
);
// '0x4b80742de2bf82acb3630000cafecafecafecafecafecafecafecafecafecafe'

ERC725.encodeKeyName('MyKeyName:<bool>', 'true');
// '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000001'

ERC725.encodeKeyName('MyKeyName:<bytes2>:<uint32>', ['ffff', '4081242941']);
// 0x35e6950bc8d20000ffff000000000000000000000000000000000000f342d33d

ERC725.encodeKeyName('MyKeyName:<uint32>', ['4081242941']);
// 0x35e6950bc8d21a1699e5000000000000000000000000000000000000f342d33d

// This method is also available on the instance:
myErc725.encodeKeyName('LSP3Profile');
```

---

## encodeArrayKey (TBD)

```js
encodeArrayKey(key, index);
```

Some description of how to use the function

#### Parameters

| Name    | Type   | Description                                                        |
| :------ | :----- | :----------------------------------------------------------------- |
| `key`   | string | A 32 bytes data key to keep the first 16 bytes.                    |
| `index` | string | A number to use as Array index. Cannot be bigger than a `uint128`. |

#### Returns

| Name                     | Type                   | Description |
| :----------------------- | :--------------------- | :---------- |
| `encodedArrayKeyAtIndex` | string or <br/> number | ...         |

### Example

```js
// keccak256("MyTechnoMusicPlaylist[]")
encodeArrayKey(
  '0x64c971b93d1d5a28308c950eb1dc0d90f9a3c4d327e7d735703373a76ce53cf6',
  5,
);
// 0x64c971b93d1d5a28308c950eb1dc0d90000000000000000000000000000000005

// keccak256("MyTechnoMusicPlaylist[]")
encodeArrayKey(
  '0x64c971b93d1d5a28308c950eb1dc0d90f9a3c4d327e7d735703373a76ce53cf6',
  15,
);
// 0x64c971b93d1d5a28308c950eb1dc0d9000000000000000000000000000000000f
```

## encodeValueType

```js
myErc725.encodeValueType(type, value);
```

```js
ERC725.encodeValueType(type, value);
```

#### Parameters

| Name    | Type                                                                                                       | Description                                                                    |
| :------ | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `type`  | string                                                                                                     | The value type to encode the value (i.e. `uint256`, `bool`, `bytes4`, etc...). |
| `value` | string or <br/> string[&nbsp;] or <br/> number or <br/> number[&nbsp;] or <br/> boolean or <br/> boolean[] | The value that should be encoded as `type`                                     |

#### Returns

| Name               | Type   | Description                                              |
| :----------------- | :----- | :------------------------------------------------------- |
| `encodedValueType` | string | A hex string representing the `value` encoded as `type`. |

After the `value` is encoded, the hex string can be used to be stored inside the ERC725Y smart contract.

#### Examples

```javascript
myErc725.encodeValueType('uint256', 5);
// '0x0000000000000000000000000000000000000000000000000000000000000005'

myErc725.encodeValueType('bool', true);
// '0x01'

// the word `boolean` (Name of the Typescript type) is also available
myErc725.encodeValueType('boolean', true);
// '0x01'

// `bytesN` type will pad on the right if the value contains less than N bytes
myErc725.encodeValueType('bytes4', '0xcafe');
// '0xcafe0000'
myErc725.encodeValueType('bytes32', '0xcafe');
// '0xcafe000000000000000000000000000000000000000000000000000000000000'

// `bytesN` type will throw an error if the value contains more than N bytes
myERC725.encodeValueType('bytes4', '0xcafecafebeef');
// Error: Can't convert 0xcafecafebeef to bytes4. Too many bytes, expected at most 4 bytes, received 6.

// Can also be used to encode arrays as `CompactBytesArray`
myERC725.encodeValueType('uint256[CompactBytesArray]', [1, 2, 3]);
// '0x002000000000000000000000000000000000000000000000000000000000000000010020000000000000000000000000000000000000000000000000000000000000000200200000000000000000000000000000000000000000000000000000000000000003'

myERC725.encodeValueType('bytes[CompactBytesArray]', [
  '0xaaaaaaaa',
  '0xbbbbbbbbbbbbbbbbbb',
]);
// '0x0004aaaaaaaa0009bbbbbbbbbbbbbbbbbb'
```

This method is also available as a static method.

```javascript
ERC725.encodeValueType('string', 'Hello');
// '0x48656c6c6f'
```

---
