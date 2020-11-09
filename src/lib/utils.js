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

        // Check if the data is a match with the checked 
        if (dataElement.key === newSchemaElement.key) {
          // decode the data, and add to result
          const decodedElement = utils.decodeKeyValue(newSchemaElement, dataElement.value)
          // Special case for arrays
          if (schemaElement.keyType.toLowerCase() === 'array') { 
            // Error catch as conditional for simple test for number as the array length, which not needed here
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
            const obj = {}
            obj[newSchemaElement.name] = decodedElement
            results.push(obj)
          }
        }




      }

    }

    return results

  },

  // TODO: This will not function withouth 'this' context of ERC725 class at the moment
  decodeDataBySchema: async (schemaElementDefinition, value) => {

    // TYPE: ARRAY
    if (schemaElementDefinition.keyType.toLowerCase() === "array") {
      // Handling a schema elemnt of type Arra Get the array length first
      const arrayLength = this.decodeKeyValue(schemaElementDefinition, value)

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
        // TODO: This may never really work here because it needs the main class 'this'
        result.push(await this.getData(elementKey, schemaElement))
      }
      return result

    // TYPE: SINGLETON
    } else if (schemaElementDefinition.keyType.toLowerCase() === "singleton") {
      return this.decodeKeyValue(schemaElementDefinition, value)

    // TYPE: UNKNOWN
    } else {
      return Error('There is no recognized keyType for this key.')
    }

  },

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

  },

  encodeKeyName: (name) => {
    return Web3Utils.keccak256(name)
  },

}