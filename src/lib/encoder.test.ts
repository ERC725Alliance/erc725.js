import assert from 'assert';
import { keccak256, utf8ToHex } from 'web3-utils';
import { valueContentEncodingMap } from './encoder';
import { ERC725 } from '../index';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { hashData } from './utils';
import {
  SUPPORTED_HASH_FUNCTION_HASHES,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from './constants';
import { Schema } from '../../generatedSchema';

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
    const hashFunction = SUPPORTED_HASH_FUNCTION_HASHES.HASH_KECCAK256_UTF8; // keccak256(utf8)
    const urlHash = utf8ToHex(dataToEncode.url).substring(2);
    const jsonDataHash = keccak256(JSON.stringify(dataToEncode.json)).substring(
      2,
    );
    assert.deepStrictEqual(result, hashFunction + jsonDataHash + urlHash);
  });

  it('throws when the hashFunction of JSON of JSONURL to encode is not keccak256(utf8)', () => {
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

  it('throws when JSONURL encode a JSON without json or hash key', () => {
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

  it('should encode JSON properly', () => {
    const schema: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    const myERC725 = new ERC725<Schema>(schema);

    const json = {
      name: 'rryter',
      description: 'Web Developer located in Switzerland.',
      profileImage: [
        {
          width: 1350,
          height: 1800,
          hashFunction: 'keccak256(bytes)',
          hash: '0x229b60ea5b58e1ab8e6f1063300be110bb4fa663ba75d3814d60104ac6b74497',
          url: 'ipfs://Qmbv9j6iCDDYJ1NXHTZnNHDJ6qaaKkZsf79jhUMFAXcfDR',
        },
        {
          width: 768,
          height: 1024,
          hashFunction: 'keccak256(bytes)',
          hash: '0x320db57770084f114988c8a94bcf219ca66c69421590466a45f382cd84995c2b',
          url: 'ipfs://QmS4m2LmRpay7Jij4DCpvaW5zKZYy43ATZdRxUkUND6nG3',
        },
        {
          width: 480,
          height: 640,
          hashFunction: 'keccak256(bytes)',
          hash: '0x8dff218f989e8c3e86950401438df313e609486eae8ff470f3dccb4bed665631',
          url: 'ipfs://QmXuzWADWcfLCW6ur9FVpMkuLbKCMpeGJuuJKwQcr4SHWy',
        },
        {
          width: 240,
          height: 320,
          hashFunction: 'keccak256(bytes)',
          hash: '0xe9a2ef4b92b5050092df676e0c2c90eab7dd8750b6457f8add3507d9d4d4b541',
          url: 'ipfs://QmekahsQRQgiHaj12TRrn29Ux7DtdzcpFXP7vr94gKaAHo',
        },
        {
          width: 135,
          height: 180,
          hashFunction: 'keccak256(bytes)',
          hash: '0x42eb23c686b95da5d2e36eaec3d6a3db7e7e50d9ed79c7662f04d7c918e70980',
          url: 'ipfs://QmRbYFmXDKvea6XHP4yXQu6hmmx9WeZymNkdgarmXu9rVG',
        },
      ],
      backgroundImage: [
        {
          width: 1024,
          height: 768,
          hashFunction: 'keccak256(bytes)',
          hash: '0xbe2d39fe1e0b1911155afc74010db3483528a2b645dea8fcf47bdc34147769be',
          url: 'ipfs://QmQ6ujfKSc91F44KtMe6WRTSCXoSdCjomQUy8hCUxHMr28',
        },
        {
          width: 1024,
          height: 768,
          hashFunction: 'keccak256(bytes)',
          hash: '0xbe2d39fe1e0b1911155afc74010db3483528a2b645dea8fcf47bdc34147769be',
          url: 'ipfs://QmQ6ujfKSc91F44KtMe6WRTSCXoSdCjomQUy8hCUxHMr28',
        },
        {
          width: 640,
          height: 480,
          hashFunction: 'keccak256(bytes)',
          hash: '0xb115f2bf09994e79726db27a7b8d5a0de41a5b81d11b59b3038fa158718266ff',
          url: 'ipfs://QmakaRZxJMMqwQFJY98J3wjbqYVDnaSZ9sEqBF9iMv3GNX',
        },
        {
          width: 320,
          height: 240,
          hashFunction: 'keccak256(bytes)',
          hash: '0x7bb445a253370e6e99787cfdd51f39e1c72e78519232bbbc73f5628e212391d2',
          url: 'ipfs://QmQWnRTrv5AmWLnJXH7LrJddnMALiWU28AZKW4s7EGozBE',
        },
        {
          width: 180,
          height: 135,
          hashFunction: 'keccak256(bytes)',
          hash: '0x22833de71837428db3f2f0f4d5237c5aa7b99a1069f545abd6505a8d2c4a61a3',
          url: 'ipfs://QmSUyD96J4VFg9QoQGXBBiPrBdJddzmDUKETnHAdyqmDQQ',
        },
      ],
      tags: ['public profile'],
      links: [],
    };

    const encodedData = myERC725.encodeData({
      LSP3Profile: {
        json,
        url: 'ifps://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
      },
    });

    const decodedData = myERC725.decodeData({
      LSP3Profile: encodedData.LSP3Profile.value,
    });

    assert.deepStrictEqual(
      decodedData.LSP3Profile.url,
      'ifps://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D',
    );
    assert.deepStrictEqual(
      decodedData.LSP3Profile.hash,
      hashData(json, SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8),
    );
    assert.deepStrictEqual(
      decodedData.LSP3Profile.hashFunction,
      SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8,
    );
  });
});
