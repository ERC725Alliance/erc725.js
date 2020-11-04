// Tests for the package
var assert = require('assert');
import { ERC725 } from '../src/index'
// const { ERC725 } = require('../src/index')

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e" // technically this is not really necessary to be valid

const mockSchema = [
  {
    "name": "LSP3Name",
    "key": "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "keyType": "Singleton",
    "valueContent": "String",
    "valueType": "string",
    "expectedResult": "patrick-mcdowell"
    // "expectedResult": "0x7061747269636b2d6d63646f77656c6c" // not official
  }
]

// const Web3MockData = {
//   // This is raw data from the ethereum chain...
//   data: [
//     {test:'test'},
//     {test:'test'}
//   ]
// }

const GraphMockData = {
  data: [
    // {
    //   key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    //   value: "0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264"
    // },
    {
      key: "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
      value: "0x7061747269636b2d6d63646f77656c6c"
    },
    // {
    //   key: "0xca76618882d87383fed780cdd8bd4576dcc8c3d08a78ba85b2016652c7fdec40",
    //   value: "0x697066733a2f2f516d65597a794451725271347334634d36724b737347473932704d35656d51744e6279784b375663525372747178"
    // }
  ]
}

const Web3MockProvider = {
  send() {
    return new Promise((resolve, reject) => {
      // return the stuff after .1 sec
      setTimeout(() => {
        resolve(mockSchema.expectedResult)
      }, 1000);
    })
  },
}

const EthereumMockProvider = {
  request() {
    return new Promise((resolve, reject) => {
      // return the stuff after .1 sec
      setTimeout(() => {
        resolve(mockSchema.expectedResult)
      }, 1000);
    })
  }
}

const GraphMockProvider = {
  // we need too simulate the apollo client?!?!?
  type: 'graph',
  uri: 'fakegraphuri.com'

}

// providers is emtpy class with 'send'
// just results in a promise .01
// returns the 
// set mock values for all 3 providers

describe('erc725.js', function() {

    describe('should work for bytes', function() {
        // const key = '0x234567890'
        // const expectedResult = '0x12345678'
        // const mockDataWeb3Provider = '0x0000000000000000012345678'
        // const mockDataGraphProvider = '0x12345678'
        mockSchema.forEach(schema => {
          console.log('inside test.js')
          it('with web3.currentProivder', async function() {
              // const web3ProviderMock = new MockProvider(mockDataWeb3Provider)
              const erc725 = new ERC725(address, schema, MockProvider)

              const result = await erc725.getData(schema.key)
              // getData
              assert.equal(result, mockSchema.expectedResult)

              // getAllData
              // const data = erc725.getAllData()
              // assert.equal(_.find(data, ()=>{}), expectedResult)
              
          })
          it('with ethereumProvider EIP 1193', async function() {
              // const web3ProviderMock = new MockProvider(mockDataWeb3Provider)
              const erc725 = new ERC725(address, schema, MockProvider)

              const result = await erc725.getData(schema.key)
              // getData
              assert.equal(result, mockSchema.expectedResult)

              // getAllData
              // const data = erc725.getAllData()
              // assert.equal(_.find(data, ()=>{}), expectedResult)
          })
          // Note, this needs to be a different form...
          // it('with erc725subgraph provider', async function() {
          //     // const web3ProviderMock = new MockProvider(mockDataGraphProvider)
          //     const erc725 = new ERC725(address, schema, MockProvider)

          //     const result = await erc725.getData(schema.key)
          //     // getData
          //     assert.equal(result, mockSchema.expectedResult)

          //     // getAllData
          //     // const data = erc725.getAllData()
          //     // assert.equal(_.find(data, ()=>{}), mockSchema.expectedResult)
          // })

        })

        // it('with decodeData', function() {

        //     const erc725 = new ERC725(erc726Address, schema, {})
        //     assert.equal(erc725.decodeData(key, mockDataGraphProvider), expectedResult)
        // })
        // it('with encodeData', function() {

        //     const erc725 = new ERC725(erc726Address, schema, {})
        //     assert.equal(erc725.encodeData(key, mockDataGraphProvider), expectedResult)
        // })
        
    })
})