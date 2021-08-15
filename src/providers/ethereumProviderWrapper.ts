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
 * @file providers/ethereumProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum provider api in accordance with
  implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi';

import { METHODS } from '../lib/constants';
import { Method } from '../types/Method';

// @ts-ignore
const web3Abi = abi.default;

export class EthereumProviderWrapper {
  public provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }

  async getOwner(address: string) {
    const params = this.constructJSONRPC(address, Method.OWNER);
    const result = await this.callContract([params]);
    if (result.error) {
      throw result.error;
    }

    return this.decodeResult(Method.OWNER, result);
  }

  async getData(address: string, keyHash: string) {
    const result = await this.callContract([
      this.constructJSONRPC(address, Method.GET_DATA, keyHash),
    ]);
    return this.decodeResult(Method.GET_DATA, result);
  }

  async getAllData(address: string, keys: string[]) {
    const results: {
      key: string;
      value: Record<string, any> | null;
    }[] = [];

    for (let index = 0; index < keys.length; index++) {
      results.push({
        key: keys[index],
        value: await this.getData(address, keys[index]),
      });
    }

    return results;
  }

  // eslint-disable-next-line class-methods-use-this
  private constructJSONRPC(
    address: string,
    method: Method,
    methodParam?: string,
  ) {
    const data = methodParam
      ? METHODS[method].sig + methodParam.replace('0x', '')
      : METHODS[method].sig;

    return {
      to: address,
      gas: METHODS[method].gas,
      gasPrice: METHODS[method].gasPrice,
      value: METHODS[method].value,
      data,
    };
  }

  private async callContract(params: any) {
    return this.provider.request({ method: 'eth_call', params });
  }

  // eslint-disable-next-line class-methods-use-this
  private decodeResult(method: Method, result: string) {
    return result === '0x'
      ? null
      : web3Abi.decodeParameter(METHODS[method].returnEncoding, result);
  }
}
