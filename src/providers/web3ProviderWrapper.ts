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

import { JsonRpc } from '../types/JsonRpc';
import { Method } from '../types/Method';
import { constructJSONRPC, decodeResult } from '../lib/provider-wrapper-utils';
import { ProviderTypes } from '../types/provider';

export class Web3ProviderWrapper {
  type: ProviderTypes;
  provider: any;
  constructor(provider: any) {
    this.type = ProviderTypes.WEB3;
    this.provider = provider;
  }

  async getOwner(address: string) {
    const result = await this.callContract(
      constructJSONRPC(address, Method.OWNER),
    );
    if (result.error) {
      throw result.error;
    }

    return decodeResult(Method.OWNER, result);
  }

  async getData(address: string, keyHash: string) {
    return decodeResult(
      Method.GET_DATA,
      await this.callContract(
        constructJSONRPC(address, Method.GET_DATA, keyHash),
      ),
    );
  }

  async getAllData(address: string, keys: string[]) {
    const payload: JsonRpc[] = [];
    for (let index = 0; index < keys.length; index++) {
      payload.push(constructJSONRPC(address, Method.GET_DATA, keys[index]));
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
        value: decodeResult(
          Method.GET_DATA,
          results.find((element) => payload[index].id === element.id),
        ),
      });
    }

    return returnValues;
  }

  private async callContract(payload): Promise<any> {
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
}
