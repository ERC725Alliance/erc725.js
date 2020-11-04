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
 * @author Fabian Vogelsteller <fabian@lukso.network>, Robert McLeod <@robertdavid010>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum proivder api in accordance with
  implementation of smart contract interfaces of ERC725
*/
import * as web3utils from 'web3-utils'
import * as abi from 'web3-eth-abi'
const web3abi = abi.default
import { CONSTANTS } from './constants'

// QUESTION: ethereum payload does not require 'id'?
export default class EthereumSource {
  constructor(props) {
    this.currentProvider = props.provider
  }

  async getEntityDataByKey(address, key) {
    console.log('this new module is working?!?!?')
    return await this.getData(address, key)
  }

  async getDataByEntity(address, keyHashes) {
    return await this._fetchAllData(address, keyHashes)
  }

  async getAllData(address, keyHashes) {
    // return await this._fetchAllData(address, keyHashes)
    return await this.getData(address, keyHashes)
  }
  async getData(address, keys) {
    // Call the method based on the array suppor multiple keys
    if (!Array.isArray(keys)) {
      console.log('no array here...')
      return await this._fetchData(address,keys)
    } else {
      return await this._fetchAllData(address, keys)
    }
  }

  async _fetchData(address, key) {
    const d = this._getPayloadData(key)
    const result = await this._callContract(address, d)

    const newResult = await web3abi.decodeParameter('bytes',result)
    console.log("WHY NO NEW RESULT?!?!?!")
    console.log(newResult)
    return newResult
    // return result
  }

  async _fetchAllData(address, keyHashes) {
    const results = []
    // Must use 'for' instead of 'forEach' to 'await' properly
    // const data = CONSTANTS.allData.sig + web3utils.padLeft('',32)
    
    // const allKeys = await this._callContract(address, data)
    console.log(keyHashes)
    const keys = keyHashes
    // const keys = web3abi.decodeParameter('bytes32[]', allKeys)
    console.log("WTF?!?!?")
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const d = this._getPayloadData(key)
      // const d = CONSTANTS.getDataFunctionSignature + key.replace('0x','')
      const res = await this._callContract(address, d)
      const r = {}
      r.key = key
      r.value = web3abi.decodeParameter('bytes',res)
      results.push(r)
    }
    return results
  }

  async _getPayloadData(keyHash) {
    return CONSTANTS.getData.sig + keyHash.replace('0x','')
  }

  async _callContract (address, data) {
    console.log('calling contract...')
    const params = [
      {
        to: address,
        gas: CONSTANTS.getData.gas,
        gasPrice: CONSTANTS.getData.gasPrice,
        value: CONSTANTS.getData.value,
        data: data
      }
    ]
    console.log(params)
    return await this.currentProvider.request({method:'eth_call', params:params})
  }

}
