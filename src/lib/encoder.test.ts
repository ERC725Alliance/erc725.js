import assert from 'assert';
import { keccak256, utf8ToHex } from 'web3-utils';
import { valueContentEncodingMap } from './encoder';

describe('#JSONURL encode', () => {
  it('encodes and hashes JSON data', () => {
    const dataToEncode = {
      url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
      json: {
        myProperty: 'is a string',
        anotherProperty: {
          sdfsdf: 123456,
        },
      },
    };
    const result = valueContentEncodingMap.JSONURL.encode(dataToEncode);

    // https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl
    const hashFunction = '0x6f357c6a';
    const urlHash = utf8ToHex(dataToEncode.url).substring(2);
    const jsonDataHash = keccak256(JSON.stringify(dataToEncode.json)).substring(
      2,
    );
    assert.deepStrictEqual(result, hashFunction + jsonDataHash + urlHash);
  });

  it('JSONURL with superfluous hashFunction argument (when we hash the json ourselves)', () => {
    assert.throws(
      () => {
        valueContentEncodingMap.JSONURL.encode({
          // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
          hashFunction: 'whatever',
          url: 'https://file-desination.com/file-name',
          json: {
            test: true,
          },
        });
      },
      (error) =>
        error.message ===
        'When passing in the `json` property, we use "keccak256(utf8)" as a hashingFunction at all times',
    );
  });

  it('JSONURL without json / hash should throw an error', () => {
    assert.throws(
      () => {
        valueContentEncodingMap.JSONURL.encode({
          // @ts-ignore to still run the test (incase someone is using the library in a non TS environment)
          hashFunction: 'keccak256(utf8)',
          url: 'https://file-desination.com/file-name',
        });
      },
      (error) =>
        error.message ===
        'You have to provide either the hash or the json via the respective properties',
    );
  });
});
