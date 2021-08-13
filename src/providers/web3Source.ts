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
/**
 * @file providers/web3ProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi';

import { METHODS } from '../lib/constants';
import { JsonRpc } from '../types/JsonRpc';
import { Method } from '../types/Method';

// @ts-ignore
const web3abi = abi.default;
let idCount = 1;

export default class Web3Source {
  public provider: any;

  constructor(provider) {
    this.provider = provider;
  }

  async getOwner(address: string) {
    const result = await this.callContract(
      this.constructJSONRPC(address, Method.OWNER),
    );
    // @ts-ignore
    if (result.error) {
      // @ts-ignore
      throw result.error;
    }

    return this.decodeResult(Method.OWNER, result);
  }

  async getData(address: string, keyHash: string) {
    return this.decodeResult(
      Method.GET_DATA,
      await this.callContract(
        this.constructJSONRPC(address, Method.GET_DATA, keyHash),
      ),
    );
  }

  async getAllData(address: string, keys: string[]) {
    const payload: JsonRpc[] = [];
    for (let index = 0; index < keys.length; index++) {
      payload.push(
        this.constructJSONRPC(address, Method.GET_DATA, keys[index]),
      );
    }

    const results: any = await this.callContract(payload);

    // map results to keys
    const returnValues: {
      key: string;
      value: Record<string, any> | null;
    }[] = [];
    for (let index = 0; index < payload.length; index++) {
      returnValues.push({
        key: keys[index],
        value: this.decodeResult(
          Method.GET_DATA,
          results.find((element) => payload[index].id === element.id),
        ),
      });
    }

    return returnValues;
  }

  // eslint-disable-next-line class-methods-use-this
  private constructJSONRPC(
    address: string,
    method: Method,
    methodParam?: string,
  ): JsonRpc {
    const data = methodParam
      ? METHODS[method].sig + methodParam.replace('0x', '')
      : METHODS[method].sig;

    // eslint-disable-next-line no-return-assign
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
      id: (idCount += 1),
    };
  }

  private async callContract(payload) {
    return new Promise((resolve, reject) => {
      // Send old web3 method with callback to resolve promise
      this.provider.send(payload, (e, r) => {
        if (e) {
          reject(e);
        } else {
          resolve(r);
        }
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private decodeResult(method: Method, result) {
    const rpcResult = result.result;
    return rpcResult === '0x'
      ? null
      : web3abi.decodeParameter(METHODS[method].returnEncoding, rpcResult);
  }
}
