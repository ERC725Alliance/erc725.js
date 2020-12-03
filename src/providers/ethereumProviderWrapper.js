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

    async getData(address, keyHash) {

        let result = await this._callContract([this._constructJSONRPC('getData', address, keyHash)])
        result = this.deprecated ? result.result : result
        return this._decodeResult(result)

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

    // eslint-disable-next-line class-methods-use-this
    _constructJSONRPC(method, address, methodParam) {

        const data = methodParam ? CONSTANTS.methods[method].sig + methodParam.replace('0x', '') : CONSTANTS.methods[method].sig
        // eslint-disable-next-line no-return-assign
        return {
            to: address,
            gas: CONSTANTS.methods[method].gas,
            gasPrice: CONSTANTS.methods[method].gasPrice,
            value: CONSTANTS.methods[method].value,
            data
        }

    }

    async _callContract(params) {

        return this.deprecated
            ? this.provider.send('eth_call', params)
            : this.provider.request({ method: 'eth_call', params })

    }

    // eslint-disable-next-line class-methods-use-this
    _decodeResult(result) {

        return (result === '0x') ? null : web3Abi.decodeParameter('bytes', result)

    }

}
