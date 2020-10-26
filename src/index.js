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

console.log('do we have the package?')

export class ERC725 {
  // NOTE: Conditionally leaving out 'address' for now during development to test with multiple entity datastore
  constructor(name, schema, provider, providerType, address) {
    // super()
    // TODO: Add more sophistiacted includes/checks
    this.options = {
      name,
      schema, // typeof Array
      // contractAddress: address, // Would be more difficult to set address here, since each ERC725 instance has unique address
      providerType: providerType || 'gql', // manual for now
      currentProvider: provider,
      address
    }
    // this.options.currentProvider = provider // follows web3 'Contract' convention
    // NOTE: For initial development we are hard coding usage of apollo graphql provider
    // support 4 types of current provider:
    // 1. graphql server @param 'gql'
    // 2. graphql websocket server @param 'gql-socket'
    // 3. web3 rpc @param 'web3'
    // 4. ethereum rpc @param 'rpc'
  }

  // placeholder method in case...
  _setProvider() { }

  _decodeDataByType(type, value) {
    // TODO: add type checks
    switch (type) {
      case "String":
        return value
      case "Address":
        break;
      case "Keccak256":
        break;
      case "HashedAssetURI":
        break;
      case "JSONURI":
        break;
      case "URI":
        break;
      case "Markdown":
        break;
      case type.substr(0,2) === "0x":
        break;
    
      default:
        break;
    }

  }

  _getEntityFromSource() {
    // This likely returns some entity basic info, and a list of keys
  }

  _getDataFromSource(definition) {
    // query the actual source
    // We will need to check the currentProvider for which type it is...
    let sourceData

    const type = this.options.sourceType
    if (type === 'gql') {
      // query ERC725 subraph
    } else {
      // query web3 or ethereum rpc
    }
    return sourceData
  }

  _getDataByKey () {

  }
  _getDataByEntity () {

  }

  _getKeyNameHash(name) {
    // return the keccack265 hash of the string
    return web3utils.keccak256(string)
  }


  getEntity(id) {
    // return DataCue.getEntity(hash)
    return source.getEntity(id)
  }
  getEntityData(id) {
    return source.getDataByEntity(id)
  }

  getData(key, id) {
    // this needs to know the keyname hash... technically we don't need the string name
    // TODO: check for firt 'bytes' to see of it's a hash?
    // id is assumed address...
    let addy = id || this.address
    let keyHash
    if (key.substr(0,2) !== "0x") {
      // Assumes no plain text names starting with 0x
      keyhash = this._getKeyNameHash(key)
    } else {
      keyHash = key
    }

    // Get the correct schema key definition
    let keyDefinition = null
    for (let i = 0; i < this.options.schema.length; i++) {
      const e = this.options.schema[i];
      if (e === keyHash) {
        keyDefinition = e
        break
      }
    }

    // if (!keyDefinition) {
    //   return Error('there is no key of this name defined')
    // }

    // Now we must get the data
    const rawData = this._getDataFromSource(keyDefinition, addy)
    const decoodedData = this._decodeDataByType(rawData, keyDefinition)

  }
}
