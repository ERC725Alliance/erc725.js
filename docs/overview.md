# Overview

## Types

- ERC725JSONSchema,
- ERC725JSONSchemaKeyType,
- ERC725JSONSchemaValueContent,
- ERC725JSONSchemaValueType,
- Permissions,
- ERC725Config,
- KeyValuePair,
- ProviderTypes
- DynamicNameSchema
- DecodeDataInput,
- DecodeDataOutput,
- EncodeDataInput,
- FetchDataOutput,

_there is even more..._

## Encoding utilities

- encodeData
- encodeKey -> necessary?
- encodeKeyName
- encodeKeyValue
- encodeArrayKey
- encodeValueType,
- encodeValueContent,

## Decoding utilities

- decodeData
- decodeKey
- decodeKeyPart
- decodeKeyValue
- decodeMappingKey
- decodeValueType,
- decodeValueContent,

## Permissions utilities

- encodePermissions
- decodePermissions
- checkPermissions
- mapPermission -> Super useful!

## Fetching data

- getDataFromExternalSources
- ERC725.getData
- ERC725.fetchData
- ERC725.getOwner
- ERC725.isValidSignature

**These to be discussed**

- getArrayValues
- getDataMultiple
- getData

## External Data Source utilities (`VerifiableURI` and `JSONURI`)

- encodeDataSourceWithHash,
- decodeDataSourceWithHash,
- getVerificationMethod
- hashData
- isDataAuthentic

## Schema utilities

- getSchema
- getSchemaElement
- getSchemaElementForDynamicKeyName
- validateSchemas
- generateSchemasFromDynamicKeys

## Dynamic Keys utilities

- encodeDynamicKeyPart
- encodeDynamicMapping
- encodeDynamicMappingWithGrouping
- encodeDynamicKeyName
- generateDynamicKeyName
- isDynamicKeyPart
- isDynamicKeyName
- splitMultiDynamicKeyNamePart

## Helpers

- convertIPFSGatewayUrl
- duplicateMultiTypeERC725SchemaEntry
- guessKeyTypeFromKeyName
- isValidUintSize
- isValidByteSize
- isValueContentLiteralHex
- isValid32ByteHexString

## Tuple utilities

- encodeTupleKeyValue
- decodeTupleKeyValue
- isValidTuple

---

These functions are not exported (yet!)

- validateSchemas
- duplicateMultiTypeERC725SchemaEntry
- convertIPFSGatewayUrl
- generateSchemasFromDynamicKeys
- encodeKeyValue
- guessKeyTypeFromKeyName -> can be renamed to `get`?
- encodeTupleKeyValue
- encodeKey -> necessary?
- isValidTuple
- decodeKeyValue
- getVerificationMethod
- hashData
- isDataAuthentic
- splitMultiDynamicKeyNamePart
- isValidUintSize
- isValidByteSize
- isValueContentLiteralHex
- getSchemaElementForDynamicKeyName
- getSchemaElement
- getArrayValues
- getDataMultiple
- getData
- encodeDynamicKeyPart
- encodeDynamicMapping
- encodeDynamicMappingWithGrouping
- encodeDynamicKeyName
- generateDynamicKeyName
- isValid32ByteHexString
- mapPermission -> Super useful!
- isDynamicKeyPart
- decodeKeyPart
- isValidTuple
- decodeTupleKeyValue -> strange we don't have `encodeTupleKeyValue`
- decodeKey

These types should be exported:

- DynamicNameSchema
- DecodeDataInput,
- DecodeDataOutput,
- EncodeDataInput,
- FetchDataOutput,
- there is even more...
