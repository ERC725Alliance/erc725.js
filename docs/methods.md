---
sidebar_position: 1
title: 'Methods'
---

## Encoding

### encodeData

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

| Name                          | Type                                      | Description                                                                                                                                                      |
| :---------------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyName`                     | string                                    | Can be either the named key (i.e. `LSP3Profile`, `LSP12IssuedAssetsMap:<address>`) or the hashed key (with or without `0x` prefix, i.e. `0x5ef...` or `5ef...`). |
| `dynamicKeyParts` (optional)  | string or <br/> string[&nbsp;]            | The dynamic parts of the `keyName` that will be used for encoding the key.                                                                                       |
| `value`                       | string or <br/> string[&nbsp;] <br/> JSON | The value that should be encoded. Can be a string, an array of string or a JSON...                                                                               |
| `startingIndex` (optional)    | number                                    | Starting index for `Array` types to encode a subset of elements. Defaults to `0`.                                                                                |
| `totalArrayLength` (optional) | number                                    | Parameter for `Array` types, specifying the total length when encoding a subset of elements. Defaults to the number of elements in the `value` field.            |

The `keyName` also supports dynamic keys for [`Mapping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping) and [`MappingWithGrouping`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping). Therefore, you can use variables in the key name such as `LSP12IssuedAssetsMap:<address>`. In that case, the value should also set the `dynamicKeyParts` property:

- `dynamicKeyParts`: string or string[&nbsp;] which holds the variables that needs to be encoded.

:::info Handling keyType `Array`.

If the keyType is Array and you pass an integer as a value it will encode only the data key for the Array length. See the example below.

Additionally, the `totalArrayLength` parameter must be explicitly provided to ensure integrity when encoding subsets or modifying existing array elements. Its value specifies the total length of the array **after the operation is completed**, not just the size of the encoded subset.

**When to use `totalArrayLength`**

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
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

const myErc725 = new ERC725(schemas);

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
```

```javascript title="encode a Singleton data key of valueContent Address"
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const myErc725 = new ERC725(schemas);

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
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

const myErc725 = new ERC725(schemas);

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
import ERC725 from '@erc725/erc725.js';

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
    <summary>Encode multiple data keys at once</summary>

```javascript title="Encode multiple keys at once"
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueType: 'address',
    valueContent: 'Address',
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const myErc725 = new ERC725(schemas);

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
    keyName: 'LSP1UniversalReceiverDelegate',
    value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
  },
  {
    keyName: 'LSP12IssuedAssets[]',
    value: [
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
    ],
  },
]);
/**
{
  keys: [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5', // LSP3Profile -> data key
    '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47', // LSP1UniversalReceiverDelegate -> data key
    '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd', // LSP12IssuedAssets[] -> data key for `LSP12IssuedAssets[].length`
    '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000', // LSP12IssuedAssets[0] -> data key for index 0
    '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001', // LSP12IssuedAssets[1] -> data key for index 1
  ],
  values: [
    '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455 a4c6a7452504466573834554178', // LSP3Profile -> value as VerifiableURI
    '0x1183790f29be3cdfd0a102862fea1a4a30b3adab', // LSP1UniversalReceiverDelegate -> value as Address
    '0x00000000000000000000000000000002', // LSP12IssuedAssets[].length = 2
    '0xd94353d9b005b3c0a9da169b768a31c57844e490', // LSP12IssuedAssets[0] -> Address stored at index 0
    '0xdaea594e385fc724449e3118b2db7e86dfba1826', // LSP12IssuedAssets[1] -> Address stored at index 1
  ],
}
*/
```

</details>

<details>
    <summary>Encode array length only</summary>

```javascript title="Encode the length of an array"
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const myErc725 = new ERC725(schemas);

myErc725.encodeData([
  {
    keyName: 'LSP12IssuedAssets[]',
    value: 5,
  },
]);
/**
{
  keys: [
    '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
  ],
  values: ['0x00000000000000000000000000000005'],
}
*/
```

</details>

<details>
    <summary>Encode a subset of array elements</summary>

```javascript title="Encode a subset of array elements"
import ERC725 from '@erc725/erc725.js';

const schemas = [
  {
    name: 'AddressPermissions[]',
    key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
    keyType: 'Array',
    valueType: 'address',
    valueContent: 'Address',
  },
];

const myErc725 = new ERC725(schemas);

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
    '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3', // LSP12IssuedAssets[] -> data key for `LSP12IssuedAssets[].length`
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000015', // LSP12IssuedAssets[21] -> data key for index 21
    '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000016', // LSP12IssuedAssets[22] -> data key for index 22
  ],
  values: [
    '0x00000000000000000000000000000017', // LSP12IssuedAssets[].length = 23
    '0x983abc616f2442bab7a917e6bb8660df8b01f3bf', // LSP12IssuedAssets[21] -> Address stored at index 21
    '0x56ecbc104136d00eb37aa0dce60e075f10292d81', // LSP12IssuedAssets[22] -> Address stored at index 22
  ],
}
*/
```

</details>

---

### encodeKeyName

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
import ERC725 from '@erc725/erc725.js';

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

### encodeValueType

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
import ERC725 from '@erc725/erc725.js';

const myErc725 = new ERC725();

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
import ERC725 from '@erc725/erc725.js';

ERC725.encodeValueType('string', 'Hello');
// '0x48656c6c6f'
```

---

### encodeValueContent

```js
myErc725.encodeValueContent(valueContent, value);
```

or

```js
ERC725.encodeValueContent(valueContent, value);
```

or

```js
import { encodeValueContent } from '@erc725/erc725.js';
encodeValueContent(valueContent, value);
```

Encode `value` into a hex bytestring that can be then fetched, decoded and interpreted as the specified `valueContent`.

#### Parameters

| Name           | Type                                                                                              | Description                                                                                                                                                                                                                                                                                                                                   |
| :------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valueContent` | `string`                                                                                          | Available options are: <ul><li>`AssetURL`</li> <li>`JSONURL`</li> <li>`Boolean` </li> <li>`Keccak256`</li> <li>`Number`</li> <li>`Address`</li> <li>`String`</li> <li>`Markdown`</li> <li>`URL`</li> <li>`VerifiableURI`</li> <li>`BytesN`</li> <li>`BitArray`</li> <li>`Boolean`</li> <li>Any Hex `Literal` (e.g.: 0x1345ABCD...)</li> </ul> |
| `value`        | `string` or <br/> `number` or <br/> `boolean` or <br/> `AssetURLEncode` or <br/> `AssetURLEncode` | The value to encode.                                                                                                                                                                                                                                                                                                                          |

