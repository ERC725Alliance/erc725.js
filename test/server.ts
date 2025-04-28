import { http } from 'msw';
import { setupServer } from 'msw/node';
import { decodeParameters, encodeParameters } from 'web3-eth-abi';
import { padLeft } from 'web3-utils';
import { ERC725Y_INTERFACE_IDS, METHODS } from '../src/constants/constants';
import { recover } from 'web3-eth-accounts';
import type { Address } from 'web3';
import { encodeArrayKey } from '../src';
import { mockJson, mockJson2, mockSchema } from './mockSchema';

const CONTENT_TYPE = 'Content-Type';
export const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

process.env.TESTING = 'true';

// Default response handlers
const defaultResponses = {
  ipfs: {
    QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd: mockJson.data,
    QmbErKh3Fjsxxxxxxxxxxxxxxxxxxxxxxxxxxv9AJJvZbd: mockJson2.data,
  },
  rpc: {
    getDataBatch: (keys: `0x${string}`[]): `0x${string}`[] => {
      const result: `0x${string}`[] = [];
      for (const key of keys) {
        let data = responseStore.rpc.getData(key);
        if (!data) {
          const item = resolvedSchema(key);
          if (item) {
            data = item;
          }
        }
        result.push(data || '0x');
      }
      return result;
    },
    getData: (_key: `0x${string}`): `0x${string}` | undefined => undefined,
    supportsInterface: (interfaceId: `0x${string}`): boolean =>
      responseStore.supportsInterfaces.includes(interfaceId),
    isValidSignature: (
      _messageHash: `0x${string}`,
      _signature: `0x${string}`,
      _recoveredAddress: Address,
    ): boolean => {
      return responseStore.isValidSignature;
    },
  },
};

// Response store that tests can modify
export const responseStore = {
  supportsInterfaces: [] as `0x${string}`[],
  isValidSignature: false,
  ipfs: defaultResponses.ipfs,
  rpc: { ...defaultResponses.rpc },
};

// Helper to reset all handlers to defaults
export const resetMocks = () => {
  responseStore.ipfs = defaultResponses.ipfs;
  responseStore.rpc = { ...defaultResponses.rpc };
  responseStore.supportsInterfaces = [
    ERC725Y_INTERFACE_IDS['5.0'] as `0x${string}`,
  ];
  responseStore.isValidSignature = false;
};

const itemizedSchema = new Map<`0x${string}`, `0x${string}`>();
for (const schemaElement of mockSchema) {
  if (schemaElement.keyType === 'Array') {
    if (
      !schemaElement.returnGraphData ||
      !Array.isArray(schemaElement.returnGraphData)
    ) {
      continue;
    }
    itemizedSchema.set(
      schemaElement.key as `0x${string}`,
      schemaElement.returnGraphData[0] as `0x${string}`,
    );
    for (const [index, value] of schemaElement.returnGraphData
      .slice(1)
      .entries()) {
      itemizedSchema.set(
        encodeArrayKey(schemaElement.key, index) as `0x${string}`,
        value as `0x${string}`,
      );
    }
  } else {
    itemizedSchema.set(
      schemaElement.key as `0x${string}`,
      schemaElement.returnGraphData as `0x${string}`,
    );
  }
}
function resolvedSchema(key: `0x${string}`) {
  const result = itemizedSchema.get(key);
  if (result) {
    return result;
  }
  return;
}

