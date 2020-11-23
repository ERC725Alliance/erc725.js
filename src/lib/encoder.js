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
    along with ERC725.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/encoder.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  this handles encoding and decoding as per necessary for the erc725 schema specifications
*/

import Web3Abi from 'web3-eth-abi'
import Web3Utils from 'web3-utils'
import { CONSTANTS } from './constants.js'

export const encoder = {

  encodeValueType: (type, value) => {
    if (!valueTypeEncodingMap[type]) { throw new Error(type + ' encoding type not supported.')}
    return valueTypeEncodingMap[type].encode(value)
  },

  decodeValueType: (type, value) => {
    if (!valueTypeEncodingMap[type]) { throw new Error(type + ' decoding type not supported.')}
    return valueTypeEncodingMap[type].decode(value)
  },


  encodeValueContent: (type, value) => {
    if (!valueContentEncodingMap[type]) { throw new Error(type + ' encoding type not supported.')}
    return valueContentEncodingMap[type].encode(value)
  },

  decodeValueContent: (type, value) => {
    if (!valueContentEncodingMap[type]) { throw new Error(type + ' decoding type not supported.')}
    return valueContentEncodingMap[type].decode(value)
  },

}

const valueTypeEncodingMap = {
  "string": {
    encode: (value) => { return Web3Abi.encodeParameter('string', value) },
    decode: (value) => { return Web3Abi.decodeParameter('string', value) }
  },
  "address": {
    encode: (value) => { return Web3Abi.encodeParameter('address', value) },
    decode: (value) => { return Web3Abi.decodeParameter('address', value) }
  },
  // NOTE: We could add conditional handling of numeric values here...
  "uint256": {
    encode: (value) => { return Web3Abi.encodeParameter('uint256', value) },
    decode: (value) => { return Web3Abi.decodeParameter('uint256', value) }
  },
  "bytes32": {
    encode: (value) => { return Web3Abi.encodeParameter('bytes32', value) },
    decode: (value) => { return Web3Abi.decodeParameter('bytes32', value) }
  },
  "bytes": {
    encode: (value) => { return Web3Abi.encodeParameter('bytes', value) },
    decode: (value) => { return Web3Abi.decodeParameter('bytes', value) }
  },
  "string[]": {
    encode: (value) => { return Web3Abi.encodeParameter('string[]', value) },
    decode: (value) => { return Web3Abi.decodeParameter('string[]', value) }
  },
  "address[]": {
    encode: (value) => { return Web3Abi.encodeParameter('address[]', value) },
    decode: (value) => { return Web3Abi.decodeParameter('address[]', value) }
  },
  "uint256[]": {
    encode: (value) => { return Web3Abi.encodeParameter('uint256[]', value) },
    decode: (value) => { return Web3Abi.decodeParameter('uint256[]', value) }
  },
  "bytes32[]": {
    encode: (value) => { return Web3Abi.encodeParameter('bytes32[]', value) },
    decode: (value) => { return Web3Abi.decodeParameter('bytes32[]', value) }
  },
  "bytes[]": {
    encode: (value) => { return Web3Abi.encodeParameter('bytes[]', value) },
    decode: (value) => { return Web3Abi.decodeParameter('bytes[]', value) }
  },
}

const valueContentEncodingMap = {
  "Keccak256": { type: 'bytes32',
    encode: (value) => { return value },
    decode: (value) => { return value }
  },
  "ArrayLength": { type: 'uint256',
    encode: (value) => { return Web3Utils.padLeft(Web3Utils.numberToHex(value), 64) },
    decode: (value) => { return parseInt(Web3Utils.hexToNumber(value)) }
  },
  "Number": { type: 'uint256',
    // NOTE; extra logic is to handle and always return a string number
    encode: (value) => { 
      try { value = parseInt(value) } catch (error) { throw new Error(error) }
      return Web3Utils.padLeft(Web3Utils.numberToHex(value), 64) 
    },
    decode: (value) => { return '' + parseInt(Web3Utils.hexToNumber(value)) }
  },
  // NOTE: This is not symmetrical, and always returns a checksummed address
  "Address": {
    type: 'address',
    encode: (value) => { return Web3Utils.toChecksumAddress(value) },
    decode: (value) => { return Web3Utils.toChecksumAddress(value) }
  },
  "String": {
    type: 'string',
    encode: (value) => { return Web3Utils.utf8ToHex(value) },
    decode: (value) => { return Web3Utils.hexToUtf8(value) }
  },
  "Markdown": {
    type: 'string',
    encode: (value) => { return Web3Utils.utf8ToHex(value) },
    decode: (value) => { return Web3Utils.hexToUtf8(value) }
  },
  "URI": {
    type: 'string',
    encode: (value) => { return Web3Utils.utf8ToHex(value) },
    decode: (value) => { return Web3Utils.hexToUtf8(value) }
  },
  "HashedAssetURI": {
    type: 'custom',
    encode: (value) => { return encodeDataSourceWithHash(value.hashFunction, value.assetHash, value.assetURI) },
    decode: (value) => { const result = decodeDataSourceWithHash(value); return { hashFunction: result.hashFunction, assetHash: result.dataHash, assetURI: result.dataSource } }
  },
  "JSONURI": {
    type: 'custom',
    encode: (value) => { return encodeDataSourceWithHash(value.hashFunction, value.jsonHash, value.jsonURI) },
    decode: (value) => { const result = decodeDataSourceWithHash(value); return { hashFunction: result.hashFunction, jsonHash: result.dataHash, jsonURI: result.dataSource } }
  },
}

const encodeDataSourceWithHash = (hashType, dataHash, dataSource) => {
  
    if (!CONSTANTS.hashFunctions.find(e => { return e.name === hashType || e.sig === hashType })) { 
      return Error('Unsupported hash type to encode hash and value: ' + hashType)
    }
    // NOTE: QUESTION: Do we need 'toHex', incase future algorithms do not output hex as keccak does?
    const hashData = Web3Utils.padLeft(dataHash,32).replace('0x','') 
    const hashFunction = CONSTANTS.hashFunctions.find(e => { return hashType === e.name || hashType === e.sig })
    return '' + hashFunction.sig + hashData + Web3Utils.utf8ToHex(dataSource).replace('0x','')
}

const decodeDataSourceWithHash = (value) => {
    const hashFunctionSig = value.substr(0, 10)
    const hashFunction = CONSTANTS.hashFunctions.find(e => { return e.sig === hashFunctionSig })
    const encoodedData = value.replace('0x','').substr(8) // Rest of data string after function hash
    const dataHash = '0x' + encoodedData.substr(0,64) // Get jsonHash 32 bytes
    const dataSource = Web3Utils.hexToUtf8('0x' + encoodedData.substr(64)) // Get remainder as URI
    return { hashFunction: hashFunction.name, dataHash, dataSource }
}

