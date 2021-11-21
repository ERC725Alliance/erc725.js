import * as abi from 'web3-eth-abi';

import { JsonRpc } from '../types/JsonRpc';
import { Method } from '../types/Method';

import { METHODS } from './constants';

let idCount = 0;
// @ts-ignore
const web3abiDecoder = abi.default;

export function decodeResult(method: Method, result) {
  const rpcResult = result.result;

  if (rpcResult === '0x') {
    return null;
  }

  const decodedData = web3abiDecoder.decodeParameter(
    METHODS[method].returnEncoding,
    rpcResult,
  );

  if (
    Array.isArray(decodedData) &&
    decodedData.length === 1 &&
    decodedData[0] === '0x'
  ) {
    return [null];
  }

  return decodedData;
}

export function constructJSONRPC(
  address: string,
  method: Method,
  methodParam?: string,
): JsonRpc {
  const data = methodParam
    ? METHODS[method].sig + methodParam.replace('0x', '')
    : METHODS[method].sig;

  idCount += 1;

  return {
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [
      {
        to: address,
        gas: METHODS[method].gas,
        gasPrice: METHODS[method].gasPrice,
        value: METHODS[method].value,
        data,
      },
    ],
    id: idCount,
  };
}