const handlers = [
  http.get(`${IPFS_GATEWAY}:splat*`, async ({ params }) => {
    console.log('Mocking IPFS response', params.splat);
    const data =
      responseStore.ipfs[
        (Array.isArray(params.splat) ? params.splat : [params.splat]).join('/')
      ];
    if (!data) {
      return new Response('Not found', {
        status: 404,
        headers: { [CONTENT_TYPE]: 'application/json' },
      });
    }
    return new Response(data, {
      headers: { [CONTENT_TYPE]: 'application/json' },
    });
  }),
  http.post('https://rpc.testnet.lukso.network/', async ({ request }) => {
    const data: {
      params: Array<Record<string, string>>;
      method: string;
    } = (await request.json()) as {
      params: Array<Record<string, string>>;
      method: string;
    };
    const handleResponse = (data) => {
      const { id, jsonrpc } = data;
      if (Array.isArray(data.method)) {
        return { id, jsonrpc, result: data.method.map(handleResponse) };
      }
      if (typeof data.method === 'object') {
        return { id, jsonrpc, result: handleResponse(data.method) };
      }
      try {
        switch (data.method) {
          case 'eth_chainId': {
            return {
              ...data,
              result: `0x${Number(4201).toString(16)}`,
            };
          }
          case 'eth_call': {
            const sig = data.params[0]?.data.slice(0, 10);
            switch (sig) {
              case METHODS.getData.sig:
              case METHODS.getDataBatch.sig: {
                const keys = decodeParameters(
                  ['bytes32[]'],
                  data.params[0]?.data.slice(10),
                )[0] as `0x${string}`[];
                const values = responseStore.rpc.getDataBatch(keys);
                // getDataBatch
                const resultEncoded = encodeParameters(['bytes[]'], [values]);
                return { id, jsonrpc, result: resultEncoded };
              }
              case METHODS.getDataLegacy.sig: {
                const key = decodeParameters(
                  ['bytes32'],
                  data.params[0]?.data.slice(10),
                )[0] as `0x${string}`;
                let result = responseStore.rpc.getData(key);
                if (!result) {
                  result = resolvedSchema(key);
                }
                if (result) {
                  return {
                    id,
                    jsonrpc,
                    result: encodeParameters(['bytes'], [result]),
                  };
                }
                // getData
                return { id, jsonrpc, result: '0x' };
              }
              case METHODS.supportsInterface.sig: {
                // supportsInterface
                const interfaceId = decodeParameters(
                  ['bytes4'],
                  data.params[0]?.data.slice(10),
                )[0] as `0x${string}`;
                const result = responseStore.rpc.supportsInterface(interfaceId);
                return { id, jsonrpc, result: padLeft(result ? 1 : 0, 64) };
              }
              case METHODS.isValidSignature.sig: {
                // isValidSignature
                const output = decodeParameters(
                  ['bytes32', 'bytes'],
                  data.params[0]?.data.slice(10),
                );
                const hash = output[0] as `0x${string}`;
                const signature = output[1] as `0x${string}`;
                const recoveredAddress = recover(hash, signature);
                const isValidSignature = responseStore.rpc.isValidSignature(
                  hash,
                  signature,
                  recoveredAddress,
                );
                const isValidSignatureResponse = encodeParameters(
                  ['bytes4'],
                  [isValidSignature ? '0x1626ba7e' : '0x00000000'],
                );
                return { id, jsonrpc, result: isValidSignatureResponse };
              }
            }
            throw new Error(
              `Sig not supports: ${sig}: ${JSON.stringify(data, null, 2)}`,
            );
          }
        }
      } catch (error) {
        return {
          id,
          jsonrpc,
          error: {
            message: (error as { message: string }).message || 'Unknown error',
          },
        };
      }
      return { id, jsonrpc, error: { message: 'Method not found' } };
    };
    try {
      if (Array.isArray(data)) {
        return Response.json(data.map(handleResponse));
      }
      return Response.json(handleResponse(data));
    } catch (error) {
      console.error('json-rpc error', error);
      return Response.error();
    }
  }),
];

// Mock the cookie store to prevent the CookieStore.add error
// @ts-ignore - Mock CookieStore to prevent errors
global.CookieStore = () => ({
  add: () => {},
  getAll: () => [],
  delete: () => {},
});

export const server = setupServer(...handlers);
server.listen({ onUnhandledRequest: 'bypass' });
