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
    along with @erc725/erc725.js.  If not, see <http://www.gnu.org/licenses/>.
*/

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

export function constructJSONRPCEthereumProvider(
  address: string,
  method: Method,
  methodParam?: string,
) {
  const data = methodParam
    ? METHODS[method].sig + methodParam.replace('0x', '')
    : METHODS[method].sig;

  return [
    {
      to: address,
      value: METHODS[method].value,
      gas: METHODS[method].gas,
      data,
    },
    'latest',
  ];
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
        value: METHODS[method].value,
        data,
      },
      'latest',
    ],
    id: idCount,
  };
}
