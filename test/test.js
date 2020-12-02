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
import Web3Utils from 'web3-utils'
import ERC725 from '../src/index.js'
import { utils } from '../src/lib/utils.js'
import { mockSchema } from './mockSchema.js'
import { HttpProvider, EthereumProvider, ApolloClient } from './mockProviders.js'
import { generateAllRawData, generateAllData, generateAllResults } from './testHelpers.js'

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'

describe('Running erc725.js tests...', () => {

    describe('Getting all data in schema by provider', () => {

        // Construct the full data and results
        const fullResults = generateAllResults(mockSchema)
        const allRawData = generateAllRawData(mockSchema)
        const allGraphData = generateAllData(mockSchema)


        it('with web3.currentProvider', async () => {

            const provider = new HttpProvider({ returnData: allRawData })
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)

        })

        it('with ethereumProvider EIP 1193', async () => {

            const provider = new EthereumProvider({ returnData: allRawData })
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)

        })

        it('with apollo client', async () => {

            const provider = new ApolloClient({ returnData: allGraphData, getAll: true })
            const erc725 = new ERC725(mockSchema, address, { provider, type: 'ApolloClient' })
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)

        })

    })

    describe('Getting data by schema element by provider', () => {

        mockSchema.forEach(schemaElement => {

            it(schemaElement.name + ' with web3.currentProvider', async () => {

                const returnRawData = generateAllRawData([schemaElement])
                const provider = new HttpProvider({ returnData: returnRawData })
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)

            })

            it(schemaElement.name + ' with ethereumProvider EIP 1193', async () => {

                const returnRawData = generateAllRawData([schemaElement])
                const provider = new HttpProvider({ returnData: returnRawData })
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)

            })

            it(schemaElement.name + ' with apollo graph provider', async () => {

                const returnData = generateAllData([schemaElement])
                const provider = new ApolloClient({ returnData })
                const erc725 = new ERC725(mockSchema, address, { provider, type: 'ApolloClient' })
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)

            })

        })

    })


    describe('Testing utility encoding & decoding functions', () => {

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

        it('!!!Decode all data from class instance!', async () => {

            const erc725 = new ERC725(mockSchema)
            const result = erc725.decodeAllData(allGraphData)
            assert.deepStrictEqual(result, fullResults)

        })

        it('!!!Encode all data from class instance!', async () => {

            const erc725 = new ERC725(mockSchema)
            const result = erc725.encodeAllData(fullResults)
            assert.deepStrictEqual(result, allGraphData)

        })

        /* **************************************** */
        /* Testing encoding/decoding field by field */
        for (let index = 0; index < mockSchema.length; index++) {

            const schemaElement = mockSchema[index]

            // ARRAY type:
            if (schemaElement.keyType.toLowerCase() === 'array') {

                it('Encode data values in array: ' + schemaElement.name, async () => {

                    const results = []

                    // Endcode array loop
                    for (let i = 0; i < schemaElement.expectedResult.length; i++) {

                        if (i === 0) {

                            // Push the array length into the first element of results array
                            results.push(Web3Utils.leftPad(
                                Web3Utils.numberToHex(schemaElement.expectedResult.length), 64
                            ))

                        }
                        // Change the encoding on the schema....
                        // const arraySchema = schemaElement
                        const arraySchema = {}
                        arraySchema.name = schemaElement.name
                        arraySchema.key = schemaElement.key
                        arraySchema.keyType = 'Singleton'
                        arraySchema.valueContent = schemaElement.elementValueContent
                        arraySchema.valueType = schemaElement.elementValueType
                        results.push(utils.encodeKeyValue(arraySchema, schemaElement.expectedResult[i]))

                    } // end for loop
                    assert.deepStrictEqual(results, schemaElement.returnGraphData)

                })

                it('Decode data values in array: ' + schemaElement.name, async () => {

                    const results = []

                    // decode array loop
                    for (let i = 0; i < schemaElement.returnGraphData.length; i++) {

                        const element = schemaElement.returnGraphData[i]

                        try {

                            // Fail silently with anything BUT the arrayLength key
                            Web3Utils.hexToNumber(element.value)

                        } catch (error) {

                            const result = utils.decodeKeyValue(schemaElement, element)

                            // Handle object types
                            if (typeof result === 'object' && Object.keys(result).length > 0) {

                                const objResult = {}

                                for (let j = 0; index < Object.keys(result).length; j++) {

                                    const key = Object.keys(result)[j]
                                    const e = result[key]
                                    objResult[key] = e

                                }

                                results.push(objResult)

                            } else {

                                results.push(result)

                            }
                            assert.deepStrictEqual(results, schemaElement.expectedResult)

                        }

                    } // end for loop


                })

                it('Decode all data values for keyType "Array" in: ' + schemaElement.name, async () => {

                    const values = allGraphData.filter(e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34))
                    const intendedResults = generateAllResults([schemaElement])[schemaElement.name]
                    const results = utils.decodeKey(schemaElement, values)
                    assert.deepStrictEqual(results, intendedResults)

                })
                it('Encode all data values for keyType "Array" in:: ' + schemaElement.name, async () => {

                    const data = generateAllResults([schemaElement])[schemaElement.name]
                    // eslint-disable-next-line max-len
                    const intendedResults = allGraphData.filter(e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34))
                    // handle '0x'....
                    // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
                    const results = utils.encodeKey(schemaElement, data)
                    assert.deepStrictEqual(results, intendedResults)

                })

            } else {

                // SINGLETON type: This is not an array, assumed 'Singletoon
                it('Encode data value for: ' + schemaElement.name, async () => {

                    const result = utils.encodeKeyValue(schemaElement, schemaElement.expectedResult)
                    assert.deepStrictEqual(result, schemaElement.returnGraphData)

                })

                it('Decode data value for: ' + schemaElement.name, async () => {

                    const result = utils.decodeKeyValue(schemaElement, schemaElement.returnGraphData)
                    assert.deepStrictEqual(result, schemaElement.expectedResult)

                })


            }

        }

    })

})
