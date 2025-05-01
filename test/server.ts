import { http } from 'msw'
import { setupServer } from 'msw/node'
import { decodeParameters, encodeParameters } from 'web3-eth-abi'
import { padLeft } from 'web3-utils'
import { METHODS } from '../src/constants/constants'
import { recover } from 'web3-eth-accounts'
import {
  CONTENT_TYPE,
  IPFS_GATEWAY,
  resolvedSchema,
  responseStore,
} from './serverHelpers'

process.env.TESTING = 'true'

const handlers = [
  http.get(`${IPFS_GATEWAY}:splat*`, async ({ params }) => {
    console.log('Mocking IPFS response', params.splat)
    const data =
      responseStore.ipfs[
        (Array.isArray(params.splat) ? params.splat : [params.splat]).join('/')
      ]
    if (!data) {
      return new Response('Not found', {
        status: 404,
        headers: { [CONTENT_TYPE]: 'application/json' },
      })
    }
    return new Response(data, {
      headers: { [CONTENT_TYPE]: 'application/json' },
    })
  }),
  http.post('https://rpc.testnet.lukso.network/', async ({ request }) => {
    const data: {
      params: Array<Record<string, string>>
      method: string
    } = (await request.json()) as {
      params: Array<Record<string, string>>
      method: string
    }
    const handleResponse = (data) => {
      const { id, jsonrpc } = data
      if (Array.isArray(data.method)) {
        return { id, jsonrpc, result: data.method.map(handleResponse) }
      }
      if (typeof data.method === 'object') {
        return { id, jsonrpc, result: handleResponse(data.method) }
      }
      try {
        switch (data.method) {
          case 'eth_chainId': {
            return {
              ...data,
              result: `0x${Number(4201).toString(16)}`,
            }
          }
          case 'eth_call': {
            const sig = data.params[0]?.data.slice(0, 10)
            switch (sig) {
              case METHODS.getData.sig:
              case METHODS.getDataBatch.sig: {
                const keys = decodeParameters(
                  ['bytes32[]'],
                  data.params[0]?.data.slice(10)
                )[0] as `0x${string}`[]
                const values = responseStore.rpc.getDataBatch(keys)
                // getDataBatch
                const resultEncoded = encodeParameters(['bytes[]'], [values])
                return { id, jsonrpc, result: resultEncoded }
              }
              case METHODS.getDataLegacy.sig: {
                const key = decodeParameters(
                  ['bytes32'],
                  data.params[0]?.data.slice(10)
                )[0] as `0x${string}`
                let result = responseStore.rpc.getData(key)
                if (!result) {
                  result = resolvedSchema(key)
                }
                if (result) {
                  return {
                    id,
                    jsonrpc,
                    result: encodeParameters(['bytes'], [result]),
                  }
                }
                // getData
                return { id, jsonrpc, result: '0x' }
              }
              case METHODS.supportsInterface.sig: {
                // supportsInterface
                const interfaceId = decodeParameters(
                  ['bytes4'],
                  data.params[0]?.data.slice(10)
                )[0] as `0x${string}`
                const result = responseStore.rpc.supportsInterface(interfaceId)
                return { id, jsonrpc, result: padLeft(result ? 1 : 0, 64) }
              }
              case METHODS.isValidSignature.sig: {
                // isValidSignature
                const output = decodeParameters(
                  ['bytes32', 'bytes'],
                  data.params[0]?.data.slice(10)
                )
                const hash = output[0] as `0x${string}`
                const signature = output[1] as `0x${string}`
                const recoveredAddress = recover(
                  hash,
                  signature
                ) as `0x${string}`
                const isValidSignature = responseStore.rpc.isValidSignature(
                  hash,
                  signature,
                  recoveredAddress
                )
                const isValidSignatureResponse = encodeParameters(
                  ['bytes4'],
                  [isValidSignature ? '0x1626ba7e' : '0x00000000']
                )
                return { id, jsonrpc, result: isValidSignatureResponse }
              }
            }
            throw new Error(
              `Sig not supports: ${sig}: ${JSON.stringify(data, null, 2)}`
            )
          }
        }
      } catch (error) {
        return {
          id,
          jsonrpc,
          error: {
            message: (error as { message: string }).message || 'Unknown error',
          },
        }
      }
      return { id, jsonrpc, error: { message: 'Method not found' } }
    }
    try {
      if (Array.isArray(data)) {
        return Response.json(data.map(handleResponse))
      }
      return Response.json(handleResponse(data))
    } catch (error) {
      console.error('json-rpc error', error)
      return Response.error()
    }
  }),
]

// Mock the cookie store to prevent the CookieStore.add error
// @ts-ignore - Mock CookieStore to prevent errors
global.CookieStore = () => ({
  add: () => {},
  getAll: () => [],
  delete: () => {},
})

export const server = setupServer(...handlers)
server.listen({ onUnhandledRequest: 'bypass' })
