/*
    This file is part of @erc725/erc725.js.
    @erc725/erc725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    @erc725/erc725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/encodeKeyName.ts
 * @author Hugo Masclet <@Hugoo>
 * @date 2021
 */

import assert from 'assert';

import {
  encodeDynamicKeyPart,
  encodeKeyName,
  generateDynamicKeyName,
  isDynamicKeyName,
} from './encodeKeyName';
import { keccak256, toBytes } from 'viem';

describe('encodeKeyName', () => {
  const testCases: {
    keyName: string;
    expectedKey: string;
    dynamicKeyParts?: string | string[];
  }[] = [
    {
      keyName: 'MyKeyName',
      expectedKey: keccak256(toBytes('MyKeyName')),
    },
    {
      keyName: 'LSP12IssuedAssets[]',
      expectedKey:
        '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    },
    {
      keyName: 'SupportedStandards:LSP3Profile',
      expectedKey:
        '0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347',
    },
    {
      keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
      expectedKey:
        '0x22496f48a493035f0ab40000cafecafecafecafecafecafecafecafecafecafe',
    },
    {
      keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
      expectedKey:
        '0x22496f48a493035f0ab40000cafecafecafecafecafecafecafecafecafecafe',
    },
    {
      keyName:
        'LSP12IssuedAssetsMap:0xb74a88C43BCf691bd7A851f6603cb1868f6fc147',
      expectedKey:
        '0x74ac2555c10b9349e78f0000b74a88c43bcf691bd7a851f6603cb1868f6fc147',
    },
    {
      keyName:
        'AddressPermissions:Permissions:0xcafecafecafecafecafecafecafecafecafecafe',
      expectedKey:
        '0x4b80742de2bf82acb3630000cafecafecafecafecafecafecafecafecafecafe',
    },
    {
      keyName:
        'AddressPermissions:Permissions:0xcafecafecafecafecafecafecafecafecafecafe',
      expectedKey:
        '0x4b80742de2bf82acb3630000cafecafecafecafecafecafecafecafecafecafe',
    },
    // DYNAMIC KEYS
    // Mapping
    {
      keyName: 'MyDynamicKey:<address>',
      expectedKey:
        '0xd1b2917d26eeeaad5b980000cafecafecafecafecafecafecafecafecafecafe',
      // |-keccak256 bytes10--||--||---bytes20: the address---------------|
      dynamicKeyParts: ['0xcafecafecafecafecafecafecafecafecafecafe'], // as array
    },
    {
      keyName: 'MyDynamicKey:<address>',
      expectedKey:
        '0xd1b2917d26eeeaad5b980000cafecafecafecafecafecafecafecafecafecafe',
      dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe', // as string
    },
    {
      keyName: 'MyDynamicKey:<address>',
      expectedKey:
        '0xd1b2917d26eeeaad5b980000cafecafecafecafecafecafecafecafecafecafe',
      dynamicKeyParts: 'cafecafecafecafecafecafecafecafecafecafe', // without 0x prefix
    },
    {
      keyName: 'MyKeyName:<string>',
      expectedKey:
        '0x35e6950bc8d21a1699e5000075060e3cd7d40450e94d415fb5992ced9ad8f058',
      // |--keccak256 bytes12-||--||---bytes20: keccak256()---------------|
      dynamicKeyParts: 'MyMapName',
    },
    {
      keyName: 'MyKeyName:<uint32>',
      expectedKey:
        '0x35e6950bc8d21a1699e5000000000000000000000000000000000000f342d33d',
      // |--keccak256 bytes12-||--||---bytes20: keccak256()---------------|
      dynamicKeyParts: '4081242941',
    },
    {
      keyName: 'MyKeyName:<uint32>',
      expectedKey:
        '0x35e6950bc8d21a1699e5000000000000000000000000000000000000f342d33d',
      // |--keccak256 bytes12-||--||---bytes20: keccak256()---------------|
      dynamicKeyParts: '0xf342d33d',
    },
    {
      keyName: 'MyKeyName:<bytes4>',
      expectedKey:
        '0x35e6950bc8d21a1699e50000abcd123400000000000000000000000000000000',
      // |--keccak256 bytes12-||--||---bytes20: keccak256()---------------|
      dynamicKeyParts: '0xabcd1234',
    },
    {
      keyName: 'MyKeyName:<bytes32>',
      expectedKey:
        '0x35e6950bc8d21a1699e50000aaaabbbbccccddddeeeeffff1111222233334444',
      // |--keccak256 bytes12-||--||---bytes20: keccak256()---------------|
      dynamicKeyParts:
        '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
    },
    {
      keyName: 'MyKeyName:<bool>',
      expectedKey:
        '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000001',
      // |--keccak256 bytes12-||--||--------------------------------------|
      dynamicKeyParts: 'true',
    },
    {
      keyName: 'MyKeyName:<bool>',
      expectedKey:
        '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000000',
      // |--keccak256 bytes12-||--||--------------------------------------|
      dynamicKeyParts: 'false',
    },
    // MappingWithGrouping
    {
      keyName: 'MyKeyName:MyMapName:<address>',
      expectedKey:
        '0x35e6950bc8d275060e3c0000cafecafecafecafecafecafecafecafecafecafe',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: '0xcafecafecafecafecafecafecafecafecafecafe',
    },
    {
      keyName: 'MyKeyName:MyMapName:<address>',
      expectedKey:
        '0x35e6950bc8d275060e3c00004c6f947ae67f572afa4ae0730947de7c874f95ef',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: '0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef', // address is checksummed -> expected key should be lowercase
    },
    {
      keyName: 'MyKeyName:<bytes2>:<uint32>',
      expectedKey:
        '0x35e6950bc8d2ffff0000000000000000000000000000000000000000f342d33d',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: ['ffff', '4081242941'],
    },
    {
      keyName: 'MyKeyName:<bytes2>:<uint32>',
      expectedKey:
        '0x35e6950bc8d2ffff0000000000000000000000000000000000000000f342d33d',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: ['ffff', '0xf342d33d'],
    },
    {
      keyName: 'MyKeyName:<address>:<address>',
      expectedKey:
        '0x35e6950bc8d2abcdef110000cafecafecafecafecafecafecafecafecafecafe',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: [
        '0xabcdef11abcdef11abcdef11abcdef11ffffffff',
        '0xcafecafecafecafecafecafecafecafecafecafe',
      ],
    },
    {
      keyName: 'MyKeyName:MyMapName:<bytes32>',
      expectedKey:
        '0x35e6950bc8d275060e3c0000aaaabbbbccccddddeeeeffff1111222233334444',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: ['0xaaaabbbbccccddddeeeeffff1111222233334444'],
    },
    {
      keyName: 'MyKeyName:<bytes32>:<bool>',
      expectedKey:
        '0x35e6950bc8d2aaaabbbb00000000000000000000000000000000000000000001',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: [
        '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
        'true',
      ],
    },
    {
      keyName: 'MyKeyName:<bytes32>:MyMapName',
      expectedKey:
        '0x35e6950bc8d2aaaabbbb000075060e3cd7d40450e94d415fb5992ced9ad8f058',
      // |-- bytes6 --||------||--||------------ bytes20 -----------------|
      dynamicKeyParts: [
        '0xaaaabbbbccccddddeeeeffff111122223333444455556666777788889999aaaa',
      ],
    },
  ];

  testCases.forEach((testCase) => {
    it(`encodes ${testCase.keyName} key name correctly`, () => {
      assert.deepStrictEqual(
        encodeKeyName(testCase.keyName, testCase.dynamicKeyParts),
        testCase.expectedKey,
      );
    });
  });

  it('throws if trying to encode a dynamic key without any variable', () => {
    assert.throws(() => encodeKeyName('MyDynamicKey:<address>'));
  });
  it('throws if trying to encode a dynamic key of type: Mapping with more or less than 1 variable', () => {
    assert.throws(() => encodeKeyName('MyDynamicKey:<address>', []));
    assert.throws(() =>
      encodeKeyName('MyDynamicKey:<address>', [
        '0xcafecafecafecafecafecafecafecafecafecafe',
        'extraVariable',
      ]),
    );
  });

  it('throws if trying to encode a dynamic key of type: MappingWithGrouping with more wrong number of variables', () => {
    assert.throws(() => encodeKeyName('MyDynamicKey:Grouping:<address>', []));
    assert.throws(() =>
      encodeKeyName('MyDynamicKey:Group:<address>', [
        '0xcafecafecafecafecafecafecafecafecafecafe',
        'extraVariable',
      ]),
    );
    assert.throws(() =>
      encodeKeyName('MyDynamicKey:<string>:<address>', ['variable1']),
    );
    assert.throws(() =>
      encodeKeyName(
        'MyDynamicKey:<string>:0xcafecafecafecafecafecafecafecafecafecafe',
        ['variable1', 'variable2'],
      ),
    );
  });

  it('throws if a dynamic key is given without dynamicKeyParts', () => {
    assert.throws(() => encodeKeyName('MyDynamicKey:<address>'));
  });
});

describe('isDynamicKeyName', () => {
  const testCases = [
    {
      keyName: 'AddressPermissions[]',
      isDynamicKeyName: false,
    },
    {
      keyName: 'LSP4TokenSymbol',
      isDynamicKeyName: false,
    },
    {
      keyName: 'LSP5ReceivedAssetsMap:<address>',
      isDynamicKeyName: true,
    },
    {
      keyName: 'AddressPermissions:AllowedStandards:<address>',
      isDynamicKeyName: true,
    },
    {
      keyName: 'AddressPermissions:<string>:<address>',
      isDynamicKeyName: true,
    },
    {
      keyName: '<string>',
      isDynamicKeyName: true,
    },
  ];

  testCases.forEach((testCase) => {
    it(`detects ${
      testCase.isDynamicKeyName ? 'dynamic' : 'non-dynamic'
    } key name: ${testCase.keyName} correctly`, () => {
      assert.deepStrictEqual(
        isDynamicKeyName(testCase.keyName),
        testCase.isDynamicKeyName,
      );
    });
  });
});

describe('encodeDynamicKeyPart', () => {
  const testCases = [
    {
      type: '<string>',
      value: 'HelloHowAreYou',
      bytes: 20,
      expectedEncoding: '81ca1f336033f64c1b23b11b227c3ba7e87f3f73',
    },
    {
      type: '<bool>',
      value: 'true',
      bytes: 4,
      expectedEncoding: '00000001',
    },
    {
      type: '<bool>',
      value: 'false',
      bytes: 4,
      expectedEncoding: '00000000',
    },
    {
      type: '<address>',
      value: '0x7f268357a8c2552623316e2562d90e642bb538e5',
      bytes: 5,
      expectedEncoding: '7f268357a8', // right-cut if larger than bytes
    },
    {
      type: '<address>',
      value: '0x1FdCD4dD0E164bCbd32DbF983c9903F4eD10356d',
      bytes: 5,
      expectedEncoding: '1FdCD4dD0E'.toLowerCase(), // should return lowercase
    },
    {
      type: '<address>',
      value: '7f268357a8c2552623316e2562d90e642bb538e5',
      bytes: 21,
      expectedEncoding: '007f268357a8c2552623316e2562d90e642bb538e5', // left padded
    },
    {
      type: '<uint32>',
      value: '4081242941',
      bytes: 20,
      expectedEncoding: '00000000000000000000000000000000f342d33d', // left padded
    },
    {
      type: '<int32>',
      value: '4081242941',
      bytes: 20,
      expectedEncoding: '00000000000000000000000000000000f342d33d', // left padded
    },
    {
      type: '<uint32>',
      value: '0xf342d33d',
      bytes: 20,
      expectedEncoding: '00000000000000000000000000000000f342d33d', // left padded
    },
    {
      type: '<uint32>',
      value: '4081242941',
      bytes: 2,
      expectedEncoding: 'd33d', // left cut
    },
    {
      type: '<int32>',
      value: '4081242941',
      bytes: 2,
      expectedEncoding: 'd33d', // left cut
    },
    {
      type: '<uint32>',
      value: '0xf342d33d',
      bytes: 2,
      expectedEncoding: 'd33d', // left cut
    },
    // TODO: add intM cases
    {
      type: '<bytes8>',
      value: '0xd1b2917d26eeeaad',
      bytes: 12,
      expectedEncoding: 'd1b2917d26eeeaad00000000', // right padded/cut
    },
    {
      type: '<bytes8>',
      value: 'd1b2917d26eeeaad', // test without 0x prefix
      bytes: 12,
      expectedEncoding: 'd1b2917d26eeeaad00000000', // right padded/cut
    },
    {
      type: '<bytes8>',
      value: '0xd1b2917d26eeeaad',
      bytes: 4,
      expectedEncoding: 'd1b2917d', // right padded/cut
    },
  ];

  testCases.forEach((testCase) => {
    it(`encodes: ${testCase.value} of type: ${testCase.type} correctly`, () => {
      assert.deepStrictEqual(
        encodeDynamicKeyPart(testCase.type, testCase.value, testCase.bytes),
        testCase.expectedEncoding,
      );
    });
  });

  it('throws if <bytesM> is called with non hex values', () => {
    assert.throws(() =>
      encodeDynamicKeyPart('<bytes8>', 'thisisnotanhexstr', 20),
    );
  });

  // Since we're allowing things to be truncated and right and left padded
  // This doesn't seem an ideal test case.
  it('throws if <bytesM> is called with wrong number of bytes', () => {
    assert.throws(() =>
      encodeDynamicKeyPart('<bytes8>', '0xd1b2917d26eeeaad1234', 20),
    );
  });

  it('throws if <uintN> is called with too large of a number', () => {
    assert.throws(() => encodeDynamicKeyPart('<uint8>', '0x100', 20));
  });

  it('throws if <intN> is is used because intN is not supported (positive number)', () => {
    assert.throws(() => encodeDynamicKeyPart('<int8>', '0x100', 20));
  });

  it('throws if <intN> is is used because intN is not supported (negative number)', () => {
    assert.throws(() => encodeDynamicKeyPart('<int8>', '0xFFFFFFFF100', 20));
  });
});

describe('generateDynamicKeyName', () => {
  const testCases = [
    {
      keyName: 'MyKey:<string>',
      dynamicKeyParts: 'HelloHowAreYou',
      expectedKeyName: 'MyKey:HelloHowAreYou',
    },
    {
      keyName: 'MyKey:Grouping:<string>',
      dynamicKeyParts: 'HelloHowAreYou',
      expectedKeyName: 'MyKey:Grouping:HelloHowAreYou',
    },

    {
      keyName: 'MyKey:<bytes4>:<address>',
      dynamicKeyParts: [
        '0x11223344',
        '0x2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac',
      ],
      expectedKeyName:
        'MyKey:0x11223344:0x2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac',
    },
    {
      keyName: 'Addresses:<address>',
      dynamicKeyParts: [
        '0x2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac', // without 0x in the address
      ],
      expectedKeyName: 'Addresses:0x2ab3903c6e5815f4bc2a95b7f3b22b6a289bacac',
    },
  ];

  testCases.forEach((testCase) => {
    it(`generates key name: ${testCase.keyName} correctly`, () => {
      assert.deepStrictEqual(
        generateDynamicKeyName(testCase.keyName, testCase.dynamicKeyParts),
        testCase.expectedKeyName,
      );
    });
  });

  it('throws if encoding with wrong number of dynamic values', () => {
    assert.throws(() =>
      generateDynamicKeyName('Addresses:<bytes4>:<address>', '0x11223344'),
    );
  });
});
