import type { Address } from 'viem'
import { encodeArrayKey } from '../src'
import { mockJson, mockJson2, mockSchema } from './mockSchema'
import { ERC725Y_INTERFACE_IDS } from '../src/constants/constants'

export const CONTENT_TYPE = 'Content-Type'
export const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/'

export const itemizedSchema = new Map<`0x${string}`, `0x${string}`>()
for (const schemaElement of mockSchema) {
  if (schemaElement.keyType === 'Array') {
    if (
      !schemaElement.returnGraphData ||
      !Array.isArray(schemaElement.returnGraphData)
    ) {
      continue
    }
    itemizedSchema.set(
      schemaElement.key as `0x${string}`,
      schemaElement.returnGraphData[0] as `0x${string}`
    )
    for (const [index, value] of schemaElement.returnGraphData
      .slice(1)
      .entries()) {
      itemizedSchema.set(
        encodeArrayKey(schemaElement.key, index) as `0x${string}`,
        value as `0x${string}`
      )
    }
  } else {
    itemizedSchema.set(
      schemaElement.key as `0x${string}`,
      schemaElement.returnGraphData as `0x${string}`
    )
  }
}

// Default response handlers
const defaultResponses = {
  ipfs: {
    QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd: mockJson.data,
    QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd: mockJson2.data,
  },
  rpc: {
    owner: '0x',
    getDataBatch: (keys: `0x${string}`[]): `0x${string}`[] => {
      const result: `0x${string}`[] = []
      for (const key of keys) {
        let data = responseStore.rpc.getData(key)
        if (!data) {
          const item = resolvedSchema(key)
          if (item) {
            data = item
          }
        }
        result.push(data || '0x')
      }
      return result
    },
    getData: (_key: `0x${string}`): `0x${string}` | undefined => undefined,
    supportsInterface: (interfaceId: `0x${string}`): boolean =>
      responseStore.supportsInterfaces.includes(interfaceId),
    isValidSignature: (
      _messageHash: `0x${string}`,
      _signature: `0x${string}`,
      _recoveredAddress: Address
    ): boolean => {
      return responseStore.isValidSignature
    },
  },
}

// Response store that tests can modify
export const responseStore = {
  supportsInterfaces: [] as `0x${string}`[],
  isValidSignature: false,
  ipfs: defaultResponses.ipfs,
  rpc: { ...defaultResponses.rpc },
}

// Helper to reset all handlers to defaults
export const resetMocks = () => {
  responseStore.ipfs = defaultResponses.ipfs
  responseStore.rpc = { ...defaultResponses.rpc }
  responseStore.supportsInterfaces = [
    ERC725Y_INTERFACE_IDS['5.0'] as `0x${string}`,
  ]
  responseStore.isValidSignature = false
}

export function resolvedSchema(key: `0x${string}`) {
  const result = itemizedSchema.get(key)
  if (result) {
    return result
  }
  return
}
