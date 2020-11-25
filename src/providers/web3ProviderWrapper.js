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
 * @file dataSrouce/web3ProviderWrapper.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi'
import { CONSTANTS } from '../lib/constants.js'

const web3abi = abi.default
let idCount = 1

export default class Web3Source {

    constructor(provider) {

        this.provider = provider

    }

    async getData(address, keyHash) {

        const data = CONSTANTS.methods.getData.sig + keyHash.replace('0x', '')
        const params = [
            {
                to: address,
                gas: CONSTANTS.methods.getData.gas,
                gasPrice: CONSTANTS.methods.getData.gasPrice,
                value: CONSTANTS.methods.getData.value,
                data
            }
        ]
        const result = await this._callContract(params)
        return web3abi.decodeParameter('bytes', result)

    }

    async getAllData(address, keys) {

        const results = []
        for (let index = 0; index < keys.length; index++) {

            const theValue = await this.getData(address, keys[index])
            results.push({
                key: keys[index],
                value: theValue
            })

        }

        return results

    }

    async _callContract(params) {

        const payload = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params,
            id: idCount += 1
        }

        const callMethod = new Promise((resolve, reject) => {

            // Send old web3 method with callback to resolve promise
            this.provider.send(payload, (e, r) => {

                if (e) {

                    reject(e)

                } else {

                    resolve(r.result)

                }

            })

        })
        // Call the promise
        return callMethod

    }

}
