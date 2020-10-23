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

// TODO: First initial steps
// 0. Get the basic library definitions from the ERC725 spec basicc import some type of ERC735 library standard
// 1. Bring in the schema, addres, and provider during instantiation
// 2. Attach schema
// 3. Attach web3 provider

// NOTE: dont attach full web3 provider, just the provider object
// NOTE: We want to avoid using whole web3 library
// NOTE: Most likely create seperate source files for dataSrouce types based on provider

export class ERC725 {
  constructor(schema, address, provider) {
    super()
    // TODO: Add more sophistiacted includes/checks
    this.options = {
      schema, // typeof Array
      contractAddress: address,
    }
    this.currentProvider = provider // follows web3 'Contract' convention
    // this.setProvider = this.setProvider.bind(this)
  }

  // placeholder method
  _setProvider() {

  }
  

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

  _getDataFromSource() {
    // querey the actual source
    // We will need to check the currentProvider for which type it is...

    if (currentSourceType === 'graphql') {
      // query ERC725 subraph
    } else {
      // query web3 or ethereum rpc
    }

  }

  _getKeyNameHash(name) {
    // return the keccack265 hash of the string
    return web3utils.keccak256(string)
  }



  getData(key) {
    // this needs to know the keyname hash... technically we don't need the string name
    // TODO: check for firt 'bytes' to see of it's a hash?
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

    if (!keyDefinition) {
      return Error('there is no key of this name defined')
    }

    // Now we must get the data
    this._getDataFromSource(keyDefinition)

  }
}
