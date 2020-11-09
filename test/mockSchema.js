// Mock schema for tests
// make one schema that tests every single type

export const mockSchema = [

  // test mock fields
  // {
  //   "name":"LSP3TestAddress",
  //   "key": "0xa49b3cf6cec9905e04094de0c86a9782023421ff4c735fb40a53392c2f6dce38",
  //   "valueContent": "Address",
  //   "valueType": "address",
  //   // Testing fields
  //   "returnRawData": "",
  //   "returnGraphData": "",
  //   "expectedResult": "0x0c03fba782b07bcf810deb3b7f0595024a444f4e"
  // },
  // {
  //   "name":"LSP3TestJSONURI",
  //   "key": "0xf940a5a6405ad55fda0a64f618120ebde0b5755f52587f3b2ea3ae0fcde78cd8",
  //   "valueContent": "Keccak256",
  //   "valueType": "bytes32",
  //   // Testing fields
  //   "returnRawData": "",
  //   "returnGraphData": "",
  //   "expectedResult": "0xafc94d3bc364263f0c0e6e4df8e51dbef64917d40a4eaf9cfd109b8d8b264da3" // 'testingHash'
  // },
  // {
  //   "name": "TestHashedAssetURI",
  //   "key": "0xbb6581e5ed9fe56d79ca6dd876c902603912b84206c2991615ee20c2d73bccc7",
  //   "valueContent": "0xbb6581e5ed9fe56d79ca6dd876c902603912b84206c2991615ee20c2d73bccc7",
  //   "valueType": ""
  // },


  // Real data from testnet
  {
    "name": "LSP3Name",
    "key": "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "keyType": "Singleton",
    "valueContent": "String",
    "valueType": "string",
    // Testing fields
    "ethereumCallSig": "0x54f6127fa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "returnRawData": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000107061747269636b2d6d63646f77656c6c00000000000000000000000000000000",
    "returnGraphData": "0x7061747269636b2d6d63646f77656c6c",
    "expectedResult": "patrick-mcdowell"
  },
  
  {
    "name": "LSP3Profile",
    "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "keyType": "Singleton",
    "valueContent": "URI",
    "valueType": "string",
    // Testingfields
    "ethereumCallSig": "0x54f6127f5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5", // remove this
    "returnRawData": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a62640000000000000000000000",
    "returnGraphData": "0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264",
    "expectedResult": "ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd"
  },
  {
    "name": "LSP3IssuedAssets[]",
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
    "keyType": "Array",
    "valueContent": "ArrayLength",
    "valueType": "uint256",
    "elementKey": "0x3a47ab5bd3a594c3a8995f8fa58d0876",
    "elementKeyType": "ArrayElement",
    "elementValueContent": "Address",
    "elementValueType": "address",
    // testing results
    // the full array of values
    "returnRawData": [
      "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002", // array length
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000014c444009d38d3046bb0cf81fa2cd295ce46a67c78000000000000000000000000",
      "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000144febc3491230571f6e1829e46602e3b110215a2e000000000000000000000000",
    ],
    "returnGraphData": [
      "0x0000000000000000000000000000000000000000000000000000000000000002", // array length
      "0xc444009d38d3046bb0cf81fa2cd295ce46a67c78",
      "0x4febc3491230571f6e1829e46602e3b110215a2e",
    ],
    "expectedResult" :[
      "0xc444009d38d3046bb0cf81fa2cd295ce46a67c78",
      "0x4febc3491230571f6e1829e46602e3b110215a2e",
    ]

  },
]

// Tests to include for:
// valueContent: The content in the returned value. Valid values are:
// String: The content is a generic UTF8 string.
// Address: The content is an address.
// Keccak256: The content is an keccak256 32 bytes hash.
// HashedAssetURI: The content is bytes containing the following format:
// bytes4(keccak256('hashFunctionName')) + bytes32(assetHash) + utf8ToHex('ipfs://QmQ2CN2VUdb5nVAz28R47aWP6BjDLPGNJaSBniBuZRs3Jt')
// Hash function types can be:
// keccak256('keccak256') = 0xb7845733
// TODO add more
// JSONURI: The content is bytes containing the following format:
// bytes4(keccak256('hashFunctionName')) + bytes32(jsonHash) + utf8ToHex('ipfs://QmQ2CN2VUdb5nVAz28R47aWP6BjDLPGNJaSBniBuZRs3Jt')
// Hash function names like above.
// URI: The content is an URI encoded as UTF8 string.
// Markdown: The content is structured Markdown mostly encoded as UTF8 string.
// 0x134...: If the value type is a specific hash than the return value is expected to equal that hash (This is used for specific e.g. LSP4Type).
