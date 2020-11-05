// Tests for the ERC725.js package
import assert from 'assert'
import { ERC725 } from '../src/index.js'

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e" // technically this is not really necessary to be valid

const mockSchema = [
  {
    "name": "LSP3Name",
    "key": "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "keyType": "Singleton",
    "valueContent": "String",
    "valueType": "string",
    // Testing fields
    // TODO: Generate call sig from Constants?
    "ethereumCallSig": "0x54f6127fa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "ethereumRawData": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000107061747269636b2d6d63646f77656c6c00000000000000000000000000000000",
    "graphData": "0x7061747269636b2d6d63646f77656c6c",
    "expectedResult": "patrick-mcdowell"
  }
]

// This is raw data from the ethereum chain...

// const graphMockData = {
//   data: {
//     mockData:
//       [
//       // {
//       //   key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
//       //   value: "0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264"
//       // },
//       {
//         key: "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
//         value: "0x7061747269636b2d6d63646f77656c6c"
//       },
//       // {
//       //   key: "0xca76618882d87383fed780cdd8bd4576dcc8c3d08a78ba85b2016652c7fdec40",
//       //   value: "0x697066733a2f2f516d65597a794451725271347334634d36724b737347473932704d35656d51744e6279784b375663525372747178"
//       // }
//     ]
//   }
// }

class HttpProvider {
  send(payload, cb) {
    const callSig = payload.params[0].data
    const schema = mockSchema.find(e => { return e.ethereumCallSig === callSig})
    setTimeout(() => {
      return cb(null, {result:schema.ethereumRawData})
    }, 200);
  }
}

const EthereumProvider = {
  request(props) {
    const callSig = props.params[0].data
    const schema = mockSchema.find(e => { return e.ethereumCallSig === callSig})
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // TODO: Handle reject
        resolve(schema.ethereumRawData)
      }, 200);
    })
  }
}

class ApolloClient {
  // we need too simulate the apollo client?!?!?
  query(props) {
    const fieldKey = props.query.definitions[0].selectionSet.selections[0].arguments[0].value.fields[1].value // this gives the field key in query
    const schema = mockSchema.find(e => { return e.key === fieldKey.value})
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({data:{mockData:[{key:schema.key,value:schema.graphData}]}})
      }, 200);
    })
  }
}

// // providers is emtpy class with 'send'
// // just results in a promise .01
// // returns the 
// // set mock values for all 3 providers

describe('erc725.js', function() {

    describe('decode data', function() {
        mockSchema.forEach(schema => {
          it('with web3.currentProvider', async function() {
              const provider = new HttpProvider()
              const erc725 = new ERC725(mockSchema, address, provider)
              const result = await erc725.getData(schema.key)
              assert.strictEqual(result, schema.expectedResult)

//               // getAllData
//               // const data = erc725.getAllData()
//               // assert.equal(_.find(data, ()=>{}), expectedResult)
              
          })
          it('with ethereumProvider EIP 1193', async function() {
              const provider = EthereumProvider
              const erc725 = new ERC725(mockSchema, address, provider)
              const result = await erc725.getData(schema.key)
              assert.strictEqual(result, schema.expectedResult)

              // getAllData
              // const data = erc725.getAllData()
              // assert.equal(_.find(data, ()=>{}), expectedResult)
          })
//           // Note, this needs to be a different form...
          it('with apollo graph provider', async function() {
              const provider = new ApolloClient()
              const erc725 = new ERC725(mockSchema, address, provider)
              const result = await erc725.getData(schema.key)
              console.log("REAL RESAULT{")
              console.log(result)
              assert.strictEqual(result, schema.expectedResult)

              // getAllData
              // const data = erc725.getAllData()
              // assert.equal(_.find(data, ()=>{}), mockSchema.expectedResult)
          })

//         })

//         // it('with decodeData', function() {

//         //     const erc725 = new ERC725(erc726Address, schema, {})
//         //     assert.equal(erc725.decodeData(key, mockDataGraphProvider), expectedResult)
//         // })
//         // it('with encodeData', function() {

//         //     const erc725 = new ERC725(erc726Address, schema, {})
//         //     assert.equal(erc725.encodeData(key, mockDataGraphProvider), expectedResult)
        })
        
    })
})