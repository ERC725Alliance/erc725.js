// As Defined in: https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md

export type ERC725JSONSchemaKeyType =
  | 'Singleton'
  | 'Array'
  | 'Mapping'
  | 'MappingWithGrouping';

export type ERC725JSONSchemaValueContent =
  | 'Number'
  | 'String'
  | 'Address'
  | 'Keccak256'
  | 'AssetURL'
  | 'JSONURL'
  | 'URL'
  | 'Markdown'
  | 'Boolean'
  | string; // for tuples

export const ALL_VALUE_TYPES = [
  // unsigned integers
  'uint8',
  'uint16',
  'uint24',
  'uint32',
  'uint40',
  'uint48',
  'uint56',
  'uint64',
  'uint72',
  'uint80',
  'uint88',
  'uint96',
  'uint104',
  'uint112',
  'uint120',
  'uint128',
  'uint136',
  'uint144',
  'uint152',
  'uint160',
  'uint168',
  'uint176',
  'uint184',
  'uint192',
  'uint200',
  'uint208',
  'uint216',
  'uint224',
  'uint232',
  'uint240',
  'uint248',
  'uint256',
  // signed integers
  'int8',
  'int16',
  'int24',
  'int32',
  'int40',
  'int48',
  'int56',
  'int64',
  'int72',
  'int80',
  'int88',
  'int96',
  'int104',
  'int112',
  'int120',
  'int128',
  'int136',
  'int144',
  'int152',
  'int160',
  'int168',
  'int176',
  'int184',
  'int192',
  'int200',
  'int208',
  'int216',
  'int224',
  'int232',
  'int240',
  'int248',
  'int256',
  // bytesN
  'bytes1',
  'bytes2',
  'bytes3',
  'bytes4',
  'bytes5',
  'bytes6',
  'bytes7',
  'bytes8',
  'bytes9',
  'bytes10',
  'bytes11',
  'bytes12',
  'bytes13',
  'bytes14',
  'bytes15',
  'bytes16',
  'bytes17',
  'bytes18',
  'bytes19',
  'bytes20',
  'bytes21',
  'bytes22',
  'bytes23',
  'bytes24',
  'bytes25',
  'bytes26',
  'bytes27',
  'bytes28',
  'bytes29',
  'bytes30',
  'bytes31',
  'bytes32',
  // others static types
  'bool',
  'boolean',
  'address',
  // array and dynamic types
  'string',
  'bytes',
  // arrays
  'string[]',
  'address[]',
  'uint256[]',
  'bytes32[]',
  'bytes4[]',
  'bytes[]',
  'bool[]',
  'boolean[]',
] as const;

export type ERC725JSONSchemaValueType = (typeof ALL_VALUE_TYPES)[number];

export function isValidValueType(
  value: string,
): value is ERC725JSONSchemaValueType {
  return ALL_VALUE_TYPES.includes(value as ERC725JSONSchemaValueType);
}

/**
 * ```javascript title=Example
 *   {
 *     name: "LSP3Profile",
 *     key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
 *     keyType: "Singleton",
 *     valueContent: "JSONURL",
 *     valueType: "bytes",
 *   },
 * ```
 * Detailed information available on [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
 */
export interface ERC725JSONSchema {
  name: string; // Describes the name of the key, SHOULD compromise of the Standards name + sub type. e.g: LSP2Name
  key: string; // The keccak256 hash of the name. This is the actual key that MUST be retrievable via ERC725Y.getData(bytes32 key)
  keyType: ERC725JSONSchemaKeyType | string; // Types that determine how the values should be interpreted.
  valueContent: ERC725JSONSchemaValueContent | string; // string holds '0x1345ABCD...' If the value content are specific bytes, than the returned value is expected to equal those bytes.
  valueType: ERC725JSONSchemaValueType | string; // The type of the value. This is used to determine how the value should be encoded / decode (`string` for tuples and CompactBytesArray).
}

// The dynamic part placeholder in the `name` of ERC725JSONSchema is preserved to allow re-encoding after the schema
// of a hex data key got retrieved via `getSchema(...)`.
export interface DynamicNameSchema extends ERC725JSONSchema {
  dynamicName: string; // Describes the name of the key where the dynamic part (<address>, <bytes32) is replaced by the actual mapped value.
  dynamicKeyPart: string;
}
