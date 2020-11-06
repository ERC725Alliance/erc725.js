// Tests for the ERC725.js package
import assert from 'assert'
import { ERC725 } from '../src/index.js'
import { mockData } from './mockData.js'
import { mockSchema } from './mockSchema.js'

// make one schema that tests every single type
// make mockup provider. to check decoding
// make test for encode. give key, string, returns encoded hexstring. example handling array is 
// always returns and array of objects with kv pairs. if no array return the object
// make test for decode, encode

const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e"

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
    const data = mockData.find(e => { return e.key === schema.key })
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // TODO: Handle reject
        resolve({data:{resultData:[{key:schema.key,value:data.value}]}})
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