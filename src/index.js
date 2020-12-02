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

        // Init options member
        this.options = {
            schema,
            address
        }
        this.utils = Utils

        // do not fail on no-provider
        if (!provider) return

        const givenProvider = provider.provider || provider

        if (provider.type === 'ApolloClient') {

            this.options.providerType = 'graph'
            // TODO: Confirm better is to just use passed in provider
            // this.provider = new GraphSource({uri:provider.uri})
            this.provider = new GraphSource(givenProvider)


            // CASE: Ethereum provider

        } else if (provider.request || provider.type === 'EthereumProvider') {


            this.options.providerType = 'ethereum'
            this.provider = new EthereumSource(givenProvider)


            // CASE: Web3 or deprectaed ethereum provider

        } else if ((!provider.request && provider.send) || provider.type === 'Web3Provider') {

            this.options.providerType = 'web3'
            this.provider = new Web3Source(givenProvider)


            // CASE: Unknown provider

        } else {

            throw new Error('Incorrect or unsupported provider', givenProvider)

        }

    }

    async getData(key, customSchema) {

        if (!web3.utils.isAddress(this.options.address)) { throw new Error('Missing ERC725 contract address.') }
        if (!this.provider) { throw new Error('Missing provider.') }

        // Param key can be either the name or the key in the schema
        // NOTE: Assumes no plain text names starting with 0x aka zero byte
        const keyHash = (key.substr(0, 2) !== '0x') ? utils.encodeKeyName(key) : key

        // Get the correct schema key definition if its not passed as a parameter
        const keySchema = (!customSchema)
            ? this.options.schema.find(f => keyHash === f.key)
            : customSchema

        // Helpful error
        if (!keySchema) { throw Error('There is no matching key in schema of hash: "' + keyHash + '".') }

        // Get the raw data
        const rawData = await this.provider.getData(this.options.address, keySchema.key)
        // Decode and return the data
        return this._decodeByKeyType(keySchema, rawData)

    }

    async getAllData() {

        if (!web3.utils.isAddress(this.options.address)) { throw new Error('Missing ERC725 contract address.') }
        if (!this.provider) { throw new Error('Missing provider.') }

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
        this.options.schema.forEach(element => { results[element.name] = null })

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
                const elementKey = utils.encodeArrayKey(schemaElementDefinition.key, index)
                const schemaElement = {
                    key: elementKey,
                    keyType: 'Singleton',
                    valueContent: schemaElementDefinition.elementValueContent,
                    valueType: schemaElementDefinition.elementValueType
                }
                const res = await this.getData(elementKey, schemaElement)
                if (res) {

                    result.push(await this.getData(elementKey, schemaElement))

                }

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
