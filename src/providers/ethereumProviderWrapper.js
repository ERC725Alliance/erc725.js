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
 * @file providers/ethereumProviderWrapper.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum proivder api in accordance with
  implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi'
import { CONSTANTS } from '../lib/constants.js'
const web3Abi = abi.default

export default class EthereumSource {
  constructor(provider, deprecated) {
    this.provider = provider
    this.deprecated = (deprecated === 'deprecated')
  }

  async getData(address, key) {
    const data = CONSTANTS.methods.getData.sig + key.replace('0x','')

    const params = [
      {
        to: address,
        gas: CONSTANTS.methods.getData.gas,
        gasPrice: CONSTANTS.methods.getData.gasPrice,
        value: CONSTANTS.methods.getData.value,
        data: data
      }
    ]
    const result = await this._callContract(params)
    return web3Abi.decodeParameter('bytes', (this.deprecated ? result.result : result))
  }

  async getAllData(address, keys) {
    const results = []
    
    for (let index = 0; index < keys.length; index++) {
      results.push({
        key: keys[index],
        value: await this.getData(address, keys[index])
      })
    }
    return results
  }

  async _callContract (params) {
    return this.deprecated
      ? await this.provider.send('eth_call', params)
      : await this.provider.request({method:'eth_call', params:params})
  }

}
