// As Defined in: https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md

export type ERC725SchemaKeyType = 'Singleton' | 'Mapping' | 'Array';

export type ERC725SchemaValueContent =
    | 'Number'
    | 'String'
    | 'Address'
    | 'Keccak256'
    | 'AssetURL'
    | 'JSONURL'
    | 'URL'
    | 'Markdown';

export type ERC725SchemaValueType =
    | 'string'
    | 'address'
    | 'uint256'
    | 'bytes32'
    | 'bytes'
    | 'string[]'
    | 'address[]'
    | 'uint256[]'
    | 'bytes32[]'
    | 'bytes[]';

export interface ERC725Schema {
    name: string; // Describes the name of the key, SHOULD compromise of the Standards name + sub type. e.g: LSP2Name
    key: string; // The keccak256 hash of the name. This is the actual key that MUST be retrievable via ERC725Y.getData(bytes32 key)
    keyType: ERC725SchemaKeyType; // Types that determine how the values should be interpreted.
    valueContent: ERC725SchemaValueContent | string; // string holds '0x1345ABCD...' If the value content are specific bytes, than the returned value is expected to equal those bytes.
    valueType: ERC725SchemaValueType;
    elementKey?: string;
    elementKeyType?: string;
    elementValueContent?: ERC725SchemaValueContent; // exists for array elements
    elementValueType?: ERC725SchemaValueType; // exists for array elements
}
