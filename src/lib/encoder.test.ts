import assert from 'assert';
import { valueContentEncodingMap } from './encoder';

describe('#encodeData', () => {
  it('JSONURL and hash json ourselves', () => {
    const result = valueContentEncodingMap.JSONURL.encode({
      url: 'https://file-desination.com/file-name',
      json: {
        test: true,
      },
    });
    assert.deepStrictEqual(
      result,
      '0x6f357c6a35709f35a87bedba632da6c0c99c927a532a27aee80f24556a7ba06723dd3c0168747470733a2f2f66696c652d646573696e6174696f6e2e636f6d2f66696c652d6e616d65',
    );
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
