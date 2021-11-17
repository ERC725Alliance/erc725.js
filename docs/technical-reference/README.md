# @erc725/erc725.js - v0.7.0

## Enumerations

- [ProviderTypes](enums/ProviderTypes.md)

## Classes

- [ERC725](classes/ERC725.md)

## Interfaces

- [ERC725Config](interfaces/ERC725Config.md)
- [ERC725JSONSchema](interfaces/ERC725JSONSchema.md)
- [KeyValuePair](interfaces/KeyValuePair.md)

## References

### default

Renames and exports: [ERC725](classes/ERC725.md)

## Type aliases

### ERC725JSONSchemaKeyType

Ƭ **ERC725JSONSchemaKeyType**: ``"Singleton"`` \| ``"Mapping"`` \| ``"Array"`` \| ``"Bytes20Mapping"`` \| ``"Bytes20MappingWithGrouping"``

#### Defined in

[types/ERC725JSONSchema.ts:3](https://github.com/ERC725Alliance/erc725.js/blob/f75d387/src/types/ERC725JSONSchema.ts#L3)

___

### ERC725JSONSchemaValueContent

Ƭ **ERC725JSONSchemaValueContent**: ``"Number"`` \| ``"String"`` \| ``"Address"`` \| ``"Keccak256"`` \| ``"AssetURL"`` \| ``"JSONURL"`` \| ``"URL"`` \| ``"Markdown"``

#### Defined in

[types/ERC725JSONSchema.ts:10](https://github.com/ERC725Alliance/erc725.js/blob/f75d387/src/types/ERC725JSONSchema.ts#L10)

___

### ERC725JSONSchemaValueType

Ƭ **ERC725JSONSchemaValueType**: ``"string"`` \| ``"address"`` \| ``"uint256"`` \| ``"bytes32"`` \| ``"bytes"`` \| ``"bytes4"`` \| ``"string[]"`` \| ``"address[]"`` \| ``"uint256[]"`` \| ``"bytes32[]"`` \| ``"bytes4[]"`` \| ``"bytes[]"``

#### Defined in

[types/ERC725JSONSchema.ts:20](https://github.com/ERC725Alliance/erc725.js/blob/f75d387/src/types/ERC725JSONSchema.ts#L20)

## Functions

### encodeData

▸ **encodeData**<`Schema`, `T`\>(`data`, `schema`): { [K in T]: Schema[T]["encodeData"]["returnValues"]}

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Schema` | extends `GenericSchema` |
| `T` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | { [K in T]: Schema[T]["encodeData"]["inputTypes"]} | an object of key-value pairs |
| `schema` | [`ERC725JSONSchema`](interfaces/ERC725JSONSchema.md)[] | an array of schema definitions as per $[ERC725JSONSchema](interfaces/ERC725JSONSchema.md) |

#### Returns

{ [K in T]: Schema[T]["encodeData"]["returnValues"]}

#### Defined in

[lib/utils.ts:475](https://github.com/ERC725Alliance/erc725.js/blob/f75d387/src/lib/utils.ts#L475)

___

### flattenEncodedData

▸ **flattenEncodedData**(`encodedData`): [`KeyValuePair`](interfaces/KeyValuePair.md)[]

Transform the object containing the encoded data into an array ordered by keys,
for easier handling when writing the data to the blockchain.

#### Parameters

| Name | Type |
| :------ | :------ |
| `encodedData` | `Object` |

#### Returns

[`KeyValuePair`](interfaces/KeyValuePair.md)[]

KeyValuePair[] An array of key-value objects

#### Defined in

[lib/utils.ts:547](https://github.com/ERC725Alliance/erc725.js/blob/f75d387/src/lib/utils.ts#L547)