#### Returns

| Name | Type     | Description                              |
| :--- | :------- | :--------------------------------------- |
|      | `string` | The `value` encoded as a `valueContent`. |

#### Examples

```javascript
import { encodeValueContent } from '@erc725/erc725.js';

encodeValueContent('String', 'hello');
// 0x68656c6c6f

// BytesN will right pad
encodeValueContent('Bytes8', '0xaabbccdd');
// 0xaabbccdd00000000

// Encoding some markdown
encodeValueContent(
  'Markdown',
  `# Lorem Ipsum
        dolor sit amet ebriscus lanfogern`,
);
// 0x23204c6f72656d20497073756d0a2020202020202020646f6c6f722073697420616d6574206562726973637573206c616e666f6765726

encodeValueContent('URL', 'http://test.com');
// 0x687474703a2f2f746573742e636f6d

encodeValueContent('VerifiableURI', {
  verification: {
    method: 'keccak256(utf8)',
    data: '0x027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168',
  },
  url: 'http://test.com/asset.glb',
});
// 0x00006f357c6a0020027547537d35728a741470df1ccf65de10b454ca0def7c5c20b257b7b8d16168687474703a2f2f746573742e636f6d2f61737365742e676c62

encodeValueContent('VerifiableURI', {
  verification: {
    method: '0x00000000',
    data: '0x',
  },
  url: 'https://name.universal.page/',
});
// 0x000000000000000068747470733a2f2f6e616d652e756e6976657273616c2e706167652f
```

This method is also available as a static method or as a method from the `ERC725` instance.

```javascript
import ERC725 from '@erc725/erc725.js';

ERC725.encodeValueContent('String', 'hello');
// 0x68656c6c6f

const erc725 = new ERC725();
erc725.encodeValueContent('String', 'hello');
// 0x68656c6c6f
```

---

## Decoding

### decodeData

```js
myErc725.decodeData(data [, schemas]);
```

```js
ERC725.decodeData(data, schemas);
```

If you are reading the key-value store from an ERC725 smart contract you can use the `decodeData` function to do the decoding for you.

