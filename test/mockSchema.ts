// Mock schema for tests
// make one schema that tests every single type

import { encodeParameter } from 'web3-eth-abi';
import { keccak256, leftPad, utf8ToBytes, utf8ToHex } from 'web3-utils';

import type { ERC725JSONSchema } from '../src/types/ERC725JSONSchema';

const mockJsonString = `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`;

export const mockJson = {
  hash: keccak256(utf8ToBytes(mockJsonString)),
  data: mockJsonString,
  url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
};

const mockJsonString2 = '{"test1":"value1","test2":"value2","test3":"value3"}';

export const mockJson2 = {
  hash: keccak256(utf8ToBytes(mockJsonString2)),
  data: mockJsonString2,
  url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd', // dummy url
};

export const mockSchema: (ERC725JSONSchema & {
  returnGraphData?;
  dynamicKeyParts?: string | string[];
  expectedResult?;
})[] = [
  // Case 1
  {
    name: 'SupportedStandards:LSP3Profile',
    dynamicName: 'SupportedStandards:LSP3Profile',
    key: '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    keyType: 'Mapping',
    valueContent: '0x5ef83ad9',
    valueType: 'bytes',
    // Testing data
    returnGraphData: '0x5ef83ad9',
    expectedResult: '0x5ef83ad9',
  },

  // Case 2
  {
    name: 'TestJSONURL',
    dynamicName: 'TestJSONURL',
    key: '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
    returnGraphData: `0x00006f357c6a0020${mockJson.hash.slice(2)}697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264`,
    expectedResult: {
      verification: {
        method: 'keccak256(utf8)',
        data: mockJson.hash, // hash of stringified json
      },
      url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd', // same JSON url from LSP3Profile below
    },
  },

  // Case 3
  {
    name: 'TestAssetURL',
    dynamicName: 'TestAssetURL',
    key: '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
    keyType: 'Singleton',
    valueContent: 'AssetURL',
    valueType: 'bytes',
    returnGraphData: `0x00006f357c6a0020${mockJson.hash.slice(2)}697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264`,
    expectedResult: {
      verification: {
        method: 'keccak256(utf8)',
        data: mockJson.hash, // hash of address '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'
      },
      url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd', // FAKE. just used from above TODO: fix this is not an asset URL but a JSON url !!
    },
  },

  // Case 4
  {
    name: 'TestKeccak256',
    dynamicName: 'TestKeccak256',
    key: '0xd6c7198ea09a1d3357688e1dbdf0e07f6cfaf94359e0a4fc11e4f5f1d59d54f4',
    keyType: 'Singleton',
    valueContent: 'Keccak256',
    valueType: 'bytes32',
    returnGraphData:
      '0x4d75a97aff0964309140e9821514861e5ddcc827113b70a2b69db16dde0695dc',
    expectedResult:
      '0x4d75a97aff0964309140e9821514861e5ddcc827113b70a2b69db16dde0695dc', // 'mytestdata'
  },

  // Case 5
  {
    name: 'TestAddress',
    dynamicName: 'TestAddress',
    key: '0x7bf6ecfbf659a88c662d7f099c14e468610f786f6e29f0d346e44f772ef0d187',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'bytes',
    returnGraphData: '0x0c03fba782b07bcf810deb3b7f0595024a444f4e',
    expectedResult: '0x0C03fBa782b07bCf810DEb3b7f0595024A444F4e', // a real address
  },

  // Case 6
  {
    name: 'TestMarkdown',
    dynamicName: 'TestMarkdown',
    key: '0x328f991bde3a9d8c548b7b2dbc303a362202dddbcd33219650d85bedcd75ac9b',
    keyType: 'Singleton',
    valueContent: 'Markdown',
    valueType: 'bytes',
    returnGraphData: utf8ToHex(
      '# Testing markdown. \n Welcome to markdown **test**.',
    ),
    expectedResult: '# Testing markdown. \n Welcome to markdown **test**.',
  },

  // Case 7
  {
    name: 'LSP3Name',
    dynamicName: 'LSP3Name',
    key: '0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'string',
    returnGraphData: utf8ToHex('john-snow'),
    expectedResult: 'john-snow',
  },

  // Case 8
  {
    name: 'LSP3Profile',
    dynamicName: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'URL',
    valueType: 'bytes',
    returnGraphData: utf8ToHex(
      'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
    ),
    expectedResult: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
  },

  // Case 9
  {
    name: 'LSP12IssuedAssets[]',
    dynamicName: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
    returnGraphData: [
      leftPad(2, 32), // array length
      '0xc444009d38d3046bb0cf81fa2cd295ce46a67c78',
      '0x4febc3491230571f6e1829e46602e3b110215a2e',
    ],
    expectedResult: [
      '0xc444009d38d3046bb0cF81Fa2Cd295ce46A67C78',
      '0x4fEbC3491230571F6e1829E46602e3b110215A2E',
    ],
  },

  {
    name: 'LSP3IssuedAssetsWithEmptyValue[]',
    dynamicName: 'LSP3IssuedAssetsWithEmptyValue[]',
    key: '0xbcdf8aea8f803343f50b03205ac25188e17fc1f5e4e42245b0782f68786d9f92',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
    returnGraphData: [
      leftPad(2, 32), // array length
      '0x',
      '0x4febc3491230571f6e1829e46602e3b110215a2e',
    ],
    expectedResult: [null, '0x4fEbC3491230571F6e1829E46602e3b110215A2E'],
  },

  // // Case 10
  {
    name: 'TestObjArray[]',
    dynamicName: 'TestObjArray[]',
    key: '0x9985edaf12cbacf5ac7d6ed54f0445cc0ea56075aee9b9942e4ab3bf4239f950',
    keyType: 'Array',
    valueContent: 'JSONURL',
    valueType: 'bytes',
    // testing data
    // the full array of values
    returnGraphData: [
      leftPad(2, 32), // array length
      `0x00006f357c6a0020${mockJson.hash.slice(2)}697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264`,
      '0x00006f357c6a002081bd0b7ed5ac354abbf24619ce16933f00a4bdfa8fcaf3791d25f69b497abf88697066733a2f2f516d6245724b6833466a7378787878787878787878787878787878787878787878787878787639414a4a765a6264',
    ],
    expectedResult: [
      // This JSON from JSONURL above...
      {
        verification: {
          method: 'keccak256(utf8)',
          data: mockJson.hash, // hash of stringified json
        },
        url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd', // same JSON url from LSP3Profile below
      },
      // this JSON hash is = {"test1":"value1","test2":"value2","test3":"value3"}
      {
        verification: {
          method: 'keccak256(utf8)',
          data: mockJson2.hash, // hash of stringified json
        },
        url: 'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd', // dummy url
      },
    ],
  },
  // // Testing other valueTypes

  // Case 11
  {
    name: 'TestStringValueType',
    dynamicName: 'TestStringValueType',
    key: '0xc0929170bbaeb216f869c80a5c937f7a1c887a5a92262dac50313aef131f0c03',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'string',
    returnGraphData: utf8ToHex('Great-string'),
    expectedResult: 'Great-string',
  },

  // // Case 12
  {
    name: 'TestUintValueType',
    dynamicName: 'TestUintValueType',
    key: '0x61529294800f5739edc21a6cf8ba1bad3fd3e11d03d2ab5219ce9c0131b93f93',
    keyType: 'Singleton',
    valueContent: 'Number',
    valueType: 'uint256',
    returnGraphData:
      '0x0000000000000000000000000000000000000000000000000000000000000063',
    expectedResult: 99n,
  },

  // Case 13
  {
    name: 'TestNumberWithBytesValueType',
    dynamicName: 'TestNumberWithBytesValueType',
    key: '0x64a44e72c25d95851b1d449428d8d27093b2ef3e0b36a2b3497ae17edf979e61',
    keyType: 'Singleton',
    valueContent: 'Number',
    valueType: 'bytes',
    returnGraphData: '0x63',
    expectedResult: 99n,
  },

  // Case 14
  {
    name: 'TestStringWithBytesValueType',
    dynamicName: 'TestStringWithBytesValueType',
    key: '0x3ef4d417afa66557c9e1463723b391a518eee0c61d29be4e10882999c7848041',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'bytes',
    returnGraphData: utf8ToHex('Ok this is a string stored as bytes...'),
    expectedResult: 'Ok this is a string stored as bytes...',
  },

  // Testing array valueTypes
  // Case 15
  {
    name: 'TestStringValueTypeArray',
    dynamicName: 'TestStringValueTypeArray',
    key: '0xd7a8f1af4a0d9de8d17c177ff06f1689c0c3f1310edbbe53733da0b084ccff18',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'string[]',
    returnGraphData: encodeParameter('bytes[]', [
      utf8ToHex('apple sauce'),
      utf8ToHex('butter chicken'),
    ]),
    expectedResult: ['apple sauce', 'butter chicken'],
  },

  // Case 16
  {
    name: 'TestBytesValueTypeArray',
    dynamicName: 'TestBytesValueTypeArray',
    key: '0xd6b3622ec62ae4459c0276bd5e2e26011201fada1cbc2b33283e9c20495c05fe',
    keyType: 'Singleton',
    valueContent: 'String',
    valueType: 'bytes[]',
    returnGraphData: encodeParameter('bytes[]', [
      utf8ToHex('apple sauce'),
      utf8ToHex('butter chicken'),
    ]),
    expectedResult: ['apple sauce', 'butter chicken'],
  },

  // Case 17
  {
    name: 'TestAddressValueTypeArray',
    dynamicName: 'TestAddressValueTypeArray',
    key: '0xe45f3de809830d5ac3aeab862200fc670391fcb99018dcd2522fee7cf07f93ee',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address[]',
    returnGraphData: encodeParameter('address[]', [
      '0xCE3e75A43B0A29292219926EAdC8C5585651219C',
      '0xba61a0b24a228807f23b46064773d28fe51da81c',
    ]),
    expectedResult: [
      '0xCE3e75A43B0A29292219926EAdC8C5585651219C',
      '0xba61a0b24a228807f23B46064773D28Fe51dA81C',
    ],
  },

  // // Case 18
  {
    name: 'TestUintValueTypeArray',
    dynamicName: 'TestUintValueTypeArray',
    key: '0xdaa41a5e1acc41087359e61588e80bf0b7f1d96063b98bdff73b4ce3a645b40b',
    keyType: 'Singleton',
    valueContent: 'Number',
    valueType: 'uint256[]',
    returnGraphData: encodeParameter('uint256[]', [123, 456]),
    expectedResult: [
      123, // (firefox metamask key)
      456, // {firefox metamask key}
    ],
  },

  // Case 19
  {
    name: 'TestBytes32ValueTypeArray',
    dynamicName: 'TestBytes32ValueTypeArray',
    key: '0x7e2458b2b22ff4357510c3491b7c041df2ee4f11ba4d6f4f4e34101fc2645a97',
    keyType: 'Singleton',
    valueContent: 'Keccak256',
    valueType: 'bytes32[]',
    returnGraphData: encodeParameter('bytes32[]', [
      '0xe5d35cae7c9db9879eb8a205baa046ad99503414d6a55eb6725494a4254a6d3f',
      '0x828e919feac2ec05939abd5d221692fbe6bac5667ba5af5d191df1f7ecb1ac21',
    ]),
    expectedResult: [
      '0xe5d35cae7c9db9879eb8a205baa046ad99503414d6a55eb6725494a4254a6d3f',
      '0x828e919feac2ec05939abd5d221692fbe6bac5667ba5af5d191df1f7ecb1ac21',
    ],
  },

  // // Case 20
  {
    name: 'TestURLStringValueTypeArray',
    dynamicName: 'TestURLStringValueTypeArray',
    key: '0x1a9818703b62d00000bd3e8c7499296d42966619cd735a92eac7488de8881bb8',
    keyType: 'Singleton',
    valueContent: 'URL',
    valueType: 'string[]',
    returnGraphData: encodeParameter('string[]', [
      'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
      'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
    ]),
    expectedResult: [
      'ipfs://QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd',
      'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
    ],
  },

  // Case 21
  {
    name: 'TestHashKey',
    dynamicName: 'TestHashKey',
    key: '0xed579debad05d91a79b46589987171dfce1c8ffa8b1d8c1ddc851cc104ea6029',
    keyType: 'Singleton',
    valueContent:
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658', // keccak hash of 'test'
    valueType: 'bytes32',
    returnGraphData:
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
    expectedResult:
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658', // 'mytestdata'
  },

  {
    name: 'MyCoolAddress:<address>',
    dynamicName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
    key: '0x22496f48a493035f0ab40000cafecafecafecafecafecafecafecafecafecafe',
    dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
    keyType: 'Mapping',
    valueContent: '0x5ef83ad9',
    valueType: 'bytes',
    returnGraphData: '0x5ef83ad9',
    expectedResult: '0x5ef83ad9',
  },
  {
    name: 'AddressPermissions:Permissions:<address>',
    dynamicName:
      'AddressPermissions:Permissions:0xcafecafecafecafecafecafecafecafecafecafe',
    key: '0x4b80742de2bf82acb3630000cafecafecafecafecafecafecafecafecafecafe',
    dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
    keyType: 'MappingWithGrouping',
    valueContent: '0x5ef83ad9',
    valueType: 'bytes',
    returnGraphData: '0x5ef83ad9',
    expectedResult: '0x5ef83ad9',
  },
  {
    name: 'Hello:<address>',
    dynamicName: 'Hello:0xcafecafecafecafecafecafecafecafecafecafe',
    key: '0x06b3dfaec148fb1bb2b00000cafecafecafecafecafecafecafecafecafecafe', // encoded for cafecafe... address - parameters are bellow
    dynamicKeyParts: ['0xcafecafecafecafecafecafecafecafecafecafe'],
    keyType: 'Singleton',
    valueContent: 'AssetURL',
    valueType: 'bytes',
    returnGraphData: `0x6f357c6a${mockJson.hash.slice(2)}697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264`,
    expectedResult: {
      verification: {
        method: 'keccak256(utf8)',
        data: mockJson.hash, // hash of address '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'
      },
      url: 'ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd', // FAKE. just used from above TODO: fix this is not an asset URL but a JSON url !!
    },
  },
  {
    name: 'TestStringWithBytes4ValueContent',
    dynamicName: 'TestStringWithBytes4ValueContent',
    key: '0xb61b0a1d86687ef022781d2698d5e0221997458e3a720cded0b8f165a029d3c5',
    keyType: 'Singleton',
    valueContent: 'Bytes4',
    valueType: 'bytes',
    expectedResult: '0xcafecafe',
    returnGraphData: '0xcafecafe',
  },
  {
    name: 'TestStringWithBytes32ValueType',
    dynamicName: 'TestStringWithBytes32ValueType',
    key: '0xbaced8d1d0b02d5f412674cac7ad60f0f3e8ae29f2b8d4ad463fa1f5fc103d4d',
    keyType: 'Singleton',
    valueContent: 'Bytes32',
    valueType: 'bytes32',
    expectedResult:
      '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
    returnGraphData:
      '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
  },
  {
    name: 'TestStringWithBytes4ValueType',
    dynamicName: 'TestStringWithBytes4ValueType',
    key: '0x1b92e269c7ce7fc16e625562aa588403fe603edb4e2740b0558ed44faa3c1728',
    keyType: 'Singleton',
    valueContent: 'Bytes4',
    valueType: 'bytes4',
    expectedResult: '0xcafecafe',
    returnGraphData: '0xcafecafe',
  },

  // Nested array tests
  // NOTE: The below are failing on decode all (no source loops, or individual) with data out-of-bounds
  // Case 22
  // {
  //   "name": "TestNestedArrayStringArray[]",
  //   "key": "0xe4d20147947de3d1b329a854199dbf938a8f8c375c411fa86df1820d4cca043b",
  //   "keyType": "Array",
  //   "valueContent": "String",
  //   "valueType": "string[]",
  //   // testing data
  //   // the full array of values
  //   "returnGraphData": [
  //     "0x0000000000000000000000000000000000000000000000000000000000000003", // array length
  //     "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000a737472696e672d6f6e6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a737472696e672d74776f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c737472696e672d74687265650000000000000000000000000000000000000000",
  //     "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b737472696e672d666f7572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b737472696e672d66697665000000000000000000000000000000000000000000",
  //     "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a737472696e672d73697800000000000000000000000000000000000000000000",
  //   ],
  //   "expectedResult": [
  //     [ 'string-one', 'string-two', 'string-three' ],
  //     [ 'string-four', 'string-five', ],
  //     [ 'string-six' ]
  //   ]

  // },

  // Case 23
  // {
  //   "name": "TestNestedArrayObjArray[]",
  //   "key": "0xf9a149b854fc24a5b7c91cce364e1d8306c7d78438a7fdc5c729c394320ebcbe",
  //   "keyType": "Array",
  //   "valueContent": "JSONURL",
  //   "valueType": "bytes[]",
  //   // testing data
  //   // the full array of values
  //   "returnGraphData": [
  //     "0x0000000000000000000000000000000000000000000000000000000000000003", // array length
  //     "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a667878780000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ab0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7697066733a2f2f51773039656a66646b6a667979790000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ad74263f10a321b733c6dc6aea656e383ce31d653814d1bcb35630729d2bf993c697066733a2f2f51773039656a66646b6a667a7a7a00000000000000",
  //     "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a667878780000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ab0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7697066733a2f2f51773039656a66646b6a6679797900000000000000",
  //     "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a6678787800000000000000",
  //   ],
  //   "expectedResult": [
  //     // This JSON from JSONURL above...
  //     [

  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xcadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88", // hash of stringified json = {test1:'value1',test2:'value2'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfxxx" // dummy url
  //       },

  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xb0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7", // hash of stringified json = {test3:'value3',test4:'value4'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfyyy" // dummy url
  //       },
  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xd74263f10a321b733c6dc6aea656e383ce31d653814d1bcb35630729d2bf993c", // hash of stringified json = {test5:;value5',test6:'value6'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfzzz" // dummy url
  //       }
  //       // encoded array: 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a667878780000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ab0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7697066733a2f2f51773039656a66646b6a667979790000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ad74263f10a321b733c6dc6aea656e383ce31d653814d1bcb35630729d2bf993c697066733a2f2f51773039656a66646b6a667a7a7a00000000000000

  //     ],
  //     [

  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xcadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88", // hash of stringified json = {test1:'value1',test2:'value2'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfxxx" // dummy url
  //       },

  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xb0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7", // hash of stringified json = {test3:'value3',test4:'value4'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfyyy" // dummy url
  //       },
  //       // encoded: 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a667878780000000000000000000000000000000000000000000000000000000000000000000000000000396f357c6ab0bf98bf562a0191622eb530e185cff88dc086b92faa27cb535513a62591a5f7697066733a2f2f51773039656a66646b6a6679797900000000000000

  //     ],
  //     [

  //       {
  //         "hashFunction": "keccak256(utf8)",
  //         "jsonHash": "0xcadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88", // hash of stringified json = {test1:'value1',test2:'value2'}
  //         "jsonURL": "ipfs://Qw09ejfdkjfxxx" // dummy url
  //       },
  //       // encoded: 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000396f357c6acadb1115f687654d9b8077b1c0b8553f294e54862cf17e6afc0cade73dc35c88697066733a2f2f51773039656a66646b6a6678787800000000000000

  //     ]
  //   ]

  // },
  // Case xx
  // NOTE: This test can not be made to be symmetrical
  // {
  //   "name": "TestNotSetArray[]",
  //   "key": "0xa90924b9b409ab609ed5136d82249ce17851a12b49bbb6f20fdedd6b3a2be61b",
  //   "keyType": "Array",
  //   "valueContent": "Address",
  //   "valueType": "address",
  //   // testing data
  //   // the full array of values
  //   "returnRawData": [
  //     "0x", // array length
  //   ],
  //   "returnGraphData": [
  //     "0x", // array length
  //   ],
  //   "expectedResult" :[
  //   ]

  // },
];
