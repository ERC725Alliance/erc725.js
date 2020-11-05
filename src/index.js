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

// TODO: Add encode method
// TODO: DEBUG: Why is the array handler lagging on providing results (missing await somewhere?)

export class ERC725 {
  constructor(schema, address, provider) {
    // NOTE: These errors will never constiently happen this way properly without type/format checking
    if (!schema) { throw new Error('Missing schema.') } // TODO: Add check for schema format
    if (!address) { throw new Error('Missing address.') } // TODO: check for proper address
    if (!provider) { throw new Error('Missing provider.') }

    // Init options member
    this.options = {
      schema: schema,
      address: address
    }

    // Check provider types
    const providerName = provider && provider.constructor && provider.constructor.name || null
    
    // CASE: WEB3 PROVIDER
    if (providerName === 'HttpProvider' || providerName === 'WebsocketProvider' || providerName === 'IpcProvider') {
      this.options.providerType = 'web3'
      this.provider = new Web3Source({provider:provider})

    // CASE: GRAPH PROVIDER
    } else if (providerName === 'ApolloClient' || provider.type === 'graph') {
      this.options.providerType = 'graph'
      // TODO: Confirm better is to just use passed in provider
      // this.provider = new GraphSource({uri:provider.uri})
      this.provider = new GraphSource(provider)

    // CASE: WEB3 PROVIDER - DEFAULT for no named provider with a 'send' method
    } else if (!providerName && !provider.request && provider.send) {
      this.options.providerType = 'web3'
      this.provider = new Web3Source({provider:provider})

    // CASE: ETHEREUM PROVIDER EIP 1193
    } else if (provider.request) {
      this.options.providerType = 'ethereum'
      this.provider = new EthereumSource({provider:provider})
      // TODO: Complete support of ethereum/metamask

    // CASE: Unknown or incorrect provider
    } else {
      throw new Error('Incorrect or unsupported provider')
    }

  }

  async getData(key, customSchema) {
    // Param key can be either the name or the key in the schema
    // NOTE: Assumes no plain text names starting with 0x aka zero byte
    const keyHash = (key.substr(0,2) !== "0x") ? this._getKeyNameHash(key) : key

    // Get the correct schema key definition if its not passed as a parameter
    const keySchema = (!customSchema) ? this.options.schema.find(f => { return keyHash === f.key }) : customSchema
    // Helpful error
    if (!keySchema) { throw Error('There is no matching key in schema.') }

    // Get the raw data
    const rawData = await this.provider.getData(this.options.address, keySchema.key)
    // Decode and return the data
    return this._decodeDataBySchema(keySchema, rawData)
  }

  async getAllData() {
    // Get all the key hashes from the schema
    const keyHashes = this.options.schema.map(e => { return e.key })
    // Get all the raw data from the provider based on schema key hashes
    let allRawData = await this.provider.getAllData(this.options.address, keyHashes)
    // Take out null values
    allRawData = allRawData.filter(e => { return e.value !== null })
    
    // Stage results array. Can replace with map()
    const results = []

    // Decode the raw data
    allRawData.forEach(async (e) => {
      // Get the relevant schema key definition so we know decode type
      const keySchema = this.options.schema.find(f => {
        return e.key === f.key
      })
      // Array keys will not match, and will be handled in decode method
      if (keySchema) {
        const obj = {}
        // Add decoded data to results array
        obj[keySchema.name] = await this._decodeDataBySchema(keySchema, e.value)
        results.push(obj)
      }
    })
    return results
  }

  // DetermineType
  async _decodeDataBySchema(schemaElementDefinition, value) {

    // TYPE: ARRAY
    if (schemaElementDefinition.keyType.toLowerCase() === "array") {
      // Handling a schema elemnt of type Arra Get the array length first
      const arrayLength = this._decodeData(schemaElementDefinition, value)

      let result = []
      // Construct the schema for each element, and fetch
      for (let index = 0; index < arrayLength; index++) {
        const elementKey = schemaElementDefinition.elementKey + Web3Utils.leftPad(Web3Utils.numberToHex(index), 32).replace('0x','')
        const schemaElement = {
          key: elementKey,
          keyType: "Singleton",
          valueContent: schemaElementDefinition.elementValueContent,
          valueType: schemaElementDefinition.elementValueType,
        }
        result.push(await this.getData(elementKey, schemaElement))
      }
      return result

    // TYPE: SINGLETON
    } else if (schemaElementDefinition.keyType.toLowerCase() === "singleton") {
      return this._decodeData(schemaElementDefinition, value)

    // TYPE: UNKNOWN
    } else {
      return Error('There is no recognized keyType for this key.')
    }

  }

  _decodeData(schemaElementDefinition, value) {
    // Detect valueContent type, and handle case
    switch (schemaElementDefinition.valueContent.toLowerCase()) {
      case "string":
        return Web3Utils.hexToUtf8(value)
      case "address":
        return value
      case "arraylength":
        return Web3Utils.hexToNumber(value)
      case "keccak256":
        // we cannot reverse assymetric encryption to check...
        return value
      case "hashedasseturi":
        // TODO: properly decode here
        return value
      case "jsonuri":
        return Web3Utils.hexToUtf8(value)
      case "uri":
        return Web3Utils.hexToUtf8(value)
      case "markdown":
        // TODO: which decoding to use here?
        return value
      default:
        break;
    }

  }

  _getKeyNameHash(name) {
    return Web3Utils.keccak256(name)
  }

}
