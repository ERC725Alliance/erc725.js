


export const utilities = {

  decodeChainData: () => {

    // Loop throuch schema when provided all ERC725 keys from blockchain source of truth
    for (let index = 0; index < this.options.schema.length; index++) {
      const schemaElement = this.options.schema[index]
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

  },

}