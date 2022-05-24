import assert from 'assert';
import { keccak256 } from 'web3-utils';

import { encodeKeyName } from './encodeKeyName';

describe('encodeKeyName', () => {
  const testCases: { keyName: string; key: string }[] = [
    {
      keyName: 'MyKeyName',
      key: keccak256('MyKeyName'),
    },
    {
      keyName: 'LSP3IssuedAssets[]',
      key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    },
    {
      keyName: 'SupportedStandards:LSP3UniversalProfile',
      key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6',
    },
    {
      keyName: 'MyCoolAddress:0xcafecafecafecafecafecafecafecafecafecafe',
      key: '0x22496f48a493035f00000000cafecafecafecafecafecafecafecafecafecafe',
    },
    {
      keyName:
        'AddressPermissions:Permissions:cafecafecafecafecafecafecafecafecafecafe',
      key: '0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe',
    },
  ];

  testCases.forEach((testCase) => {
    it(`encodes ${testCase.keyName} key name correctly`, () => {
      assert.deepStrictEqual(encodeKeyName(testCase.keyName), testCase.key);
    });
  });
});
