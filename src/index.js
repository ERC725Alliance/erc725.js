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
    // TODO: Add more sophistiacted includes/checks
    this.options = {
      name,
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

  // placeholder method in case...
  _setProvider() { }

  _decodeDataByType(type, value) {
    // TODO: add type checks
    switch (type) {
      case "String":
        return web3.utils.hexToUtf8(value)
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
      // case substr(0,2) === "0x":
      //   break;
    
      default:
        break;
    }

  }

  _getEntityFromSource() {
    // This likely returns some entity basic info, and a list of keys
  }

  async _getDataFromSource(definition) {
    // query the actual source
    // TODO: We will need to check the currentProvider for which type it is...
    return await source.getEntityDataByKey(this.options.address, definition.key)
  }

  _getDataByKey () { }
  _getDataByEntity () { }

  _getKeyNameHash(name) {
    return web3utils.keccak256(name)
  }

  getEntity(id) {
    id = id || this.options.address
    console.log('trying to get the single entity...')
    console.log(id)
    // this should suppor arrays...
    // return DataCue.getEntity(hash)
    return source.getEntity(id)
  }
  async getEntityRawData(id) {
    id = id || this.options.address
    return await source.getDataByEntity(id)
  }

  async getData(key) {
    let keyHash
    // Convert key to hashed version regardless
    if (key.substr(0,2) !== "0x") {
      // NOTE: Assumes no plain text names starting with 0x aka zero byte
      keyHash = this._getKeyNameHash(key)
    } else {
      keyHash = key
    }

    // Get the correct schema key definition
    let keyDefinition = null
    for (let i = 0; i < this.options.schema.length; i++) {
      const e = this.options.schema[i];
      console.log(e)
      if (e.key === keyHash) {
        keyDefinition = e
        break
      }
    }

    if (!keyDefinition) {
      return Error('there is no key of this name defined')
    }

    // Get the actual data the data
    const rawData = await this._getDataFromSource(keyDefinition)
    // Decode and return the data
    // TODO: Handle multiple same types with loop
    return this._decodeDataByType(keyDefinition.valueContent, rawData.data.erc725DataStores[0].value)
  }
}
