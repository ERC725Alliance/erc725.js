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
import GraphSource from './dataSource/graph'
import Web3Source from './dataSource/web3'


// import Providers from './provider

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
      providerType: providerType || 'graph', // manual for now
      currentProvider: provider,
      address: address
    }

    // TODO: Add conditionals
    // this.currentProvider = new GraphSource (provider)
    if (providerType === 'graph') {
      this.source = new GraphSource({uri:provider})
      // this is graphql
      // this.options.providerType = 'graph'
    } else if (providerType === 'web3') {
      
      // this.source = new Web3Source({provider})
      // TODO: check if web3, and for which type of web3
      // assume everything else is
      this.source = new Web3Source({provider:provider})

    } else if (providerType ==='metamask') {
      console.log('we are using Metamask')
    }
    // 
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
        // reverse process in LSP standards definition
      case "uri":
        return web3utils.hexToUtf8(value)
      case "markdown":
        break;
      default:
        break;
    }

  }

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

  async _fetchAllDataFromSource() {
    const result = await this.source.getDataByEntity(this.options.address)
    if (this.options.providerType === 'graph' || this.options.providerType === 'graph-ws') {
      return result.data[Object.keys(result.data)[0]]
    } else {
      return result
    }
  }

  async _fetchDataFromSource(definition) {
    
    const result = await this.source.getEntityDataByKey(this.options.address, definition.key)
    if (this.options.providerType === 'graph' || this.options.providerType === 'graph-ws') {
      // NOTE: Asssumes the gql result always has the data returned in the first element..PropTypes.any
      // Probably not 100% guarantee. TODO: Confirm
      const res = result.data[Object.keys(result.data)[0]][0].value 
      return res
    } else if (this.options.providerType === 'web3' || this.options.providerType === 'web3-ws') {
      return result
    } else {
      // ASSUMES Ethereum RPC...
    }
    return result
  }

  _getKeyNameHash(name) {
    return web3utils.keccak256(name)
  }

  async getEntity(id) {
    id = id || this.options.address
    // this should suppor arrays...
    // return DataCue.getEntity(hash)
    return this.source.getEntity(id)
  }
  async getEntityData(id) {
    id = id || this.options.address

    // TODO: Get all the data for the entire entity
    // const rawEntity = this.getEntityRawData(id)

  }
  async getEntityRawData(id) {
    id = id || this.options.address
    return await this.source.getDataByEntity(id)
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
    return this._decodeDataByType(schemaElementDefinition, rawData)
  }

  async getAllData() {
    const allRawData = await this._fetchAllDataFromSource()
    let result = {}
    // We map by the schema, as this is considered the limit of the data model

    for (let index = 0; index < this.options.schema.length; index++) {
      const schemaElement = this.options.schema[index]
      let schemaElementDefinition = null
      for (let i = 0; i < allRawData.length; i++) {
        const dataElement = allRawData[i];
        // If its an array, handle that
        if (schemaElement.keyType.toLowerCase() === 'array') {
          /// Set the array key
          const elementKey = schemaElement.elementKey + web3utils.leftPad(dataElement.key.substr(dataElement.key.length - 32), 32).replace('0x','')
          // Form new schema schema to check data against
          schemaElementDefinition = {
            key: elementKey,
            keyType: "Singleton",
            valueContent: schemaElement.elementValueContent,
            valueType: schemaElement.elementValueType,
          }
        } else {
          // Its not an array
          schemaElementDefinition = schemaElement
        }

        // Check if the data is a match with the schema
        if (dataElement.key === schemaElementDefinition.key) {
          // decode the data, and add to result
          const decodedElement = this._decodeData(schemaElementDefinition, dataElement.value)
          // Special case for arrays
          if (schemaElement.keyType.toLowerCase() === 'array') { 
            // Error catch as conditional for simple test for number as the array length, which not needed here
            try {
              web3utils.hexToNumber(dataElement.value) // this will fail when anything BUT the arrayLength key
            } catch (error) {
              result[schemaElement.name] ? result[schemaElement.name].push(decodedElement) : result[schemaElement.name] = [decodedElement]
            }
          } else {
            result[schemaElementDefinition.name] = decodedElement
          }
        }

      }

    }
    return result
  }
}
