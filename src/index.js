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
 * @author Fabian Vogelsteller <fabian@lukso.network>, Robert McLeod <@robertdavid010>
 * @date 2020
 */

import * as web3utils from 'web3-utils'
import GraphSource from './providers/subgraphProviderWrapper'
import Web3Source from './providers/web3ProviderWrapper'
import EthereumSource from './providers/ethereumProviderWrapper'

// TODO: nodescript test
// TODO: Tests. Node script to all kind of key type, use for unit tests: Npm MOCHA
// make one schema that tests every single type
// make mockup provider. to check decoding
// make test for encode. give key, string, returns encoded hexstring. example handling array is 
// always returns and array of objects with kv pairs. if no array return the object
// make test for decode, encode
// TODO: Add encode method

    // so send a custom provider object for graph
    // {
    //   uri: 'string'
    //   type: 'graphql'
    // }

export class ERC725 {
  constructor(schema, address, provider) {
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
    
    if (providerName === 'HttpProvider' || providerName === 'WebsocketProvider' || providerName === 'IpcProvider') {
      this.options.providerType = 'web3'
      this.source = new Web3Source({provider:provider})
    } else if (provider.type === 'graph') {
      // We have a graph node provider
      this.options.providerType = 'graph'
      this.source = new GraphSource({uri:provider.uri})
      // TODO: add
      // If no provider name or graph, and doesnt have request, and instead send
    } else if (!providerName && provider.request) {
      this.options.providerType = 'ethereum'
      console.log('Detected ethereum type')
      // TODO: Complete support of ethereum/metamask
      this.source = new EthereumSource({provider:provider})

      // this.source = new Web3Source({provider:provider})
    } else {
      throw new Error('Incorrect or unsupported provider')
    }

  }

  async getData(key, customSchema) {
    // @param key can be either the name or the key in the schema
    // NOTE: Assumes no plain text names starting with 0x aka zero byte
    const keyHash = (key.substr(0,2) !== "0x") ? this._getKeyNameHash(key) : key

    // Get the correct schema key definition if its not passed as a parameter
    const keySchema = (!customSchema) ? this.options.schema.find(f => { return keyHash === f.key }) : customSchema
    // Helpful error
    if (!keySchema) { throw Error('There is no matching key in schema.') }

    // Get the raw data
    const rawData = await this.source.getData(this.options.address, keySchema.key)
    // Decode and return the data
    return this._decodeDataByType(keySchema, rawData)
  }

  async getAllData() {
    // Get all the key hashes from the schema
    const keyHashes = this.options.schema.map(e => { return e.key })
    // Get all the raw data from the provider based on schema key hashes
    let allRawData = await this.source.getAllData(this.options.address, keyHashes)
    // Take out null values
    allRawData = allRawData.filter(e => { return e.value !== null })
    
    // Stage results array
    const results = []

    // Decode the raw data
    allRawData.forEach(async (e) => {
      // Get the relevant schema key definition so we know decode type
      const keySchema = this.options.schema.find(f => {
        return e.key === f.key
      })
      const obj = {}
      // Add decoded data to results array
      obj[keySchema.name] = await this._decodeDataByType(keySchema, e.value)
      results.push(obj)
    })

    return results
  }

  // DetermineType
  async _decodeDataByType(schemaElementDefinition, value) {

    // TYPE: ARRAY
    if (schemaElementDefinition.keyType.toLowerCase() === "array") {
      // Get the array length first
      const arrayLength = this._decodeData(schemaElementDefinition, value)

      let result = []
      // Construct the schema for each element, and fetch
      for (let index = 0; index < arrayLength; index++) {
        const elementKey = schemaElementDefinition.elementKey + web3utils.leftPad(web3utils.numberToHex(index), 32).replace('0x','')
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
        return web3utils.hexToUtf8(value)
      case "address":
        return value
      case "arraylength":
        return web3utils.hexToNumber(value)
      case "keccak256":
        // we cannot reverse assymetric encryption to check...
        return value
      case "hashedasseturi":
        // TODO: properly decode here
        return value
      case "jsonuri":
        return web3utils.hexToUtf8(value)
      case "uri":
        return web3utils.hexToUtf8(value)
      case "markdown":
        break;
      default:
        break;
    }

  }

  _getKeyNameHash(name) {
    return web3utils.keccak256(name)
  }

}
