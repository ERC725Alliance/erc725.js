// Tests for the ERC725.js package
import assert from 'assert'
import { ERC725 } from '../src/index.js'

// make one schema that tests every single type
// make mockup provider. to check decoding
// make test for encode. give key, string, returns encoded hexstring. example handling array is 
// always returns and array of objects with kv pairs. if no array return the object
// make test for decode, encode

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e"

const mockSchema = [
  // TODO: Generate call sig from Constants?
  {
    "name": "LSP3Name",
    "key": "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "keyType": "Singleton",
    "valueContent": "String",
    "valueType": "string",
    // Testing fields
    "ethereumCallSig": "0x54f6127fa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "ethereumRawData": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000107061747269636b2d6d63646f77656c6c00000000000000000000000000000000",
    "graphData": "0x7061747269636b2d6d63646f77656c6c",
    "expectedResult": "patrick-mcdowell"
  },
  {
    "name": "LSP3Profile",
    "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "keyType": "Singleton",
    "valueContent": "URI",
    "valueType": "string",
    // Testingfields
    "ethereumCallSig": "0x54f6127f5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "ethereumRawData": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a62640000000000000000000000",
    "graphData": "0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264",
    "expectedResult": "ipfs://QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd"
  },
]


// This is data for a single profile from graphQl
const mockGraphData = [
  {
    "key": "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
    "value": "0x50a02ef693ff6961a7f9178d1e53cc8bbe1dad68"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000",
    "value": "0xc444009d38d3046bb0cf81fa2cd295ce46a67c78"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001",
    "value": "0x4febc3491230571f6e1829e46602e3b110215a2e"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000002",
    "value": "0xb92a8dda288638491aee5c2a003d4cabfa47ae3f"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000003",
    "value": "0x1e52e7f1707dcda57dd33f003b2311652a465aca"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000004",
    "value": "0x0bda71aa980d37ea56e8a3784e4c309101daf3e4"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000005",
    "value": "0xfdb4d9c299438b9839e9d04e34b9609c5b56600d"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000006",
    "value": "0x081d3f0bff8ae2339cb65113822eec1510704d5c"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000007",
    "value": "0x55c98c6944b7497faaf4db0386a1ad1e6eff526e"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000008",
    "value": "0x90d1a1d68fa23aeee991220703f1a1c3782e0b35"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000009",
    "value": "0xdb5ab19792d9fb61c1dff57810fb7c6f839af8ed"
  },
  {
    "key": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
    "value": "0x000000000000000000000000000000000000000000000000000000000000000a"
  },
  {
    "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "value": "0x697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a6264",
    "raw":"0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d6245724b6833466a73415236596a73546a485a4e6d364d6344703661527438324674637639414a4a765a62640000000000000000000000"
  },
  {
    "key": "0xa5f15b1fa920bbdbc28f5d785e5224e3a66eb5f7d4092dc9ba82d5e5ae3abc87",
    "value": "0x7061747269636b2d6d63646f77656c6c",
    "raw": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000107061747269636b2d6d63646f77656c6c00000000000000000000000000000000"
    
  },
  {
    "key": "0xca76618882d87383fed780cdd8bd4576dcc8c3d08a78ba85b2016652c7fdec40",
    "value": "0x697066733a2f2f516d65597a794451725271347334634d36724b737347473932704d35656d51744e6279784b375663525372747178"
  }
]


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
  query(props) {
    const fieldKey = props.query.definitions[0].selectionSet.selections[0].arguments[0].value.fields[1].value // this gives the field key in query
    const schema = mockSchema.find(e => { return e.key === fieldKey.value})
    const mockData = mockGraphData.find(e => { return e.key === schema.key })
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // TODO: Handle reject
        resolve({data:{mockData:[{key:schema.key,value:mockData.value}]}})
      }, 200);
    })
  }
}

describe('erc725.js', function() {

    describe('Getting data by provider type...', function() {
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
          it('with apollo graph provider', async function() {
              const provider = new ApolloClient()
              const erc725 = new ERC725(mockSchema, address, provider)
              const result = await erc725.getData(schema.key)
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