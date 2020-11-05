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
// import * as web3utils from 'web3-utils'
import * as abi from 'web3-eth-abi'
const web3Abi = abi.default
import { CONSTANTS } from './constants.js'

// QUESTION: ethereum payload does not require 'id'?
export default class EthereumSource {
  constructor(props) {
    this.provider = props.provider
  }

  async getData(address, keys) {
    // Call the method based on the array suppor multiple keys
    if (!Array.isArray(keys)) {
      return await this._fetchData(address, keys)
    } else {
      return await this._fetchDataMultiple(address, keys)
    }
  }

  async getAllData(address, keys) {
    if (!keys) {
      throw Error('Get all data requires an array of keys')
    } else {
      return await this._fetchDataMultiple(address, keys)
    }
  }

  async _fetchData(address, key) {
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
    return web3Abi.decodeParameter('bytes',result)
  }

  async _fetchDataMultiple(address, keys) {
    const results = []
    // Must use 'for' instead of 'forEach' to 'await' properly?
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
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
      const res = await this._callContract(params)
      results.push({
        key: key,
        value: web3Abi.decodeParameter('bytes',res)
      })
    }
    return results
  }

  async _callContract (params) {
    return await this.provider.request({method:'eth_call', params:params})
  }

}
