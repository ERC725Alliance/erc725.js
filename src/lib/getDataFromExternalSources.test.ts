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
