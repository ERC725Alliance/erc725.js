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
import { ERC725Source as source } from './dataSource/gqlApollo'

// TODO: First initial steps
// 0. Get the basic library definitions from the ERC725 spec basicc import some type of ERC735 library standard
// 1. Bring in the schema, addres, and provider during instantiation
// 2. Attach schema
// 3. Attach web3 provider

// NOTE: dont attach full web3 provider, just the provider object
// NOTE: We want to avoid using whole web3 library
// NOTE: Most likely create seperate source files for dataSrouce types based on provider

export class ERC725 {
  // NOTE: Conditionally leaving out 'address' for now during development to test with multiple entity datastore
  constructor(schema, address, provider, providerType) {
    // TODO: Add more sophistiacted includes/checks
    this.options = {
      schema: schema || null, // typeof Array
      // contractAddress: address, // Would be more difficult to set address here, since each ERC725 instance has unique address
      providerType: providerType || 'gql', // manual for now
      currentProvider: provider,
      address: address
    }
    // this.options.currentProvider = provider // follows web3 'Contract' convention
    // NOTE: For initial development we are hard coding usage of apollo graphql provider
    // support 4 types of current provider:
    // 1. graphql server @param 'gql'
    // 2. graphql websocket server @param 'gql-ws'
    // 3. web3 rpc @param 'web3'
    // 4. ethereum rpc @param 'eth-rpc'
  }
  
  _setProvider() { }

  _validateData(schema, data) {

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
        // we cannot reverse assymetric encryption to check...?
        return value
      case "hashedasseturi":
        break;
      case "jsonuri":
        // reverse process in schema definition
      case "uri":
        return web3utils.hexToUtf8(value)
      case "markdown":
        break;
      default:
        break;
    }

  }

  async _decodeDataByType(schemaElementDefinition, value) {

    // ARRAY
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

    // SINGLETON
    } else if (schemaElementDefinition.keyType.toLowerCase() === "singleton") {
      return this._decodeData(schemaElementDefinition, value)

    // UNKNOWN
    } else {
      return Error('There is no recognized keyType for this key.')
    }

  }

  async _fetchDataFromSource(definition) {
    // query the actual source
    // TODO: We will need to check the currentProvider for which type it is...
    return await source.getEntityDataByKey(this.options.address, definition.key)
  }

  _getKeyNameHash(name) {
    return web3utils.keccak256(name)
  }

  async getEntity(id) {
    id = id || this.options.address
    // this should suppor arrays...
    // return DataCue.getEntity(hash)
    return source.getEntity(id)
  }
  async getEntityData(id) {
    id = id || this.options.address

    // TODO: Get all the data for the entire entity
    // const rawEntity = this.getEntityRawData(id)

  }
  async getEntityRawData(id) {
    id = id || this.options.address
    return await source.getDataByEntity(id)
  }

  async getData(key, customSchema) { // optional schemaElement if handling array keyTypes
    let keyHash
    // Convert key to hashed version regardless
    if (key.substr(0,2) !== "0x") {
      // NOTE: Assumes no plain text names starting with 0x aka zero byte
      keyHash = this._getKeyNameHash(key)
    } else {
      keyHash = key
    }

    // Get the correct schema key definition
    let schemaElementDefinition
    if (!customSchema && this.options.schema) {
      this.options.schema.forEach(e => {
        if (e.key === keyHash) {
          schemaElementDefinition = e
        }
      })
    } else {
      schemaElementDefinition = customSchema
    }

    if (!schemaElementDefinition) {
      return Error('There is no matching key in this schema.')
    }

    // Get the actual data the data
    const rawData = await this._fetchDataFromSource(schemaElementDefinition)
    // Decode and return the data
    // TODO: Handle multiple same types with loop
    // TODO: Return raw value from fetch source
    return this._decodeDataByType(schemaElementDefinition, rawData.data.erc725DataStores[0].value)
  }
}
