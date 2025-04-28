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

import { expect } from 'chai'
import * as sinon from 'sinon'

import type { ERC725JSONSchema } from '../types/ERC725JSONSchema'

import { getDataFromExternalSources } from './getDataFromExternalSources'
import type { DecodeDataOutput } from '../types/decodeData'
import { keccak256 } from 'web3-utils'

const IPFS_GATEWAY_MOCK = 'https://mock-ipfs.mock/ipfs/'

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
    ]

    const dataFromChain: DecodeDataOutput[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        // @ts-ignore
        value: null,
      },
    ]

    expect(async () => {
      await getDataFromExternalSources(
        schemas,
        dataFromChain,
        IPFS_GATEWAY_MOCK
      )
    }).to.not.throw()
  })

  it("should return the right data when the schema's valueContent is VerifiableURI", async () => {
    const schema: ERC725JSONSchema = {
      name: 'LSP3Profile',
      key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'VerifiableURI',
    }

    const jsonResult = { LSP3Profile: { name: 'Test', description: 'Cool' } }

    const dataFromChain: DecodeDataOutput[] = [
      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        value: {
          verification: {
            data: keccak256(JSON.stringify(jsonResult)),
            method: 'keccak256(utf8)',
          },
          url: 'ipfs://QmdMGUxuQsm1U9Qs8oJSn5PfY4B1apGG75YBRxQPybtRVm',
        },
      },
    ]

    const fetchStub = sinon.stub(global, 'fetch')
    try {
      fetchStub.onCall(0).returns(
        Promise.resolve(
          new Response(JSON.stringify(jsonResult), {
            headers: { 'content-type': 'application/json' },
          })
        )
      )

      const [{ value: result }] = await getDataFromExternalSources(
        [schema],
        dataFromChain,
        IPFS_GATEWAY_MOCK
      )

      expect(result).to.deep.equal(jsonResult)
    } finally {
      fetchStub.restore()
    }
  })
})
