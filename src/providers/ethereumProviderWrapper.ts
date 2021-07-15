/*
    This file is part of ERC725.js.
    ERC725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    ERC725.js is distributed in the hope that it will be useful,
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

import { CONSTANTS } from '../lib/constants';
import { Method } from '../types/Method';

// @ts-ignore
const web3Abi = abi.default;

export default class EthereumSource {
  public provider: any;

  public deprecated: boolean;

  constructor(provider: any, deprecated?: 'deprecated') {
    this.provider = provider;
    this.deprecated = deprecated === 'deprecated';
  }

  async getOwner(address: string) {
    const params = this._constructJSONRPC(address, Method.OWNER);
    const result = await this._callContract([params]);
    if (result.error) {
      throw result.error;
    }

    return this._decodeResult(Method.OWNER, result);
  }

  async getData(address: string, keyHash: string) {
    let result = await this._callContract([
      this._constructJSONRPC(address, Method.GET_DATA, keyHash),
    ]);
    result = this.deprecated ? result.result : result;
    return this._decodeResult(Method.GET_DATA, result);
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
  _constructJSONRPC(address: string, method: Method, methodParam?: string) {
    const data = methodParam
      ? CONSTANTS.methods[method].sig + methodParam.replace('0x', '')
      : CONSTANTS.methods[method].sig;
    // eslint-disable-next-line no-return-assign
    return {
      to: address,
      gas: CONSTANTS.methods[method].gas,
      gasPrice: CONSTANTS.methods[method].gasPrice,
      value: CONSTANTS.methods[method].value,
      data,
    };
  }

  async _callContract(params: any) {
    return this.deprecated
      ? this.provider.send('eth_call', params)
      : this.provider.request({ method: 'eth_call', params });
  }

  // eslint-disable-next-line class-methods-use-this
  _decodeResult(method: Method, result: string) {
    if (!CONSTANTS.methods[method]) {
      console.error('Contract method: "' + method + '" is not supported.');
      return null;
    }

    return result === '0x'
      ? null
      : // eslint-disable-next-line operator-linebreak
        // @ts-ignore
        web3Abi.decodeParameter(
          CONSTANTS.methods[method].returnEncoding,
          result,
        );
  }
}
