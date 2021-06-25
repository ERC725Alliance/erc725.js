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
 * @file test/test.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

// Tests for the ERC725.js package
import assert from 'assert'
import { hexToNumber, leftPad, numberToHex } from 'web3-utils'
import ERC725 from '../src'
import {
    decodeAllData, decodeKey, decodeKeyValue, encodeAllData, encodeKey, encodeKeyValue
} from '../src/lib/utils'
import { Erc725Schema } from '../src/types/Erc725Schema'
import { ApolloClient, EthereumProvider, HttpProvider } from './mockProviders'
import { mockSchema } from './mockSchema'
import {
    generateAllData, generateAllRawData, generateAllResults
} from './testHelpers'

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

            const provider = new ApolloClient({
                returnData: allGraphData,
                getAll: true
            })
            const erc725 = new ERC725(mockSchema, address, {
                provider,
                type: 'ApolloClient'
            })
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)

        })

        it('fetchData JSONURL', async () => {

            // this test does a real request, TODO replace with mock?

            const provider = new HttpProvider({
                returnData: [
                    {
                        key:
              '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
                        value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a626400000000000000'
                    }
                ]
            })
            const erc725 = new ERC725(
                [
                    {
                        name: 'TestJSONURL',
                        key:
              '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
                        keyType: 'Singleton',
                        valueContent: 'JSONURL',
                        valueType: 'bytes'
                    }
                ],
                address,
                provider
            )
            const result = await erc725.fetchData('TestJSONURL')
            assert.deepStrictEqual(result, {
                LSP3Profile: {
                    backgroundImage:
            'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
                    description:
            "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
                    profileImage: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf'
                }
            })

        })

        it('fetchData JSONURL with custom config.ipfsGateway', async () => {

            // this test does a real request, TODO replace with mock?

            const provider = new HttpProvider({
                returnData: [
                    {
                        key:
              '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
                        value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a733e78f2fc4a3304c141e8424d02c9069fe08950c6514b27289ead8ef4faa49d697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a626400000000000000'
                    }
                ]
            })
            const erc725 = new ERC725(
                [
                    {
                        name: 'TestJSONURL',
                        key:
              '0xd154e1e44d32870ff5ade9e8726fd06d0ed6c996f5946dabfdfd46aa6dd2ea99',
                        keyType: 'Singleton',
                        valueContent: 'JSONURL',
                        valueType: 'bytes'
                    }
                ],
                address,
                provider,
                {
                    ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
                }
            )
            const result = await erc725.fetchData('TestJSONURL')
            assert.deepStrictEqual(result, {
                LSP3Profile: {
                    backgroundImage:
            'ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew',
                    description:
            "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
                    profileImage: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf'
                }
            })

        })

        it('fetchData AssetURL', async () => {

            // this test does a real request, TODO replace with mock?

            const provider = new HttpProvider({
                returnData: [
                    {
                        key:
              '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
                        value:
              '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000598019f9b1ea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f697066733a2f2f516d596f387967347a7a6d647532364e537674736f4b6555356f56523668326f686d6f61324378356939316d506600000000000000'
                    }
                ]
            })
            const erc725 = new ERC725(
                [
                    {
                        name: 'TestAssetURL',
                        key:
              '0xf18290c9b373d751e12c5ec807278267a807c35c3806255168bc48a85757ceee',
                        keyType: 'Singleton',
                        valueContent: 'AssetURL',
                        valueType: 'bytes',
                        // Testing data
                        // @ts-ignore
                        expectedResult: {
                            hashFunction: 'keccak256(utf8)', // 0x8019f9b1
                            hash:
                '0xea67779f76db55facacfe81114abcd56b36fe15d63223aba7e5fc8251f68139f', // hash of address '0x0c03fba782b07bcf810deb3b7f0595024a444f4e'
                            url: 'ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf' // FAKE. just used from above
                        }
                    }
                ],
                address,
                provider
            )
            const result = await erc725.fetchData('TestAssetURL')
            assert.strictEqual(
                Object.prototype.toString.call(result),
                '[object Uint8Array]'
            )

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
                const erc725 = new ERC725(mockSchema, address, {
                    provider,
                    type: 'ApolloClient'
                })
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

        it('Encode all data!', async () => {

            const result = encodeAllData(mockSchema, fullResults)
            assert.deepStrictEqual(result, allGraphData)

        })

        it('Decode all data!', async () => {

            const result = decodeAllData(mockSchema, allGraphData)
            assert.deepStrictEqual(result, fullResults)

        })

        it('!!!Encode all data from class instance!', async () => {

            const erc725 = new ERC725(mockSchema)
            const result = erc725.encodeAllData(fullResults)
            assert.deepStrictEqual(result, allGraphData)

        })

        it('!!!Decode all data from class instance!', async () => {

            const erc725 = new ERC725(mockSchema)
            const result = erc725.decodeAllData(allGraphData)
            assert.deepStrictEqual(result, fullResults)

        })

        /* **************************************** */
        /* Testing encoding/decoding field by field */
        for (let index = 0; index < mockSchema.length; index++) {

            const schemaElement = mockSchema[index]

            // ARRAY type:
            if (schemaElement.keyType.toLowerCase() === 'array') {

                it('Encode data values in array: ' + schemaElement.name, async () => {

                    const results: string[] = []

                    // Endcode array loop
                    for (let i = 0; i < schemaElement.expectedResult.length; i++) {

                        if (i === 0) {

                            // Push the array length into the first element of results array
                            results.push(
                                leftPad(
                                    numberToHex(schemaElement.expectedResult.length),
                                    64
                                )
                            )

                        }
                        // Change the encoding on the schema....
                        // const arraySchema = schemaElement
                        const arraySchema: Erc725Schema = {
                            name: schemaElement.name,
                            key: schemaElement.key,
                            keyType: 'Singleton',
                            // @ts-ignore
                            valueContent: schemaElement.elementValueContent,
                            // @ts-ignore
                            valueType: schemaElement.elementValueType
                        }

                        results.push(
                            encodeKeyValue(arraySchema, schemaElement.expectedResult[i])
                        )

                    } // end for loop
                    assert.deepStrictEqual(results, schemaElement.returnGraphData)

                })

                it('Decode data values in array: ' + schemaElement.name, async () => {

                    const results: any[] = []

                    // decode array loop
                    for (let i = 0; i < schemaElement.returnGraphData.length; i++) {

                        const element = schemaElement.returnGraphData[i]

                        try {

                            // Fail silently with anything BUT the arrayLength key
                            hexToNumber(element.value)

                        } catch (error) {

                            const result = decodeKeyValue(schemaElement, element)

                            // Handle object types
                            if (
                                result
                && typeof result === 'object'
                && Object.keys(result).length > 0
                            ) {

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

                it(
                    'Encode all data values for keyType "Array" in:: '
            + schemaElement.name,
                    async () => {

                        const data = generateAllResults([schemaElement])[
                            schemaElement.name
                        ]
                        // eslint-disable-next-line max-len
                        const intendedResults = allGraphData.filter(
                            e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34)
                        )
                        // handle '0x'....
                        // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
                        const results = encodeKey(schemaElement, data)
                        assert.deepStrictEqual(results, intendedResults)

                    }
                )

                it(
                    'Decode all data values for keyType "Array" in: '
            + schemaElement.name,
                    async () => {

                        const values = allGraphData.filter(
                            e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34)
                        )
                        const intendedResults = generateAllResults([schemaElement])[
                            schemaElement.name
                        ]
                        const results = decodeKey(schemaElement, values)
                        assert.deepStrictEqual(results, intendedResults)

                    }
                )

                it(
                    'Encode all data values for keyType "Array" in naked class instance: '
            + schemaElement.name,
                    async () => {

                        const data = generateAllResults([schemaElement])[
                            schemaElement.name
                        ]
                        // eslint-disable-next-line max-len
                        const intendedResults = allGraphData.filter(
                            e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34)
                        )
                        const erc725 = new ERC725([schemaElement])
                        // eslint-disable-next-line max-len
                        // handle '0x'....
                        // intendedResults = intendedResults.filter(e => e !== '0x' && e.value !== '0x')
                        const results = erc725.encodeData(schemaElement.name, data)
                        assert.deepStrictEqual(results, intendedResults)

                    }
                )

                it(
                    'Decode all data values for keyType "Array" in naked class instance: '
            + schemaElement.name,
                    async () => {

                        const values = allGraphData.filter(
                            e => e.key.substr(0, 34) === schemaElement.key.substr(0, 34)
                        )
                        const intendedResults = generateAllResults([schemaElement])[
                            schemaElement.name
                        ]
                        const erc725 = new ERC725([schemaElement])
                        const results = erc725.decodeData(schemaElement.name, values)
                        assert.deepStrictEqual(results, intendedResults)

                    }
                )

            } else {

                // SINGLETON type: This is not an array, assumed 'Singletoon
                it('Encode data value for: ' + schemaElement.name, async () => {

                    const result = encodeKeyValue(
                        schemaElement,
                        schemaElement.expectedResult
                    )
                    assert.deepStrictEqual(result, schemaElement.returnGraphData)

                })

                it('Decode data value for: ' + schemaElement.name, async () => {

                    const result = decodeKeyValue(
                        schemaElement,
                        schemaElement.returnGraphData
                    )
                    assert.deepStrictEqual(result, schemaElement.expectedResult)

                })

                it('Encode data value from naked class instance!', async () => {

                    const erc725 = new ERC725([schemaElement])
                    const result = erc725.encodeData(
                        schemaElement.name,
                        schemaElement.expectedResult
                    )
                    assert.deepStrictEqual(result, schemaElement.returnGraphData)

                })

                it('Decode data value from naked class instance!', async () => {

                    const erc725 = new ERC725([schemaElement])
                    const result = erc725.decodeData(
                        schemaElement.name,
                        schemaElement.returnGraphData
                    )
                    assert.deepStrictEqual(result, schemaElement.expectedResult)

                })

            }

        }

    })

})
