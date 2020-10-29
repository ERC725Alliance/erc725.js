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

import * as web3utils from 'web3-utils'

const CONSTANTS = {
  getDataFunctionSignature: "0x54f6127f" // Replaced need for abi
}

export default class Web3Source {
  constructor(props) {
    this.currentProvider = props.provider
  }

  async getEntityDataByKey (entityId, keyHash) {
    const data = CONSTANTS.getDataFunctionSignature + web3utils.padLeft(keyHash.replace('0x',''),32)

    const payload = {
      jsonrpc:"2.0",
      method:"eth_call",
      params:[
        {
          to: entityId,
          gas: web3utils.numberToHex(2000000),
          gasPrice: web3utils.numberToHex(100000000),
          value: web3utils.numberToHex(0),
          data: data
        // (manually generate this method call functionSig (4bytes) + key (32bytes)
        }
      ],
      id:1
    }

    const callMethod = new Promise((resolve, reject) => {
      const cb = (e,r) => {
        if (e) {
          reject(e)
        } else {
          resolve(r.result)
        }
      }
      this.currentProvider.send(payload,cb)
    })

    return await callMethod
    
  }
  
}
