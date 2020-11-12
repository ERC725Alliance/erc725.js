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
 * @file lib/utils.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import Web3Utils from 'web3-utils'
import { CONSTANTS } from './constants.js'

export const utils = {

  decodeAllData: (schema, allRawData) => {

    const results = []
    // Loop throuch schema when provided all ERC725 keys from blockchain source of truth
    for (let index = 0; index < schema.length; index++) {
      const schemaElement = schema[index]
      let newSchemaElement = null
      // Looping through data
      for (let i = 0; i < allRawData.length; i++) {
        const dataElement = allRawData[i];
        // If its an array, handle that
        if (schemaElement.keyType.toLowerCase() === 'array') {
          /// Set the array key
          const elementKey = schemaElement.elementKey + Web3Utils.leftPad(dataElement.key.substr(dataElement.key.length - 32), 32).replace('0x','')
          // Form new schema schema to check data against
          newSchemaElement = {
            key: elementKey,
            keyType: "Singleton",
            valueContent: schemaElement.elementValueContent,
            valueType: schemaElement.elementValueType,
          }

        } else {
          // Its not an array, so add the single element
          newSchemaElement = schemaElement
        }

        // Check if the data is a match with the checked/moodified schema element
        if (dataElement.key === newSchemaElement.key) {
          // Yes, so decode the data, and add to result
          const decodedElement = utils.decodeKeyValue(newSchemaElement, dataElement.value)
          // Handle arrays
          if (schemaElement.keyType.toLowerCase() === 'array') { 
            // Error catch as conditional for simple test for number as the array length
            // which not be included as a key-value in the decoded results (discarded)
            try {
              Web3Utils.hexToNumber(dataElement.value) // this will fail when anything BUT the arrayLength key, and essentially fail silently
            } catch (error) {
              // Check if there is already an array at the results index
              if (Array.isArray(results[index] && results[index][schemaElement.name])) {
                // Add to the existing results element array
                results[index][schemaElement.name].push(decodedElement)
              } else {
                // Create the new results element array
                const obj = {}
                obj[schemaElement.name] = [decodedElement]
                results[index] = obj
              }
            }
          } else {
            // Handle singleton decoded result
            const obj = {}
            obj[newSchemaElement.name] = decodedElement
            results.push(obj)
          }
        }

      }

    }

    return results
  },

  // NOTE: This will not function withouth 'this' context of ERC725 class at the moment
  // since it requires the provider to loop through unknown array keys
  // TODO: Make work with ERC725 class instance provider
  // decodeDataBySchema: async (schemaElementDefinition, value) => {

  //   // TYPE: ARRAY
  //   if (schemaElementDefinition.keyType.toLowerCase() === "array") {
  //     // Handling a schema elemnt of type Arra Get the array length first
  //     const arrayLength = this.decodeKeyValue(schemaElementDefinition, value)

  //     let result = []
  //     // Construct the schema for each element, and fetch
  //     for (let index = 0; index < arrayLength; index++) {
  //       const elementKey = schemaElementDefinition.elementKey + Web3Utils.leftPad(Web3Utils.numberToHex(index), 32).replace('0x','')
  //       const schemaElement = {
  //         key: elementKey,
  //         keyType: "Singleton",
  //         valueContent: schemaElementDefinition.elementValueContent,
  //         valueType: schemaElementDefinition.elementValueType,
  //       }
  //       // TODO: This may never really work here because it needs the main class 'this'
  //       result.push(await this.getData(elementKey, schemaElement))
  //     }
  //     return result

  //   // TYPE: SINGLETON
  //   } else if (schemaElementDefinition.keyType.toLowerCase() === "singleton") {
  //     return this.decodeKeyValue(schemaElementDefinition, value)

  //   // TYPE: UNKNOWN
  //   } else {
  //     return Error('There is no recognized keyType for this key.')
  //   }

  // },
  // TODO: ass encodeAllData function

  // 
  // encodeAllData: (schema, data) => {
  //   const results = []
  //   // NOTE: This requires properly formatted input data. id. nested objects/arrays etc are properly arranged as per the schema
  //   // 1. loop through data // we do this first because it can contain array keys as well
  //   for (let index = 0; index < data.length; index++) {
  //     const dataElement = data[index];

  //     // 2. Find schema by data
  //     // NOTE: Each data element should have an object with a single key, with that key being the schema field name
  //     const objKey = Object.keys(dataElement)[0]
  //     const schemaElement = schema.find(e => { return e.name === Object.keys(dataElement)[0]})

  //     // 2.1 test to see if matching with an array '[]' key
  //     if (objKey.substr(objKey.length - 2 ) === '[]') {
  //       // this is an array
  //       results.push(dataElement[objKey].map(e => {}))
  //     }
  //     results.push(utils.encodeKeyValue(dataElement[schemaElement.name]))

      

  //   }
  //   // 3. encode data by schema types
  // },

  decodeKeyValue : (schemaElementDefinition, value) => {
    // Detect valueContent type, and handle case
    switch (schemaElementDefinition.valueContent.toLowerCase()) {
      case "string":
        return Web3Utils.hexToUtf8(value)
      case "address":
        return value
      case "arraylength":
        return Web3Utils.hexToNumber(value)
      case "keccak256":
        return value
      case "hashedasseturi":
        const assetResult = utils._decodeDataSourceWithHash(value)
        return {hashFunction: assetResult.hashFunction, assetHash: assetResult.dataHash, assetURI: assetResult.dataSource}
      case "jsonuri":
        const jsonResult = utils._decodeDataSourceWithHash(value)
        return { hashFunction: jsonResult.hashFunction, jsonHash: jsonResult.dataHash, jsonURI: jsonResult.dataSource}
      case "uri":
        return Web3Utils.hexToUtf8(value)
      case "markdown":
        return Web3Utils.hexToUtf8(value)
      default:
        break;
    }

  },
  
  encodeKeyValue: (schemaElementDefinition, value) => {
    // @param value: can contain single value, or obj as required by spec
    switch (schemaElementDefinition.valueContent.toLowerCase()) {
      case "string":
        return Web3Utils.utf8ToHex(value)
      case "address":
        return value // No manipulation necessary
      case "arraylength":
        return Web3Utils.numberToHex(value)
      case "keccak256":
        return Web3Utils.keccak256(value) // will do the hashing. Is this appropriate with other patterns?
      case "hashedasseturi":
        // the hash function method name has to be passed in through 'value'
        const assetData = Web3Utils.padLeft(value.assetHash,32).replace('0x','')
        const assetHashFunction = CONSTANTS.hashFunctions.find(e => { return e.name === value.hashFunction || e.sig === value.hashFunction })
        return assetHashFunction + assetData + Web3Utils.utf8ToHex(value.uri).replace('0x','')
      case "jsonuri":
        // the hash function method name has to be passed in through 'value'
        const jsonData = Web3Utils.padLeft(value.jsonHash,32).replace('0x','')
        const jsonHashFunction = CONSTANTS.hashFunctions.find(e => { return e.name === value.hashFunction || e.sig === value.hashFunction })
        return jsonHashFunction + jsonData + Web3Utils.utf8ToHex(value.uri).replace('0x','')
      case "uri":
        return Web3Utils.utf8ToHex(value)
      case "markdown":
        return Web3Utils.utf8ToHex(value)
      default:
        break;
    }

  },

  encodeKeyName: (name) => {
    return Web3Utils.keccak256(name)
  },

  // Pseudo private functions for internal use
  _encodeDataSourceWithHash: (hashType, dataHash, dataSource) => {
      // NOTE: Assuming smart contract is checking for supported hash methods?
      if (!CONSTANTS.hashFunctions[hashType]) { return Error('Unsupported hash type to encode hash and value') }
      // NOTE: Do we need 'toHex', incase future algorithms do not output hex as keccak does?
      const hashData = Web3Utils.padLeft(dataHash,32).replace('0x','') 
      const hashFunction = CONSTANTS.hashFunctions.find(e => { return hashType === e.name || hashType === e.sig })
      return hashFunction + hashData + Web3Utils.utf8ToHex(dataSource).replace('0x','')
  },

  _decodeDataSourceWithHash: (value) => {
      const hashFunctionSig = value.substr(0, 10)
      const hashFunction = CONSTANTS.hashFunctions.find(e => { return e.sig === hashFunctionSig })
      const encoodedData = value.replace('0x','').substr(8) // Rest of data string after function hash
      const dataHash = '0x' + encoodedData.substr(0,64) // Get jsonHash 32 bytes
      const dataSource = Web3Utils.hexToUtf8('0x' + encoodedData.substr(64)) // Get remainder as URI
      return { hashFunction: hashFunction.name, dataHash, dataSource }
  },


}