:::tip
If you want total convenience, it is recommended to use the [`fetchData`](#fetchdata) function, which automatically `decodes` and `fetches` external references.
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

#### Single-Key Example

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

#### Multi-Key Example

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

#### Dynamic-Key Example

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

### decodeValueType

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

### decodeValueContent

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

#### Examples

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

### decodeMappingKey

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

### getSchema

```js
myErc725.getSchema(keys [, providedSchemas]);
```

Parses a hashed key or a list of hashed keys and will attempt to return its corresponding [LSP2 ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md) object. Additionally, it will look for a corresponding key within the schemas:

- in the [`schemas`](https://github.com/ERC725Alliance/myErc725.js/tree/main/schemas) folder (which includes all [LSPs](https://github.com/lukso-network/LIPs/tree/main/LSPs)),
- that were provided at ERC725 initialization, and
- that were provided in the function call (`providedSchemas`).

#### Parameters

##### 1. `keys` - String or array of Strings

The key(s) you are trying to get the schema for.

##### 2. `providedSchemas` - Object (optional)

An array of extra [LSP-2 ERC725YJSONSchema] objects that can be used to find the schema.

#### Returns

| Name     | Type             | Description                                                           |
| :------- | :--------------- | :-------------------------------------------------------------------- |
| `result` | ERC725JSONSchema | If the parameter `keys` is a string and the schema was found.         |
| `result` | Record string    | If the parameter `keys` is a string[&nbsp;] and the schema was found. |
| `result` | null             | If the schema was not found.                                          |

#### Example using a predefined LSP3 schema

```javascript title="Parsing the hashed key from the LSP3 schema"
myErc725.getSchema(
  '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
);
/**
{
  name: 'LSP3Profile',
  key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  keyType: 'Singleton',
  valueContent: 'VerifiableURI',
  valueType: 'bytes'
}
*/
myErc725.getSchema([
  '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
]);
/**
{
  '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5': {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'VerifiableURI',
    valueType: 'bytes'
  },
  '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001': {
    name: 'LSP12IssuedAssets[1]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address'
  }
}
*/
```

#### Example using a custom schema

```javascript title="Parsing the hashed key from a custom schema"
myErc725.getSchema(
  '0x777f55baf2e0c9f73d3bb456dfb8dbf6e609bf557969e3184c17ff925b3c402c',
  [
    {
      name: 'ParameterSchema',
      key: '0x777f55baf2e0c9f73d3bb456dfb8dbf6e609bf557969e3184c17ff925b3c402c',
      keyType: 'Singleton',
      valueContent: 'VerifiableURI',
      valueType: 'bytes',
    },
  ],
);
/**
{
  name: 'ParameterSchema',
  key: '0x777f55baf2e0c9f73d3bb456dfb8dbf6e609bf557969e3184c17ff925b3c402c',
  keyType: 'Singleton',
  valueContent: 'VerifiableURI',
  valueType: 'bytes',
}
*/
```

---

## Fetching Data

### fetchData

```js
myErc725.fetchData([keys]);
```

The `fetchData` function fetches smart contract data and can additionally return [`VerifiableURI`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#verifiableuri) data from IPFS, HTTP, or HTTPS endpoints.

:::info

To ensure **data authenticity** `fetchData` compares the `hash` of the fetched JSON with the `hash` stored on the blockchain.

:::

:::info

If you get the `ReferenceError: fetch is not defined` error, you need to install and import [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch).

:::

#### Parameters

##### 1. `keys` - String, Object, or array of Strings or/and Objects (optional)

The name(s) (or the encoded name(s) as schema key) of the element(s) in the smart contract's schema. If no keys are set, it will fetch all the non-dynamic schema keys given at instantiation. For dynamic keys, you can use the object below:

| Name              | Type                           | Description                                                                |
| :---------------- | :----------------------------- | :------------------------------------------------------------------------- |
| `keyName`         | string                         | The dynamic key name, such as `MyKey:<address>`                            |
| `dynamicKeyParts` | string or <br/> string[&nbsp;] | The dynamic parts of the `keyName` that will be used for encoding the key. |

#### Returns

| Name | Type                                        | Description                                                                                                                                                                                                            |
| :--- | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data | `Promise<Array>` or <br/> `Promise<Object>` | An array with same objects as for [`decodeData()`](#decodedata) function but with the value being replaced by the actual file for `VerifiableURI` valueContent. If there is a hash mismatch, the value will be `null`. |

:::info

- If the input is an array, the values will be returned in an array.
- If the input is a single key, the output will be the object directly.

:::

#### All-Keys Example

```javascript title="Receiving all keys from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);
await myErc725.fetchData();
/**
[
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    value: '0x5ef83ad9'
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: { LSP3Profile: [Object] }
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    value: [
      '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
      '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
      '0xB92a8DdA288638491AEE5C2a003D4CAbfa47aE3F',
      '0x1e52e7F1707dcda57dD33F003B2311652A465acA',
      '0x0BDA71aA980D37Ea56E8a3784E4c309101DAf3E4',
      '0xfDB4D9C299438B9839e9d04E34B9609C5b56600D',
      '0x081D3F0bff8ae2339cb65113822eEc1510704d5c',
      '0x55C98c6944B7497FaAf4db0386a1aD1E6efF526E',
      '0x90D1a1D68fa23AEEE991220703f1a1C3782e0b35',
      '0xdB5AB19792d9fB61c1Dff57810Fb7C6f839Af8ED'
    ]
  }
]
*/
```

#### Single-Key Example

```javascript title="Receiving one key from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);

await myErc725.fetchData('LSP3Profile');
/**
{
  key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  name: 'LSP3Profile',
  value: { LSP3Profile: { name: 'Test', description: 'Cool' } }
}
*/
await myErc725.fetchData(['LSP1UniversalReceiverDelegate']);
/**
[
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  }
]
*/
```

#### Multi-Keys / Dynamic-Keys Example

```javascript title="Receiving multiple keys from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);

await myErc725.fetchData(['LSP3Profile', 'LSP1UniversalReceiverDelegate']);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: { LSP3Profile: [Object] }
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  }
]
*/

await myErc725.fetchData([
  'LSP1UniversalReceiverDelegate',
  {
    keyName: 'LSP12IssuedAssetsMap:<address>',
    dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
  },
]);
/**
[
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  },
  {
    name: 'LSP12IssuedAssetsMap:cafecafecafecafecafecafecafecafecafecafe',
    key: '0x74ac2555c10b9349e78f0000cafecafecafecafecafecafecafecafecafecafe',
    value: null
  }
]
*/
```

---

### getData

```js
myErc725.getData([keys]);
```

Gets **decoded data** for one, many, or all of the specified `ERC725` smart contract's keys.
When omitting the `keys` parameter, it will give back every key (as per `ERC725JSONSchema` definition).

:::caution

- Data returned by this function does not contain external data of [`VerifiableURI`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#verifiableuri) schema elements.
- If you would like to receive everything in one go, you can use [`fetchData`](#fetchdata).

:::

#### Parameters

##### 1. `keys` - String, Object, or array of Strings or/and Objects (optional)

The name(s) (or the encoded name(s) as schema key) of the element(s) in the smart contract's schema. If no keys are set, it will fetch all the non-dynamic schema keys given at instantiation. For dynamic keys, you can use the object below:

| Name              | Type                           | Description                                                                |
| :---------------- | :----------------------------- | :------------------------------------------------------------------------- |
| `keyName`         | string                         | The dynamic key name, such as `MyKey:<address>`                            |
| `dynamicKeyParts` | string or <br/> string[&nbsp;] | The dynamic parts of the `keyName` that will be used for encoding the key. |

#### Returns

| Name | Type                                        | Description                                                                   |
| :--- | :------------------------------------------ | :---------------------------------------------------------------------------- |
| data | `Promise<Array>` or <br/> `Promise<Object>` | An array with the same objects as for [`decodeData()`](#decodedata) function. |

:::info

- If the input is an array, the values will be returned in an array.
- If the input is a single key, the output will be the object directly.

:::

#### All-Keys Example

```javascript title="Receiving all keys from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);

await myErc725.getData();
/**
[
  {
    name: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    value: '0x5ef83ad9',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0x50A02EF693fF6961A7F9178d1e53CC8BbE1DaD68',
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    value: [
      '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
      '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
      '0xB92a8DdA288638491AEE5C2a003D4CAbfa47aE3F',
      '0x1e52e7F1707dcda57dD33F003B2311652A465acA',
      '0x0BDA71aA980D37Ea56E8a3784E4c309101DAf3E4',
      '0xfDB4D9C299438B9839e9d04E34B9609C5b56600D',
      '0x081D3F0bff8ae2339cb65113822eEc1510704d5c',
      '0x55C98c6944B7497FaAf4db0386a1aD1E6efF526E',
      '0x90D1a1D68fa23AEEE991220703f1a1C3782e0b35',
      '0xdB5AB19792d9fB61c1Dff57810Fb7C6f839Af8ED'
    ],
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
      },
      url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
    },
  },
]
*/
```

#### Single-Key Example

```javascript title="Receiving one key from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);

await myErc725.getData('LSP3Profile');
/**
{
  name: 'LSP3Profile',
  key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  value: {
    verification: {
      method: 'keccak256(utf8)',
      data: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
    },
    url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
  },
}
*/

await myErc725.getData(['LSP3Profile']);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
      },
      url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
    },
  }
]
*/

await myErc725.getData('LSP1UniversalReceiverDelegate');
/**
{
  name: 'LSP1UniversalReceiverDelegate',
  key: '0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
  value: '0x50A02EF693fF6961A7F9178d1e53CC8BbE1DaD68',
}
*/
```

#### Multi-Key Example

```javascript title="Receiving multiple keys from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const universalProfileAddress = '0x0F4180da178ed1C71398a57ca8Cb177F69591f1f';

const myErc725 = new ERC725(LSP3Schemas, universalProfileAddress);

await myErc725.getData(['LSP3Profile', 'LSP1UniversalReceiverDelegate']);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0xeeafeebeb416923dfb0dcf4c66b045c72742121ce2a06f93ae044ee0efb70777',
      },
      url: 'ipfs://QmZnG5Z5B5Dq8iFFtsL5i7AnrgH16P4DJ8UhY7j8RzX51p'
    }
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    value: '0xE2D6038acD92200790Df695Ebd13856CdF2a6942'
  }
]
*/
```

#### Dynamic-Key Example

```javascript title="Receiving dynamic keys from the schema"
import ERC725 from '@erc725/erc725.js';
import LSP3Schemas from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.sjon';
const luksoUniversalProfile = '0x8363Cfe6c787218f0ADA0A4aBC289A8d9dfc2453';

const myErc725 = new ERC725(LSP3Schemas, luksoUniversalProfile);

await myErc725.getData({
  keyName: 'LSP12IssuedAssetsMap:<address>',
  dynamicKeyParts: '0x592dCACb0A0d4b85eea0975992E42Bc543207F74', // asset address (KidSuper World Arts Path)
});
/**
{
  name: 'LSP12IssuedAssetsMap:592dCACb0A0d4b85eea0975992E42Bc543207F74',
  key: '0x74ac2555c10b9349e78f0000592dCACb0A0d4b85eea0975992E42Bc543207F74',
  value: '0x6b175474e89094c44da98b954eedeac495271d0f',
}
*/

await myErc725.getData([
  {
    keyName: 'LSP12IssuedAssetsMap:<address>',
    dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
  },
]);
/**
[
  {
    name: 'LSP12IssuedAssetsMap:cafecafecafecafecafecafecafecafecafecafe',
    key: '0x74ac2555c10b9349e78f0000cafecafecafecafecafecafecafecafecafecafe',
    value: '0x6b175474e89094c44da98b954eedeac495271d0f',
  }
]
*/
```

```javascript title="Receiving dynamic keys from the schema"
await myErc725.getData([
  'LSP3Profile',
  {
    keyName: 'LSP12IssuedAssetsMap:<address>',
    dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
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
        data: '0xeeafeebeb416923dfb0dcf4c66b045c72742121ce2a06f93ae044ee0efb70777',
      },
      url: 'ipfs://QmZnG5Z5B5Dq8iFFtsL5i7AnrgH16P4DJ8UhY7j8RzX51p'
    }
  },
  {
    name: 'LSP12IssuedAssetsMap:cafecafecafecafecafecafecafecafecafecafe',
    key: '0x74ac2555c10b9349e78f0000cafecafecafecafecafecafecafecafecafecafe',
    value: null
  }
]
*/
```

---

### getOwner

```js
myErc725.getOwner([address]);
```

Returns the contract owner and is not directly related to ERC725 specifications.

#### Parameters

##### 1. `address` - String (optional)

The contract address you wish to find the owner of. If no address is set, it will return the owner of the contract used to initialize the ERC725 class.

#### Returns

| Name      | Type   | Description                               |
| :-------- | :----- | :---------------------------------------- |
| `Promise` | string | The contract or EOA address of the owner. |

:::info

The address of the contract owner as stored in the contract.

:::

#### Example

```javascript title="Receiving the owner address"
// If no address is set, it will return the owner of the contract used to initialize the ERC725() class.
await myErc725.getOwner();
// '0x94933413384997F9402cc07a650e8A34d60F437A'

// You can also get the owner of a specific contract by setting the address parameter
await myErc725.getOwner('0x3000783905Cc7170cCCe49a4112Deda952DDBe24');
// '0x7f1b797b2Ba023Da2482654b50724e92EB5a7091'
```

---

### isValidSignature

```js
myErc725.isValidSignature(messageOrHash, signature);
```

Checks if a signature was signed by the `owner` of the ERC725 Account contract, according to [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271). If the `owner` is a contract itself, it will delegate the `isValidsignature()` call to the owner contract if it supports [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271). Otherwise, it will fail.

#### Parameters

##### 1. `messageOrHash` - String

Value of a message or hash that needs to be verified.

##### 2. `signature` - String

The raw RLP encoded signature.

:::info

- The hash must be 66 chars long with the `0x` prefix. Otherwise, it will be interpreted as message.
- The message will be: enveloped as `"\x19Ethereum Signed Message:\n" + message.length + message` and hashed using `keccak256` function.
  The signature can be generated with [`web3.eth.accounts.sign()`](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html#sign).

:::

#### Returns

| Name      | Type    | Description                                                    |
| :-------- | :------ | :------------------------------------------------------------- |
| `Promise` | boolean | `true` if signature is valid, `false` if signature is invalid. |

:::info

- A valid signature means that the smart contract response IS the MAGICVALUE: `0x1626ba7e`.
- If this function is called on a contract which does not support [EIP-1271](https://eips.ethereum.org/EIPS/eip-1271), it will throw an error.

:::

#### Examples

```javascript title="Checking the signature with a message"
await myErc725.isValidSignature(
  'hello',
  '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c',
);
// true
```

```javascript title="Checking the signature with a hash"
await myErc725.isValidSignature(
  '0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655',
  '0xcafecafeb915466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c',
);
// false
```

[lsp6 keymanager permissions]: ../../../../../standards/universal-profile/lsp6-key-manager#permissions
[lsp6 keymanager standard]: https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager
[lsp-2 erc725yjsonschema]: https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md

### supportsInterface

```js
myERC725.supportsInterface(interfaceIdOrName);
```

```js
ERC725.supportsInterface(interfaceIdOrName, options);
```

You can use this function if you need to check if the ERC725 object or a smart contract supports a specific interface (by ID or name). When you use the function on your instantiated ERC725 class, it will use the contract address and provider provided at instantiation. On a non-instantiated class, you need to specify them in the `options` parameter.

:::caution
The `interfaceId` is not the most secure way to check for a standard, as they could be set manually.
:::

#### Parameters

##### 1. `interfaceIdOrName` - String

Either a string of the hexadecimal `interfaceID` as defined by [ERC165](https://eips.ethereum.org/EIPS/eip-165) or one of the predefined interface names:

| interfaceName                   | Standard                                                                                                                   |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| `ERC1271`                       | [EIP-1271: Standard Signature Validation Method for Contracts](https://eips.ethereum.org/EIPS/eip-1271)                    |
| `ERC725X`                       | [EIP-725: General execution standard](https://eips.ethereum.org/EIPS/eip-725)                                              |
| `ERC725Y`                       | [EIP-725: General key-value store](https://eips.ethereum.org/EIPS/eip-725)                                                 |
| `LSP0ERC725Account`             | [LSP-0: ERC725 Account](https://docs.lukso.tech/standards/universal-profile/lsp0-erc725account)                            |
| `LSP1UniversalReceiver`         | [LSP-1: Universal Receiver](https://docs.lukso.tech/standards/generic-standards/lsp1-universal-receiver)                   |
| `LSP1UniversalReceiverDelegate` | [LSP-1: Universal Receiver Delegate](https://docs.lukso.tech/standards/universal-profile/lsp1-universal-receiver-delegate) |
| `LSP6KeyManager`                | [LSP-6: Key Manager](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager)                                 |
| `LSP7DigitalAsset`              | [LSP-7: Digital Asset](https://docs.lukso.tech/standards/nft-2.0/LSP7-Digital-Asset)                                       |
| `LSP8IdentifiableDigitalAsset`  | [LSP-8: Identifiable Digital Asset](https://docs.lukso.tech/standards/nft-2.0/LSP8-Identifiable-Digital-Asset)             |
| `LSP9Vault`                     | [LSP-9: Vault](https://docs.lukso.tech/standards/universal-profile/lsp9-vault)                                             |

:::info

The `interfaceName` will only check for the latest version of the standard's `interfaceID`, which can be found in `src/constants/interfaces`. For LSPs, the `interfaceIDs` are taken from the latest release of the [@lukso/lsp-smart-contracts](https://github.com/lukso-network/lsp-smart-contracts) library.

:::

##### 2. `options` - Object (optional)

On non instantiated class, you should provide an `options` object.

| Name      | Type   | Description                                                          |
| :-------- | :----- | :------------------------------------------------------------------- |
| `address` | string | Address of the smart contract to check against a certain interface.  |
| `rpcUrl`  | string | RPC URL to connect to the network the smart contract is deployed to. |
| `gas`     | number | Optional: gas parameter to use. Default: 1_000_000.                  |

#### Returns

| Type               | Description                                                   |
| :----------------- | :------------------------------------------------------------ |
| `Promise<boolean>` | Returns `true` if the interface was found, otherwise `false`. |

#### Examples

```javascript title="By using the interface ID"
myErc725.supportsInterface('0xfd4d5c50');
// true

ERC725.supportsInterface('0xfd4d5c50', {
  address: '0xe408BDDbBAB1985006A2c481700DD473F932e5cB',
  rpcUrl: 'https://rpc.testnet.lukso.network',
});
// false
```

```javascript title="By using interface name"
myErc725.supportsInterface('LSP0ERC725Account');
// false

ERC725.supportsInterface('LSP0ERC725Account', {
  address: '0x0Dc07C77985fE31996Ed612F568eb441afe5768D',
  rpcUrl: 'https://rpc.testnet.lukso.network',
  gas: 20_000_000,
});
// true
```

---

## External Data Source utilities (`VerifiableURI` and `JSONURI`)

### encodeDataSourceWithHash

```js
const myErc725 = new ERC725();
myErc725.encodeDataSourceWithHash(verification, dataSource);
```

OR

```js
ERC725.encodeDataSourceWithHash(verification, dataSource);
```

Encode a verifiableURI providing the hashing function of the json file (method), the hash of the json file (data) and the url where the json file is stored.

#### Parameters

| Name           | Type                          | Description                                                                                                              |
| :------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `verification` | `undefined` or `Verification` | Verification is an object containing the hashing function of the json file (method) and the hash of the json file (data) |
| `dataSource`   | `string`                      | The url where the json file is stored.                                                                                   |

<details>
    <summary>Types details</summary>

```js
interface Verification {
    method: SUPPORTED_VERIFICATION_METHODS | string;
    data: string;
    source?: string;
}

type SUPPORTED_VERIFICATION_METHODS =
    | SUPPORTED_VERIFICATION_METHOD_STRINGS
    | SUPPORTED_VERIFICATION_METHOD_HASHES;

enum SUPPORTED_VERIFICATION_METHOD_STRINGS {
    KECCAK256_UTF8 = 'keccak256(utf8)',
    KECCAK256_BYTES = 'keccak256(bytes)',
}

enum SUPPORTED_VERIFICATION_METHOD_HASHES {
    HASH_KECCAK256_UTF8 = '0x6f357c6a',
    HASH_KECCAK256_BYTES = '0x8019f9b1',
}
```

</details>

#### Returns

| Name            | Type   | Description       |
| :-------------- | :----- | :---------------- |
| `verifiableURI` | string | The verifiableURI |

#### Examples

<details>
    <summary>Encode a <code>VerifiableURI</code> providing the hashing function, the JSON hash and the uploaded URL</summary>

```javascript title="Encode a VerifiableURI providing the hashing function, the JSON hash and the uploaded URL"
const verifiableURI = myErc725.encodeDataSourceWithHash(
  {
    method: 'keccak256(utf8)',
    data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
  },
  'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
);
/**
0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178
*/
```

</details>

### decodeDataSourceWithHash

```js
const myErc725 = new ERC725();
myErc725.decodeDataSourceWithHash(verifiableURI);
```

```js
ERC725.decodeDataSourceWithHash(verifiableURI);
```

Decode a verifiableURI into the hash function of the json file, the hash of the json file and the url where the json file is stored.

#### Parameters

| Name            | Type     | Description       |
| :-------------- | :------- | :---------------- |
| `verifiableURI` | `string` | The verifiableURI |

#### Returns

| Name                   | Type              | Description                                                                                                |
| :--------------------- | :---------------- | :--------------------------------------------------------------------------------------------------------- |
| `decodedVerifiableURI` | `URLDataWithHash` | Object containing the hash function, the hash of the JSON file and the link where the json file is stored. |

<details>
    <summary>Types details</summary>

```js
interface URLDataWithHash {
  verification: Verification;
  url: string
}

interface Verification {
method: SUPPORTED_VERIFICATION_METHODS | string;
data: string;
source?: string;
}

type SUPPORTED_VERIFICATION_METHODS =
| SUPPORTED_VERIFICATION_METHOD_STRINGS
| SUPPORTED_VERIFICATION_METHOD_HASHES;

enum SUPPORTED_VERIFICATION_METHOD_STRINGS {
KECCAK256_UTF8 = 'keccak256(utf8)',
KECCAK256_BYTES = 'keccak256(bytes)',
}

enum SUPPORTED_VERIFICATION_METHOD_HASHES {
HASH_KECCAK256_UTF8 = '0x6f357c6a',
HASH_KECCAK256_BYTES = '0x8019f9b1',
}

```

</details>

#### Examples

<details>
    <summary>Decode a <code>VerifiableURI</code></summary>

```javascript title="Decode a VerifiableURI"
const decodedVerifiableURI = myErc725.decodeDataSourceWithHash(
  '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
);
/**
verification: {
    data: '820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    method: 'keccak256(utf8)',
  }
url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
*/
```

</details>

### getDataFromExternalSources

```js
getDataFromExternalSources(schema, dataFromChain, ipfsGateway, [
  (throwException = true),
]);
```

Retrieve the data(s) stored on IPFS using one (or multiple) IPFS CID(s) and link(s) under the `dataFromChain` parameter.

#### Parameters

| Name                        | Type                 | Description                                                                                                                                    |
| :-------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema`                    | `ERC725JSONSchema[]` | A list of JSON schemas for some given data keys.                                                                                               |
| `dataFromChain`             | `DecodeDataOutput[]` | ...                                                                                                                                            |
| `ipfsGateway`               | `string`             | The URL to use to fetch data from the IPFS network.                                                                                            |
| `throwException` (optional) | `boolean`            | Define if the function should throw an error when fetching data. Set to `true` by default. This is useful for handling exceptions differently. |

<details>
    <summary>Types details</summary>

```js
interface ERC725JSONSchema {
  name: string; // Describes the name of the key, SHOULD be composed of the Standards name + sub type. e.g: LSP2Name
  key: string; // The keccak256 hash of the name. This is the actual key that MUST be retrievable via ERC725Y.getData(bytes32 key)
  keyType: ERC725JSONSchemaKeyType | string; // Types that determine how the values should be interpreted.
  valueContent: ERC725JSONSchemaValueContent | string; // string holds '0x1345ABCD...' If the value content are specific bytes, than the returned value is expected to equal those bytes.
  valueType: ERC725JSONSchemaValueType | string; // The type of the value. This is used to determine how the value should be encoded / decode (`string` for tuples and CompactBytesArray).
}

interface DecodeDataOutput {
  value: Data | Data[] | URLDataWithHash | null;
  name: string;
  key: string;
}

type Data = string | number | boolean | null;

interface URLDataWithHash extends URLData {
  verification: Verification; // | string is to allow use of string directly without importing the enum
  json?: never;
}

interface URLData {
  url: string;
}
```

</details>

#### Returns

| Name | Type     | Description |
| :--- | :------- | :---------- |
|      | `object` | ...         |

#### Examples

```javascript
import { getDataFromExternalSources } from '@erc725/erc725.js';

const schema = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueType: 'bytes',
    valueContent: 'VerifiableURI',
  },
];

const dataFromChain = [
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verification: {
        data: '0xdb864ed42104cee179785036cb4ff1183ebc57e5532ae766ad8533fa48acfbb3',
        method: 'keccak256(utf8)',
      },
      url: 'ipfs://QmdMGUxuQsm1U9Qs8oJSn5PfY4B1apGG75YBRxQPybtRVm',
    },
  },
];
const ipfsGateway = 'https://my-ipfs-gateway.com/ipfs/';

await getDataFromExternalSources(schema, dataFromChain, ipfsGateway);
/**
{
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: {
          LSP3Profile: {
            name: 'test',
            description: '',
            tags: ['profile'],
            links: [],
            profileImage: [
              {
                width: 1024,
                height: 709,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x6a0a28680d65b69f5696859be7e0fcebbbcf0df47f1f767926de35402c7d525c',
                },
                url: 'ipfs://QmVUYyft3j2JVrG4RzDe1Qx7K5gNtJGFhrExHQFeiRXz1C',
              },
              // more images...
            ],
            backgroundImage: [
              {
                width: 1800,
                height: 1012,
                verification: {
                  method: 'keccak256(bytes)',
                  data: '0x3f6be73b35d348fb8f0b87a47d8c8b6b9db8858ee044cb13734cdfe5d28031d8',
                },
                url: 'ipfs://QmfLCPmL31f31RRB4R7yoTg3Hsk5PjrWyS3ZaaYyhRPT4n',
              },
              // more images...
            ],
          },
        },
      },
    ]);
  });
 */
```

---

### getVerificationMethod

```js
const myErc725 = new ERC725();
myErc725.getVerificationMethod(nameOrSig);
```

```js
ERC725.getVerificationMethod(nameOrSig);
```

```js
import { getVerificationMethod } from '@erc725/erc725.js';
getVerificationMethod(nameOrSig);
```

Get the verification method definition, including the name, signature and related method.

method: (data: string | object | Uint8Array | null) => string;
name: SUPPORTED_VERIFICATION_METHOD_STRINGS;
sig: SUPPORTED_VERIFICATION_METHODS;

#### Parameters

| Name        | Type   | Description                                 |
| :---------- | :----- | :------------------------------------------ |
| `nameOrSig` | string | The 4 bytes hex of the verification method. |

#### Returns

| Name | Type   | Description                                                                             |
| :--- | :----- | :-------------------------------------------------------------------------------------- |
|      | object | An object containing the name, signature and method related to the verification method. |

#### Example

```javascript title="Example of the method"
getVerificationMethod('0x6f357c6a');
/*
{
  method: [Function: keccak256Method],
  name: 'keccak256(utf8)',
  sig: '0x6f357c6a'
}
*/
```

### isDataAuthentic

```js
const myErc725 = new ERC725();
ERC725.isDataAuthentic(data, verificationOptions);
```

```js
ERC725.isDataAuthentic(data, verificationOptions);
```

```js
import { isDataAuthentic } from '@erc725/erc725.js';

isDataAuthentic(data, verificationOptions);
```

Hashes the `data` passed as parameter using the specified hashing functions (available under `method` in the `verificationOption` object) and compares the result with the provided hash.

:::info
This method will console an error if the hash provided as `data` and the expected hash obtained using the verification method do not match.
:::

#### Parameters

| Name                  | Type                     | Description                         |
| :-------------------- | :----------------------- | :---------------------------------- |
| `data`                | `string` or `Uint8Array` | The data to be hashed and verified. |
| `verificationOptions` | `Verification`           | An object as defined below          |

<details>
    <summary>Types details</summary>

```js
  KECCAK256_UTF8 = ,
  KECCAK256_BYTES = ,
  HASH_KECCAK256_UTF8 = ,
  HASH_KECCAK256_BYTES = ,

export interface Verification {
  data: string;
  method: 'keccak256(utf8)' | 'keccak256(bytes)' | '0x6f357c6a' | '0x8019f9b1' | string;
  source?: string;
}
```

</details>

#### Returns

| Name | Type      | Description                                                                                   |
| :--- | :-------- | :-------------------------------------------------------------------------------------------- |
|      | `boolean` | `true` if the data is authentic according to the verification method used, `false` otherwise. |

#### Example

<details>
    <summary>JSON data to verify from <code>data.json</code></summary>

```json
[
  {
    "name": "LSP3Profile",
    "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "value": {
      "LSP3Profile": {
        "name": "test",
        "description": "",
        "tags": ["profile"],
        "links": [],
        "profileImage": [
          {
            "width": 1024,
            "height": 709,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x6a0a28680d65b69f5696859be7e0fcebbbcf0df47f1f767926de35402c7d525c"
            },
            "url": "ipfs://QmVUYyft3j2JVrG4RzDe1Qx7K5gNtJGFhrExHQFeiRXz1C"
          },
          {
            "width": 640,
            "height": 443,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x7cd399f2a2552aa5cd21b1584a98db3efa39c701c311c38a60c680343cfa6d82"
            },
            "url": "ipfs://QmeU8FUZC9F1qMYmcWyBhfGqaf7g3kLzGb4xBpoCfyVLZW"
          },
          {
            "width": 320,
            "height": 221,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x272d2e57ae1710ac7c5e3d1c9f9d24f48954ad43d0e821f8bd041a4734e309a5"
            },
            "url": "ipfs://QmdViKPWYhZv7u86z7HBTgAkTAwEkNSRi1VkYEU8K5yUsH"
          },
          {
            "width": 180,
            "height": 124,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x1a464ff7e0eff05da98ed309a25195d8666b6211a5dfa2214865c3fd50ead810"
            },
            "url": "ipfs://QmXZUCW6MqCNfYJEFsi54Vkj6PRrUoiPjzTuA2mWtas3RJ"
          }
        ],
        "backgroundImage": [
          {
            "width": 1800,
            "height": 1012,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x3f6be73b35d348fb8f0b87a47d8c8b6b9db8858ee044cb13734cdfe5d28031d8"
            },
            "url": "ipfs://QmfLCPmL31f31RRB4R7yoTg3Hsk5PjrWyS3ZaaYyhRPT4n"
          },
          {
            "width": 1024,
            "height": 576,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0xcb57ed802bcd7dc4964395a609b3a0f557c5f46a602b28b058b9587bb77bb54f"
            },
            "url": "ipfs://QmPoPEaoGNVYhiMTwBWp6XzLPRXyuLjZWnuMobdCbfqsU9"
          },
          {
            "width": 640,
            "height": 360,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x57e8039288c3e1a7f891c839e03805984ab36524b710656f072492c1c8ebd967"
            },
            "url": "ipfs://QmU3pDA4eDNPMeARsJXxKaZsMC5MgFLgzGQccnydbU9WLV"
          },
          {
            "width": 320,
            "height": 180,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x2bebf9baac33d719bbd3b481b1af468701409ad7578f84be04e8f7563d5a1509"
            },
            "url": "ipfs://QmcKtenPsRvrqZJQ1gLCdUFkex4i9DGp7RFvucb9nbkzsz"
          },
          {
            "width": 180,
            "height": 101,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0xe32154c03c892d7c41c91220b8757ec5b7847eb2dd91413f7238b0c25f55b475"
            },
            "url": "ipfs://QmU7ueJ467E9HRahaqQmSPhvkTkMhCLXRxV45P4kmMk6vm"
          }
        ]
      }
    }
  }
]
```

</details>

```typescript title="isDataAuthentic example"
import jsonData from './data.json';

isDataAuthentic(jsonData, {
  data: '0xdb864ed42104cee179785036cb4ff1183ebc57e5532ae766ad8533fa48acfbb3',
  method: 'keccak256(utf8)',
});
// true

isDataAuthentic(jsonData, {
  data: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  method: 'keccak256(utf8)',
});
// false
```

---

## Permissions

### checkPermissions

```js
myErc725.checkPermissions(requiredPermissions, grantedPermissions);
```

```js
ERC725.checkPermissions(requiredPermissions, grantedPermissions);
```

Check if the required permissions are included in the granted permissions as defined by the [LSP6 KeyManager Standard](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager).

:::info

`checkPermissions` is available as either a static or non-static method, so it can be called without instantiating an ERC725 object.

:::

#### Parameters

##### 1. `requiredPermissions` - String[] | String

An array of required permissions or a single required permission. (32bytes hex or the official name of the permission).

##### 2. `grantedPermissions` - String

The granted permissions. (32bytes hex).

#### Returns

| Type    | Description                                                                                                                                      |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| boolean | A boolean value indicating whether the required permissions are included in the granted permissions as defined by the [LSP6 KeyManager Standard] |

#### Permission-Name Example

```javascript title="Checking permissions by name"
const requiredPermissions = 'CHANGEOWNER';
const grantedPermissions =
  '0x000000000000000000000000000000000000000000000000000000000000ff51';
ERC725.checkPermissions(requiredPermissions, grantedPermissions);
// true

// This method is also available on the instance:

const requiredPermissions = ['CHANGEOWNER', 'CALL'];
const grantedPermissions =
  '0x0000000000000000000000000000000000000000000000000000000000000051';
myErc725.checkPermissions(requiredPermissions, grantedPermissions);
// false
```

#### 32bytes hex Example

```javascript title="Checking permissions by 32bytes hex"
const requiredPermissions = [
  '0x0000000000000000000000000000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000000000000000000000000000800',
];
const grantedPermissions =
  '0x0000000000000000000000000000000000000000000000000000000000000051';

ERC725.checkPermissions(requiredPermissions, grantedPermissions);
// false

// This method is also available on the instance:

const requiredPermissions =
  '0x0000000000000000000000000000000000000000000000000000000000000001';
const grantedPermissions =
  '0x0000000000000000000000000000000000000000000000000000000000000051';

myErc725.checkPermissions(requiredPermissions, grantedPermissions);
// true
```

---

### encodePermissions

```js
ERC725.encodePermissions(permissions);
```

Encodes permissions into a hexadecimal string as defined by the [LSP6 KeyManager Standard](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager).

:::info

`encodePermissions` is available as either a static or non-static method, so it can be called without instantiating an ERC725 object.

:::

#### Parameters

##### 1. `permissions` - Object

An object with [LSP6 KeyManager Permissions] as keys and a `boolean` as value. Any omitted permissions will default to `false`.

#### Returns

| Type   | Description                                                                               |
| :----- | :---------------------------------------------------------------------------------------- |
| string | The permissions encoded as a hexadecimal string defined by the [LSP6 KeyManager Standard] |

#### Example

```javascript title="Encoding permissions"
ERC725.encodePermissions({
  CHANGEOWNER: false,
  ADDCONTROLLER: false,
  EDITPERMISSIONS: false,
  ADDEXTENSIONS: false,
  CHANGEEXTENSIONS: true,
  ADDUNIVERSALRECEIVERDELEGATE: false,
  CHANGEUNIVERSALRECEIVERDELEGATE: false,
  REENTRANCY: false,
  SUPER_TRANSFERVALUE: true,
  TRANSFERVALUE: true,
  SUPER_CALL: false,
  CALL: true,
  SUPER_STATICCALL: false,
  STATICCALL: false,
  SUPER_DELEGATECALL: false,
  DELEGATECALL: false,
  DEPLOY: false,
  SUPER_SETDATA: false,
  SETDATA: false,
  ENCRYPT: false,
  DECRYPT: false,
  SIGN: false,
  EXECUTE_RELAY_CALL: false,
  ERC4337_PERMISSION: false
}),
// '0x0000000000000000000000000000000000000000000000000000000000000110'

// Any omitted Permissions will default to false
ERC725.encodePermissions({
  ADDCONTROLLER: true,
  ADDEXTENSIONS: true,
}),
// '0x000000000000000000000000000000000000000000000000000000000000000a'
ERC725.encodePermissions({
  EDITPERMISSIONS: true,
  CHANGEEXTENSIONS: true,
  CHANGEUNIVERSALRECEIVERDELEGATE: true,
  SETDATA: true,
}),
// '0x0000000000000000000000000000000000000000000000000000000000040054'


// This method is also available on the instance:
myErc725.encodePermissions({
  EDITPERMISSIONS: true,
  SETDATA: true,
}),
```

---

### decodePermissions

```js
ERC725.decodePermissions(permission);
```

Decodes permissions from hexadecimal defined by the [LSP6 KeyManager Standard](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager).

:::info

`decodePermissions` is available as either a static or non-static method, so it can be called without instantiating an ERC725 object.

:::

#### Parameters

##### 1. `permission` - String

The encoded permission (32bytes hex).

#### Returns

| Name                 | Type   | Description                                                                                        |
| :------------------- | :----- | :------------------------------------------------------------------------------------------------- |
| `decodedPermissions` | Object | An object specifying whether default LSP6 permissions are included in provided hexademical string. |

#### Example

```javascript title="Decoding permissions"
ERC725.decodePermissions('0x0000000000000000000000000000000000000000000000000000000000000110'),
/**
{
  CHANGEOWNER: false,
  EDITPERMISSIONS: false,
  ADDCONTROLLER: false,
  SETDATA: false,
  CALL: true,
  STATICCALL: false,
  DELEGATECALL: false,
  DEPLOY: false,
  TRANSFERVALUE: true,
  SIGN: false,
}
*/

ERC725.decodePermissions('0x000000000000000000000000000000000000000000000000000000000000000a'),
/**
{
  CHANGEOWNER: false,
  EDITPERMISSIONS: true,
  ADDCONTROLLER: false,
  SETDATA: true,
  CALL: false,
  STATICCALL: false,
  DELEGATECALL: false,
  DEPLOY: false,
  TRANSFERVALUE: false,
  SIGN: false,
}
*/

// This method is also available on the instance:
myErc725.decodePermissions('0x0000000000000000000000000000000000000000000000000000000000000110'),
```

---

### mapPermission

```js
const erc725 = new ERC725();
erc725.mapPermission(permissionName);
```

```js
ERC725.mapPermission(permissionName);
```

```js
import { mapPermission } from '@erc725/erc725.js';

mapPermission(permissionName);
```

/\*\*

Return the bytes32 representation of an LSP6 permission from its name.

:::tip
When using the `mapPermission` method, if the permission is not known, the function will return `null`.
:::

#### Parameters

| Name             | Type     | Description                                                                                       |
| :--------------- | :------- | :------------------------------------------------------------------------------------------------ |
| `permissionName` | `string` | The name of the permission to return the associated `bytes32` value (\_e.g: `SETDATA`, `DEPLOY`). |

#### Returns

| Name | Type               | Description                                                                                                                                  |
| :--- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
|      | `string` or `null` | A bytes32 hex string representing the `permissionName`. Or `null` if the input is not a known permission name or a valid 32-byte hex string. |

### Example

```javascript title="mapPermission example"
erc725js.mapPermissions('CHANGEOWNER');
// 0x0000000000000000000000000000000000000000000000000000000000000001

erc725js.mapPermissions('SETDATA');
// 0x0000000000000000000000000000000000000000000000000000000000040000

erc725js.mapPermissions('DEPLOY');
// 0x0000000000000000000000000000000000000000000000000000000000010000
```
