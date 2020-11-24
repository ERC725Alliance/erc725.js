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
 * @file test/test.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

// Tests for the ERC725.js package
import assert from 'assert'
import ERC725, { utils } from '../src/index.js'
import Web3Utils from 'web3-utils'
import { mockSchema } from './mockSchema.js'
import { HttpProvider, EthereumProvider, ApolloClient } from './mockProviders.js'

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e"

describe('Running erc725.js tests...', function() {

    describe('Getting all data in schema by provider', function() {
        // Construct the full data return and results objects....
        const fullResults = generateAllResults(mockSchema)
        const allRawData = generateAllRawData(mockSchema)
        const allGraphData = generateAllData(mockSchema)

        it('with web3.currentProvider', async () => {
            const provider = new HttpProvider({returnData:allRawData})
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)
        })
        it('with ethereumProvider EIP 1193', async () => {
            const provider = new EthereumProvider({returnData:allRawData})
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)
        })
        it('with apollo client', async () => {
            const provider = new ApolloClient({returnData: allGraphData, getAll:true})
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)
        })

    })

    describe('Getting data by schema element by provider', function() {
        mockSchema.forEach(schemaElement => {

            it(schemaElement.name +' with web3.currentProvider', async () => {
                const returnRawData = generateAllRawData([schemaElement])
                const provider = new HttpProvider({returnData: returnRawData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

            it(schemaElement.name +' with ethereumProvider EIP 1193', async () => {
                const returnRawData = generateAllRawData([schemaElement])
                const provider = new HttpProvider({returnData: returnRawData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

            it(schemaElement.name +' with apollo graph provider', async () => {
                const returnData = generateAllData([schemaElement])
                const provider = new ApolloClient({returnData: returnData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

        })

    })


    describe('Testing utility encoding & decoding functions', function() {

        const allGraphData = generateAllData(mockSchema)
        const fullResults = generateAllResults(mockSchema)

        /* ********************************************* */
        /* Testing encoding/decoding for all schema data */
        it('Decode all data!', async () => {
            const result = utils.decodeAllData(mockSchema, allGraphData)
            assert.deepStrictEqual(result, fullResults)
        })


        it('Encode all data!', async () => {
            const result = utils.encodeAllData(mockSchema, fullResults)
            assert.deepStrictEqual(result, allGraphData)
        })

        /* **************************************** */
        /* Testing encoding/decoding field by field */
        for (let index = 0; index < mockSchema.length; index++) {
            const schemaElement = mockSchema[index]

            // ARRAY type:
            if (schemaElement.keyType.toLowerCase() === "array") {

                it('Encode data values in array: ' + schemaElement.name, async () => {
                    let results = []

                    // Endcode array loop
                    for (let i = 0; i < schemaElement.expectedResult.length; i++) {
                        if (i === 0) {
                            // Push the array length into the first element of results array
                            results.push(Web3Utils.leftPad(Web3Utils.numberToHex(schemaElement.expectedResult.length),64))
                        }
                        // Change the encoding on the schema....
                        const arraySchema = schemaElement
                        arraySchema.valueContent = schemaElement.elementValueContent
                        arraySchema.valueType = schemaElement.elementValueType
                        arraySchema.keyType = 'Singleton'
                        results.push(utils.encodeKeyValue(arraySchema, schemaElement.expectedResult[i]))

                    } // end for loop
                    assert.deepStrictEqual(results, schemaElement.returnGraphData)
                })

                it('Decode data values in array: ' + schemaElement.name, async () => {
                    let results = []

                    // decode array loop
                    for (let i = 0; i < schemaElement.returnGraphData.length; i++) {
                        const element = schemaElement.returnGraphData[i];

                        try {
                            Web3Utils.hexToNumber(element.value) // this will fail when anything BUT the arrayLength key, and essentially fail silently
                        } catch (error) {
                            const result = utils.decodeKeyValue(schemaElement, element)

                            // Handle object types
                            if (typeof result === 'object' && Object.keys(result).length > 0) {

                                const objResult = {}
                                for (const key in result) {
                                    if (result.hasOwnProperty(key)) {
                                        const element = result[key];
                                        objResult[key] = element
                                    }
                                }

                                results.push(objResult)
                            } else {
                                results.push(result)
                            }
                            assert.deepStrictEqual(results, schemaElement.expectedResult)

                        }

                    } // end for loop


                })

            // SINGLETON type: This is not an array, assumed 'Singletoon
            } else {

                it('Encode data value for: ' + schemaElement.name, async () => {
                    const result = utils.encodeKeyValue(schemaElement, schemaElement.expectedResult)
                    assert.deepStrictEqual(result, schemaElement.returnGraphData)
                })

                it('Decode data value for: ' + schemaElement.name, async () => {
                    const result = utils.decodeKeyValue(schemaElement, schemaElement.returnGraphData)

                    // NOTE: What was the original point of this?
                    // if (typeof result === 'object' && Object.keys(result).length > 0) {

                    //     const newResult = {}
                    //     for (const key in result) {
                    //         if (result.hasOwnProperty(key)) {
                    //             const element = result[key];
                    //             newResult[key] = element
                    //         }
                    //     }

                    //     assert.deepStrictEqual(newResult, schemaElement.expectedResult)
                    // } else {

                        assert.deepStrictEqual(result, schemaElement.expectedResult)
                    // }
                })


            }

        }

    })
})


function generateAllRawData(schema) {
    // takes the schema object and builds a full dataset as per expected from provider
    const results = []
    for (let index = 0; index < schema.length; index++) {
        const element = schema[index];
        // if is array push data
        if (element.keyType === 'Array') {
            element.returnRawData.forEach((e, i) => {
                if (i === 0) { // we assume always first element in the array in returnData array is the length
                    results.push({key: element.key, value: e}) 
                } else {
                    // This is array length key/value pair
                    const newElementKey = '' + element.elementKey + Web3Utils.padLeft(Web3Utils.numberToHex(i - 1), 32).replace('0x','')
                    results.push({ key: newElementKey, value: e })
                }
            })
        } else {
            results.push({key:element.key, value: element.returnRawData})
        }

    }
    return results
}

function generateAllData(schema) {
    // takes the schema object and builds a full dataset as per expected from provider
    const results = []
    for (let index = 0; index < schema.length; index++) {
        const element = schema[index];

        // if is a 'nested' array, need to flatten it, and add {key,value} elements
        if (element.keyType === 'Array') {
            element.returnGraphData.forEach((e, i, a) => {

                if (i === 0) {
                    // We need the new key, and to 'flatten the array as per expected from chain data
                    results.push({key: element.key, value: e}) // we subtract one from length because this has the extra array length key in the array
                } else {
                    // This is array length key/value pair
                    const newElementKey = '' + element.elementKey + Web3Utils.padLeft(Web3Utils.numberToHex(i - 1), 32).replace('0x','')
                    results.push({ key: newElementKey, value: e })
                }
            }) // end .forEach()

        } else {
            results.push({ key: element.key, value: element.returnGraphData })
        }

    }
    return results
}

function generateAllResults(schema) {
    // Take the test schema/cases and builds full expected results
    const results = {}
    schema.forEach(e => { results[e.name] = e.expectedResult })
    return results

}