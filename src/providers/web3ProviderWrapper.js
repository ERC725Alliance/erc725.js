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
 * @file dataSrouce/glqApollo.js
 * @author Fabian Vogelsteller <fabian@lukso.network>, Robert McLeod <@robertdavid010>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/
let idCount = 1

import * as web3utils from 'web3-utils'
import * as abi from 'web3-eth-abi'
import { CONSTANTS } from './constants.js'
const web3abi = abi.default

// const CONSTANTS = {
//   getDataFunctionSignature: '0x54f6127f',
//   dataCountFunctionSignature: '0x5da40c47',
//   allDataKeysFunctionSignature: '0xc559acef'
// }

// TODO: rename to web3provider
// Sho
export default class Web3Source {
  constructor(props) {
    this.currentProvider = props.provider
    // this.idCount = 1 // this has to be available to the instance...
  }

  async getData (address, keyHash) {
    const data = CONSTANTS.methods.getData.sig + keyHash.replace('0x', '')
    const params = [
      {
        to: address,
        gas: CONSTANTS.methods.getData.gas,
        gasPrice: CONSTANTS.methods.getData.gasPrice,
        value: CONSTANTS.methods.getData.value,
        data: data
      }
    ]
    const result = await this.contractCall(params)
    console.log("CONTRACT QUERY RESULT RSULT!!!")
    console.log(result)
    return web3abi.decodeParameter('bytes',result)
  }

  async getAllData (address, keyHashes) {
    // This gets all the data for an entity
    // This funtion should get the data form the scheam, not `allKeys`
    // TODO: Use the schema as the source of truth.
    let keys
    if (!keyHashes) {
      const data = CONSTANTS.methods.allData.sig + web3utils.padLeft('',32)
      const params = [
        {
          to: address,
          gas: CONSTANTS.methods.allData.gas,
          gasPrice: CONSTANTS.methods.allData.gasPrice,
          value: CONSTANTS.methods.allData.value,
          data: data
        }

      ]
      const allKeys = await this.contractCall(params)
      keys = web3abi.decodeParameter('bytes32[]',allKeys)
    } else {
      keys = keyHashes
    }
    // const keys = keyHashes
    const results = []
    
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
      const res = await this.contractCall(params)
      const r = {}
      r.key = key
      r.value = web3abi.decodeParameter('bytes',res)
      results.push(r)
    }
    return results
    
  }

  async contractCall (params) {

    const payload = {
      jsonrpc:"2.0",
      method:"eth_call",
      params: params,
      // [
        // {
        //   to: address,
        //   gas: web3utils.numberToHex(2000000),
        //   gasPrice: web3utils.numberToHex(100000000),
        //   value: web3utils.numberToHex(0),
        //   data: data
        // }
      // ],
      
      id: idCount++
    }
    // idCount ++

    if (this.currentProvider && this.currentProvider.request) {
      return await this.currentProvider.request({method:'eth_call', params:payload.params})
    } else {
      // Handle no provmis of old 'send' method
      const callMethod = new Promise((resolve, reject) => {
        // The callback to resolve the promise
        const cb = (e,r) => {
          if (e) {
            reject(e)
          } else {
            resolve(r.result)
          }
        }
        // Make the send call
        this.currentProvider.send(payload,cb)
        
      })
      // Call the promise
      return await callMethod

    }


  }
  
}
