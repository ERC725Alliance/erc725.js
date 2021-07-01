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
 * @file dataSrouce/web3ProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi'

import { CONSTANTS } from '../lib/constants'
import { JsonRpc } from '../types/json-rpc'
import { Method } from '../types/method'

// @ts-ignore
const web3abi = abi.default
let idCount = 1

export default class Web3Source {

    public provider: any;

    constructor(provider) {

        this.provider = provider

    }

    async getOwner(address: string) {

        const result = await this.callContract(
            Web3Source.constructJSONRPC(address, Method.OWNER)
        )
        // @ts-ignore
        if (result.error) {

            // @ts-ignore
            throw result.error

        }

        return Web3Source.decodeResult(Method.OWNER, result)

    }

    async getData(address: string, keyHash: string) {

        return Web3Source.decodeResult(
            Method.GET_DATA,
            await this.callContract(
                Web3Source.constructJSONRPC(address, Method.GET_DATA, keyHash)
            )
        )

    }

    async getAllData(address: string, keys) {

        // generate payload
        const payload: JsonRpc[] = []
        for (let index = 0; index < keys.length; index++) {

            payload.push(
                Web3Source.constructJSONRPC(address, Method.GET_DATA, keys[index])
            )

        }

        // call node
        const results: any = await this.callContract(payload)

        // map results to keys
        const returnValues: {
            key: string;
            value: Record<string, any> | null;
        }[] = []
        for (let index = 0; index < payload.length; index++) {

            returnValues.push({
                key: keys[index],
                value: Web3Source.decodeResult(
                    Method.GET_DATA,
                    results.find(element => payload[index].id === element.id)
                )
            })

        }

        return returnValues

    }

    private static constructJSONRPC(
        address: string,
        method: Method,
        methodParam?: string
    ): JsonRpc {

        if (!CONSTANTS.methods[method]) {

            throw new Error('Contract method "' + method + '"not supported')

        }

        const data = methodParam
            ? CONSTANTS.methods[method].sig + methodParam.replace('0x', '')
            : CONSTANTS.methods[method].sig

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
            id: (idCount += 1)
        }

    }

    private async callContract(payload) {

        return new Promise((resolve, reject) => {

            // Send old web3 method with callback to resolve promise
            this.provider.send(payload, (error, response) => {

                if (error) {

                    reject(error)

                } else {

                    resolve(response)

                }

            })

        })

    }

    private static decodeResult(method: Method, result) {

        if (!CONSTANTS.methods[method]) {

            console.error(
                'Contract method: "' + method + '" is not supported.'
            )
            return null

        }
        const rpcResult = result.result
        return rpcResult === '0x'
            ? null
            : web3abi.decodeParameter(
                CONSTANTS.methods[method].returnEncoding,
                rpcResult
            )

    }

}
