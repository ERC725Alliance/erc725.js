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
import Web3Abi from 'web3-eth-abi'
import { CONSTANTS } from './constants.js'

export const utils = {

  decodeAllData: (schema, allRawData) => {
    // Requires allRawData to be in an array of key/value pairs: {key:'0x908vsd98...',value:'0x9fuuh...'}
    const results = []

    // Loop throuch schema when provided all ERC725 keys from blockchain source of truth
    for (let index = 0; index < schema.length; index++) {
      const schemaElement = schema[index]
      let newSchemaElement = null

      // Looping through data
      for (let i = 0; i < allRawData.length; i++) {
        const dataElement = allRawData[i]; // TODO: Call a change to 'shift()' on data array to avoid more looping

        // MODIFY SCHEMA if we have keyType of array
        if (schemaElement.keyType.toLowerCase() === 'array') {
          // Create appropriate schema element based on keyType and data element
          // Set the assumed array elementKey based on potential match with data key
          const elementKey = schemaElement.elementKey + Web3Utils.leftPad(dataElement.key.substr(dataElement.key.length - 32), 32).replace('0x','')

          // Form new schema schema to check data against
          let newElementValueContent = ''
          try {
            // TODO: QUESTION: what about an array of uints
            Web3Utils.hexToNumber(dataElement.value) // this will be uint if is type array
            newElementValueContent = schemaElement.valueContent // therefore we will use the 'top' schema
          } catch (error) {
            newElementValueContent = schemaElement.elementValueContent // otherwise we assume its no... 
          }
          newSchemaElement = {
            key: elementKey,
            keyType: "Singleton",
            valueContent: newElementValueContent, // value content on first element in the array is
            // valueContent: schemaElement.elementValueContent, // value content on first element in the array is
            valueType: schemaElement.elementValueType,
          }

        } else {
          // Its not an array, so add the single element
          newSchemaElement = schemaElement
        }

        // CHECK FOR MATCH, we can't be sure data not in the schema is included
        if (dataElement.key === newSchemaElement.key) {
          
          const decodedElement = utils.decodeKeyValue(newSchemaElement, dataElement.value) // this will fail being writting to results below becuase it is a number

          if (schemaElement.keyType.toLowerCase() === 'array') { 
            // Handle arrays for original schemaElement (loop), since a match could also be an array length

            try {
              // This will fail when anything BUT the arrayLength key, and fail silently
              // since we don't need array length key-value in the final decoded results
              Web3Utils.hexToNumber(dataElement.value) 
            } catch (error) {
              // Check if there is already an array at the results index
              if (Array.isArray(results[index] && results[index][schemaElement.name])) {
                // If so, add to the existing results element array
                results[index][schemaElement.name].push(decodedElement)
              } else {
                // Otherwise reate the new results element array
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
        } // end CHECK FOR MATCH

        // null results/nothing happens with no match
      }

    } // end forEach schema element

    return results
  },

  encodeAllData: (schema, data) => {
    // Data must come as key/value pairs, where keys are defined as per the schema
    const results = [] // results will be the flattened array of key/value pairs able to be deployed using ABI
    // NOTE: This requires properly formatted input data as per the schema (as expected from dedoce)

    // 1. loop through data // we do this first because it can contain array keys as well
    for (let index = 0; index < data.length; index++) {
      const dataElement = data[index];

      // 2. Find schema for this data data
      // NOTE: Each data element should have an object with a single key, with that key being the schema field name
      const objKey = Object.keys(dataElement)[0]
      const schemaElement = schema.find(e => { return e.name === objKey })

      // 2.1 test to see if matching with an array '[]' key
      // Better to just test for schemaElement keyType 'Array'?
      if (objKey.substr(objKey.length - 2 - 1 ) === '[]' || schemaElement.keyType.toLowerCase() === 'array') {
        // This is an array
        // Create the 'sub' schema for array elements

        // in the first element we put the length remember?
        const elementKey = '' + schemaElement.elementKey + Web3Utils.leftPad(schemaElement.elementKey.substr(schemaElement.key.length - 32), 32).replace('0x','')
        // Form new schema schema to check data against
        const newSchemaElement = {
          key: elementKey,
          keyType: "Singleton",
          valueContent: schemaElement.elementValueContent,
          valueType: schemaElement.elementValueType,
        }

        // Loop through the array of data results
        for (let i = 0; i < dataElement[objKey].length; i++) {
            const e = dataElement[objKey][i]

            let newElementKey
            let newElementValue

            if (i === 0) {
              newElementKey = schemaElement.key
              newElementValue = Web3Utils.padLeft(Web3Utils.numberToHex(dataElement[objKey].length), 64)
              // This is array length key/value pair
              results.push({key:newElementKey, value: newElementValue})
            }
            
          results.push({key: schemaElement.elementKey + Web3Utils.padLeft(i, 32).replace('0x',''), value: utils.encodeKeyValue(newSchemaElement, e)})
        }
      } else {
        // this is a singleton instance
        results.push({key: schemaElement.key, value: utils.encodeKeyValue(schemaElement, dataElement[schemaElement.name])})
      }

      

    }
    
    return results
  },

  decodeKeyValue : (schemaElementDefinition, value) => {

    let sameEncoding = (CONSTANTS.valueContentTypeMap[schemaElementDefinition.valueContent] === schemaElementDefinition.valueType)
    // decode value
    if (
        schemaElementDefinition.valueType !== 'bytes' // we ignore becuase all is decoded by bytes to start with (abi)
        && !Web3Utils.isAddress(value) // checks for addresses, since technically an address is bytes?
    ) {
      value = Web3Abi.decodeParameter(schemaElementDefinition.valueType, value)
    }

    // As per exception above, if address and sameEncoding, then the address still needs to be handled
    if (sameEncoding && Web3Utils.isAddress(value) && !Web3Utils.checkAddressChecksum(value)) {
      sameEncoding = !sameEncoding
    }

    // We are finished if duplicated encoding methods
    if (sameEncoding) {
      return value
    }

    // Detect valueContent type, and handle case
    switch (schemaElementDefinition.valueContent.toLowerCase()) {
      case "keccak256":
        return value
      case "arraylength":
      case "number":
        return Web3Utils.hexToNumber(value)
      case "string":
      case "uri":
      case "markdown":
        return Web3Utils.hexToUtf8(value)
      case "address":
        return Web3Utils.toChecksumAddress(value)
      case "hashedasseturi":
        const assetResult = utils._decodeDataSourceWithHash(value)
        return {
          hashFunction: assetResult.hashFunction,
          assetHash: assetResult.dataHash,
          assetURI: assetResult.dataSource
        }
      case "jsonuri":
        const jsonResult = utils._decodeDataSourceWithHash(value)
        return {
          hashFunction: jsonResult.hashFunction,
          jsonHash: jsonResult.dataHash,
          jsonURI: jsonResult.dataSource
        }
      default:
        break;
    }

  },
  
  encodeKeyValue: (schemaElementDefinition, value) => {
    // @param value: can contain single value, or obj as required by spec
    let result

    let sameEncoding = (CONSTANTS.valueContentTypeMap[schemaElementDefinition.valueContent] === schemaElementDefinition.valueType)

    switch (schemaElementDefinition.valueContent.toLowerCase()) {
      case "keccak256":
        result = value 
        break;
      case "arraylength":
      case "number":
        result = Web3Utils.padLeft(Web3Utils.numberToHex(value), 64)
        break;
      case "string":
      case "uri":
      case "markdown":
        result = Web3Utils.utf8ToHex(value)
        break;
      case "address":
        result = Web3Utils.toChecksumAddress(value)
        break;
      case "hashedasseturi":
        result = utils._encodeDataSourceWithHash(value.hashFunction, value.assetHash, value.assetURI)
        break;
      case "jsonuri":
        result = utils._encodeDataSourceWithHash(value.hashFunction, value.jsonHash, value.jsonURI)
      default:
        break;
    }


    if (
        schemaElementDefinition.valueType !== 'bytes'
        && !sameEncoding
    ) {
      result = Web3Abi.encodeParameter(schemaElementDefinition.valueType, result)
    } else {
      // there is an issue with ['String','string'] type encoding?
      if (
        schemaElementDefinition.valueType === 'string'
        && sameEncoding
        // || schemaElementDefinition.valueType === 'uint256'

      ) {
        
        result = Web3Abi.encodeParameter('bytes', result)
      }

    }
    return result

  },

  encodeKeyName: (name) => {
    return Web3Utils.keccak256(name)
  },

  // Pseudo private functions for internal use
  _encodeDataSourceWithHash: (hashType, dataHash, dataSource) => {
    
      if (!CONSTANTS.hashFunctions.find(e => { return e.name === hashType || e.sig === hashType })) { 
        return Error('Unsupported hash type to encode hash and value')
      }
      // NOTE: QUESTION: Do we need 'toHex', incase future algorithms do not output hex as keccak does?
      const hashData = Web3Utils.padLeft(dataHash,32).replace('0x','') 
      const hashFunction = CONSTANTS.hashFunctions.find(e => { return hashType === e.name || hashType === e.sig })
      return '' + hashFunction.sig + hashData + Web3Utils.utf8ToHex(dataSource).replace('0x','')
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
