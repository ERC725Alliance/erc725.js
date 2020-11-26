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
 * @file index.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import Web3Utils from 'web3-utils'
import GraphSource from './providers/subgraphProviderWrapper.js'
import Web3Source from './providers/web3ProviderWrapper.js'
import EthereumSource from './providers/ethereumProviderWrapper.js'
import { utils as Utils } from './lib/utils.js'

export const utils = Utils


export default class ERC725 {

    constructor(schema, address, provider) {

        // provider param can be either the provider, or and object with {provider: ,type:}
        // we first check if they sent a provider type with

        // NOTE: These errors will never constiently happen this way without type/format checking
        if (!schema) { throw new Error('Missing schema.') } // TODO: Add check for schema format
        if (!address) { throw new Error('Missing address.') } // TODO: check for proper address
        if (!provider) { throw new Error('Missing provider.') }

        // Init options member
        this.options = {
            schema,
            address
        }
        this.utils = Utils

        // Check provider types
        let providerName

        if (provider.type) {

            providerName = provider.type
            // eslint-disable-next-line no-param-reassign
            provider = provider.provider

        } else if (provider && provider.constructor && provider.constructor.name) {

            providerName = provider.constructor.name

        } else {

            providerName = null

        }

        // CASE: WEB3 PROVIDER
        if (providerName === 'HttpProvider' || providerName === 'WebsocketProvider' || providerName === 'IpcProvider') {

            this.options.providerType = 'web3'
            this.provider = new Web3Source(provider)

            // CASE: GRAPH PROVIDER

        } else if (providerName === 'ApolloClient') {

            this.options.providerType = 'graph'
            // TODO: Confirm better is to just use passed in provider
            // this.provider = new GraphSource({uri:provider.uri})
            this.provider = new GraphSource(provider)

            // CASE: OLD WEB3 PROVIDER - no named provider only with a 'send' method

        } else if (!providerName && !provider.request && provider.send) {

            // THis is for older metamask
            this.options.providerType = 'ethereum-deprecated'
            this.provider = new EthereumSource(provider, 'deprecated')

            // CASE: ETHEREUM PROVIDER EIP 1193

        } else if (provider.request) {

            this.options.providerType = 'ethereum'
            this.provider = new EthereumSource(provider)

            // CASE: Unknown or incorrect provider

        } else {

            throw new Error('Incorrect or unsupported provider')

        }

    }

    async getData(key, customSchema) {

        // Param key can be either the name or the key in the schema
        // NOTE: Assumes no plain text names starting with 0x aka zero byte
        const keyHash = (key.substr(0, 2) !== '0x') ? utils.encodeKeyName(key) : key

        // Get the correct schema key definition if its not passed as a parameter
        const keySchema = (!customSchema)
            ? this.options.schema.find(f => keyHash === f.key)
            : customSchema
        // Helpful error
        if (!keySchema) { throw Error('There is no matching key in schema.') }

        // Get the raw data
        const rawData = await this.provider.getData(this.options.address, keySchema.key)
        // Decode and return the data
        return this._decodeByKeyType(keySchema, rawData)

    }

    async getAllData() {

        // Get all the key hashes from the schema
        // NOTE: Potentailly redundent, but cleaner
        const keyHashes = this.options.schema.map(e => e.key)
        // Get all the raw data from the provider based on schema key hashes
        let allRawData = await this.provider.getAllData(this.options.address, keyHashes)

        // Take out null data values, since data may not fulfill entire schema
        allRawData = await allRawData.filter(e => e.value !== null)

        if (this.options.providerType === 'graph') {

            // expects all key/values returned from graph query as an array
            // Change this to a return object
            return utils.decodeAllData(this.options.schema, allRawData)

        }
        const results = {}
        // Add a null value by default for each schema item
        this.options.schema.forEach(element => { results[element.name] = '' })

        for (let i = 0; i < allRawData.length; i++) {

            const e = allRawData[i]

            // Array keys may not directly match with provided data, or vice-versa
            const keySchema = this.options.schema.find(f => e.key === f.key)
            // Nulls & mismatches ignored
            if (keySchema) {

                // Add decoded data to results object
                results[keySchema.name] = await this._decodeByKeyType(keySchema, e.value)

            }

        }

        return results

    }

    // DetermineType
    async _decodeByKeyType(schemaElementDefinition, value) {

        // TYPE: ARRAY
        if (schemaElementDefinition.keyType.toLowerCase() === 'array') {

            // Handling a schema element of type Array Get the array length first
            const arrayLength = utils.decodeKeyValue(schemaElementDefinition, value)

            const result = []
            // Construct the schema for each element, and fetch
            for (let index = 0; index < arrayLength; index++) {

                // eslint-disable-next-line max-len
                const elementKey = schemaElementDefinition.elementKey + Web3Utils.leftPad(Web3Utils.numberToHex(index), 32).replace('0x', '')
                const schemaElement = {
                    key: elementKey,
                    keyType: 'Singleton',
                    valueContent: schemaElementDefinition.elementValueContent,
                    valueType: schemaElementDefinition.elementValueType
                }
                result.push(await this.getData(elementKey, schemaElement))

            }

            return result

        }
        // TYPE: SINGLETON
        if (schemaElementDefinition.keyType.toLowerCase() === 'singleton') {

            return utils.decodeKeyValue(schemaElementDefinition, value)

        }

        // TYPE: UNKNOWN
        return Error('There is no recognized keyType for this key.')

    }

}
