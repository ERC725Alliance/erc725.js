// As Defined in: https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md

export type ERC725JSONSchemaKeyType =
  | 'Singleton'
  | 'Mapping'
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
  | string; // for tuples

// https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#valueType
export type ERC725JSONSchemaValueType = string;

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
  keyType: ERC725JSONSchemaKeyType; // Types that determine how the values should be interpreted.
  valueContent: ERC725JSONSchemaValueContent | string; // string holds '0x1345ABCD...' If the value content are specific bytes, than the returned value is expected to equal those bytes.
  valueType: ERC725JSONSchemaValueType;
}
