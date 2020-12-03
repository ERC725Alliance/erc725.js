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
import Web3Utils from 'web3-utils'
import { CONSTANTS } from '../lib/constants.js'

const web3abi = abi.default
let idCount = 1

export default class Web3Source {

    constructor(provider) {

        this.provider = provider

    }

    async getOwner(address) {

        return this._decodeResult(
            this._callContract(this._constructJSONRPC('owner', address))
        )

    }


    async getData(address, keyHash) {

        return this._decodeResult(
            await this._callContract(this._constructJSONRPC('getData', address, keyHash))
        )

    }

    async getAllData(address, keys) {

        // generate payload
        const payload = []
        for (let index = 0; index < keys.length; index++) {

            payload.push(this._constructJSONRPC('getData', address, keys[index]))

        }

        // call node
        const results = await this._callContract(payload)


        // map results to keys
        const returnValues = []
        for (let index = 0; index < payload.length; index++) {

            returnValues.push({
                key: keys[index],
                value: this._decodeResult(
                    results.find(element => payload[index].id === element.id)
                )
            })

        }

        return returnValues

    }

    // eslint-disable-next-line class-methods-use-this
    _constructJSONRPC(method, address, methodParam) {

        if (!CONSTANTS.methods[method]) { throw new Error('Contract method "' + method + '"not supported') }

        const data = methodParam ? CONSTANTS.methods[method].sig + methodParam.replace('0x', '') : CONSTANTS.methods[method].sig
        // eslint-disable-next-line no-return-assign
        return {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
                {
                    to: address,
                    gas: CONSTANTS.methods[method].gas,
                    gasPrice: CONSTANTS.methods[method].gasPrice,
                    value: CONSTANTS.methods[method].value,
                    data
                }
            ],
            id: idCount += 1
        }

    }

    async _callContract(payload) {

        return new Promise((resolve, reject) => {

            // Send old web3 method with callback to resolve promise
            this.provider.send(payload, (e, r) => {

                if (e) {

                    reject(e)

                } else {

                    resolve(r)

                }

            })

        })

    }

    // eslint-disable-next-line class-methods-use-this
    _decodeResult(result) {

        const rpcResult = result.result
        return (rpcResult === '0x') ? null : web3abi.decodeParameter('bytes', rpcResult)

    }

}
