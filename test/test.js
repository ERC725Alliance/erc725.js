// Tests for the ERC725.js package
import assert from 'assert'
import { assertType } from 'graphql'
import ERC725, { utils } from '../src/index.js'
import { mockSchema } from './mockSchema.js'

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e"

class HttpProvider {
  constructor(props) {
    // Deconstruct to create local copy of array
    this.returnData = Array.isArray(props.returnData) ? [...props.returnData] : props.returnData
  }
  send(payload, cb) {
    setTimeout(() => {
      return cb(null, {
        result: (Array.isArray(this.returnData)) ? this.returnData.shift() : this.returnData
      })
    }, 100);
  }
}

class EthereumProvider {
  constructor(props) {
    this.returnData = Array.isArray(props.returnData) ? [...props.returnData] : props.returnData
  }
  request() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = (Array.isArray(this.returnData)) ? this.returnData.shift() : this.returnData
        // TODO: Handle reject
        resolve(result)
      }, 100);
    })
  }
}

class ApolloClient {
  constructor(props) {
    // mock data
    this.returnData = props.returnData
    this.returnKey = props.returnKey
    this.getAll = (props.getAll)
  }
  query(props) {
    // const fieldKey = props.query.definitions[0].selectionSet.selections[0].arguments[0].value.fields[1].value // this gives the field key in query
    // const schema = mockSchema.find(e => { return e.key === fieldKey.value})
    // const data = mockData.find(e => { return e.key === schema.key })

    const val = (Array.isArray(this.returnData) && !this.getAll) ? this.returnData.shift() : this.returnData
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // this.getAll flag is used to return different expected query results
        const res = this.getAll ? {data:{mockResults: this.returnData}} : {data:{mockResults:[{key:this.returnKey ,value:val}]}}
        resolve(res)
      }, 100);
    })
  }
}

describe('erc725.js', function() {

    describe('Getting single data by provider and schema type', function() {
        mockSchema.forEach(schemaElement => {

            it('with web3.currentProvider', async () => {
                const provider = new HttpProvider({returnData:schemaElement.returnRawData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

            it('with ethereumProvider EIP 1193', async () => {
                const provider = new EthereumProvider({returnData:schemaElement.returnRawData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

            it('with apollo graph provider', async () => {
                const provider = new ApolloClient({returnKey:schemaElement.key, returnData: schemaElement.returnGraphData})
                const erc725 = new ERC725(mockSchema, address, provider)
                const result = await erc725.getData(schemaElement.key)
                assert.deepStrictEqual(result, schemaElement.expectedResult)
            })

        })
        
    })

    describe('Getting all data by provider', function() {
        // Construct the full return object....
        const fullResults = mockSchema.map(e => {
          const obj = {}
          obj[e.name] = e.expectedResult
          return obj
        })

        // Construct simluated raw data result
        const allRawData = []
        const allGraphData = []
        for (let index = 0; index < mockSchema.length; index++) {
          const element = mockSchema[index];
          // if is array push data
          if (element.keyType === 'Array') {
            element.returnRawData.forEach(e => {
              allRawData.push(e)
            })
            element.returnGraphData.forEach(e => {
              // push as objects to simulate graph query result
              allGraphData.push({key:element.key ,value:e})
            })
          } else {
            allRawData.push(element.returnRawData)
            allGraphData.push({key:element.key ,value:element.returnGraphData})
          }
          
        }

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
            const provider = new ApolloClient({returnKey:'test', returnData: allGraphData, getAll:true})
            const erc725 = new ERC725(mockSchema, address, provider)
            const result = await erc725.getAllData()
            assert.deepStrictEqual(result, fullResults)
        })
      
    })

    describe('Testing utility methods', function() {

        it('decode all data', async () => {
            // const allData = []
            // const allExpectedResults = []
            // mockSchema.forEach(e => {
            //   if (e.keyType.toLowerCase() === 'array') {
            //     console.log("WE ARE IN AN ARRAYYYYYYYYYYYYY!!!!!!!!!!!!!!!!!!!!!!!!!!")
            //     for (let index = 0; index < e.returnGraphData.length; index++) {
            //       // in the first index... we put the array length?
            //       // const elementKey = e.elementKey + Web3Utils.leftPad(dataElement.key.substr(e.key.length - 32), 32).replace('0x','')
            //       const dataElement = e.returnGraphData[index]
            //       const elementKey = e.elementKey.substr(34) + Web3Utils.leftPad(Web3Utils.numbertToHex(index + 1), 32)
            //       // const dataElement = {key: elementKey, value: e.returnGraphData[index]}
            //       allData.push({key: elementKey, value: dataElement})
            //       if (index > 0) {
            //         // Put the raw key/value length into the data
            //         const obj = {}
            //         obj[e.name] = e.expectedResult
            //         allExpectedResults.push(obj)
            //       }
                  
            //     }
            //   } else {
            //     allData.push({key: e.key, value: e.returnGraphData})
            //     const obj = {}
            //     obj[e.name] = e.expectedResult
            //     allExpectedResults.push(obj) 
            //   }
            // })
        const fullResults = mockSchema.map(e => {
          const obj = {}
          obj[e.name] = e.expectedResult
          return obj
        })

        // Construct simluated raw data result
        const allRawData = []
        const allGraphData = []
        for (let index = 0; index < mockSchema.length; index++) {
          const element = mockSchema[index];
          // if is array push data
          if (element.keyType === 'Array') {
            element.returnRawData.forEach(e => {
              allRawData.push(e)
            })
            element.returnGraphData.forEach(e => {
              // push as objects to simulate graph query result
              allGraphData.push({key:element.key ,value:e})
            })
          } else {
            allRawData.push(element.returnRawData)
            allGraphData.push({key:element.key ,value:element.returnGraphData})
          }
          
        }
        //////
            // console.log(allData)
            // console.log(allExpectedResults)
            const result = utils.decodeAllData(mockSchema, allGraphData)
            assert.deepStrictEqual(result, fullResults)
        })

        // Testing encoding/decoding field by field
        for (let index = 0; index < mockSchema.length; index++) {

            const schemaElement = mockSchema[index]
            if (schemaElement.keyType.toLowerCase() === "array") {

              
            } else {

                it('encode data value', async () => {
                    const result = utils.encodeKeyValue(schemaElement, schemaElement.expectedResult)
                    assert.deepStrictEqual(result, schemaElement.returnGraphData)
                })

                it('decode data value', async () => {
                    const result = utils.decodeKeyValue(schemaElement, schemaElement.returnGraphData)
                    console.log('expected decode')
                    console.log(schemaElement.expectedResult)
                    console.log('result:')
                    if (typeof result === 'object' && Object.keys(result).length > 0) {
                      console.log('this returned an object!!!!!!!!')
                      const newResult = {}
                      for (const key in result) {
                        if (result.hasOwnProperty(key)) {
                          const element = result[key];
                          newResult[key] = element
                        }
                      }
                      console.log(result)
                      assert.deepStrictEqual(newResult, schemaElement.expectedResult)
                    } else {

                      assert.deepStrictEqual(result, schemaElement.expectedResult)
                    }
                })


            }
          
        }

        // it('decode data', async () => {
        // })
    })
})

