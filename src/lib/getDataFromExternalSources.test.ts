/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import { getDataFromExternalSources } from './getDataFromExternalSources';
import { DecodeDataOutput } from '../types/decodeData';

const IPFS_GATEWAY_MOCK = 'https://mock-ipfs.mock/ipfs/';

describe('getDataFromExternalSources', () => {
  it('should not throw if the value of a JSONURL/ASSETURL is null', async () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      },
    ];

    const dataFromChain: DecodeDataOutput[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        // @ts-ignore
        value: null,
      },
    ];

    expect(async () => {
      await getDataFromExternalSources(
        schemas,
        dataFromChain,
        IPFS_GATEWAY_MOCK,
      );
    }).to.not.throw();
  });
});
