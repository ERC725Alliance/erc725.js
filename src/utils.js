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


export const utilities = {

  // TODO: This will not function withouth 'this' context of ERC725 class at the moment
  decodeByData: (schema, allRawData) => {

    // Loop throuch schema when provided all ERC725 keys from blockchain source of truth
    for (let index = 0; index < schema.length; index++) {
      const schemaElement = schema[index]
      let schemaElementDefinition = null
      // Looping through data
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

        // Check if the data is a match with the checked or modified schema
        if (dataElement.key === schemaElementDefinition.key) {
          // decode the data, and add to result
          const decodedElement = this._decodeKeyValue(schemaElementDefinition, dataElement.value)
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

  },

  // TODO: This will not function withouth 'this' context of ERC725 class at the moment
  decodeDataBySchema = async (schemaElementDefinition, value) => {

    // TYPE: ARRAY
    if (schemaElementDefinition.keyType.toLowerCase() === "array") {
      // Handling a schema elemnt of type Arra Get the array length first
      const arrayLength = this._decodeKeyValue(schemaElementDefinition, value)

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
      return this._decodeKeyValue(schemaElementDefinition, value)

    // TYPE: UNKNOWN
    } else {
      return Error('There is no recognized keyType for this key.')
    }

  }

}