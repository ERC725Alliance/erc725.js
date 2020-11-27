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

const encodeDataSourceWithHash = (hashType, dataHash, dataSource) => {

    if (!CONSTANTS.hashFunctions.find(e => e.name === hashType || e.sig === hashType)) {

        return Error('Unsupported hash type to encode hash and value: ' + hashType)

    }
    // NOTE: QUESTION: Do we need 'toHex', incase future algorithms do not output hex as keccak does?
    const hashFunction = CONSTANTS.hashFunctions.find(e => hashType === e.name || hashType === e.sig)
    const hashData = Web3Utils.padLeft(dataHash, 32).replace('0x', '')
    return '' + hashFunction.sig + hashData + Web3Utils.utf8ToHex(dataSource).replace('0x', '')

}

const decodeDataSourceWithHash = value => {

    const hashFunctionSig = value.substr(0, 10)
    const hashFunction = CONSTANTS.hashFunctions.find(e => e.sig === hashFunctionSig)
    const encoodedData = value.replace('0x', '').substr(8) // Rest of data string after function hash
    const dataHash = '0x' + encoodedData.substr(0, 64) // Get jsonHash 32 bytes
    const dataSource = Web3Utils.hexToUtf8('0x' + encoodedData.substr(64)) // Get remainder as URI
    return { hashFunction: hashFunction.name, dataHash, dataSource }

}


const valueTypeEncodingMap = {
    string: {
        encode: value => Web3Abi.encodeParameter('string', value),
        decode: value => Web3Abi.decodeParameter('string', value)
    },
    address: {
        encode: value => Web3Abi.encodeParameter('address', value),
        decode: value => {

            console.log(value)
            Web3Abi.decodeParameter('address',
                value)

        }
    },
    // NOTE: We could add conditional handling of numeric values here...
    uint256: {
        encode: value => Web3Abi.encodeParameter('uint256', value),
        decode: value => Web3Abi.decodeParameter('uint256', value)
    },
    bytes32: {
        encode: value => Web3Abi.encodeParameter('bytes32', value),
        decode: value => Web3Abi.decodeParameter('bytes32', value)
    },
    bytes: {
        encode: value => Web3Abi.encodeParameter('bytes', value),
        decode: value => Web3Abi.decodeParameter('bytes', value)
    },
    'string[]': {
        encode: value => Web3Abi.encodeParameter('string[]', value),
        decode: value => Web3Abi.decodeParameter('string[]', value)
    },
    'address[]': {
        encode: value => Web3Abi.encodeParameter('address[]', value),
        decode: value => Web3Abi.decodeParameter('address[]', value)
    },
    'uint256[]': {
        encode: value => Web3Abi.encodeParameter('uint256[]', value),
        decode: value => Web3Abi.decodeParameter('uint256[]', value)
    },
    'bytes32[]': {
        encode: value => Web3Abi.encodeParameter('bytes32[]', value),
        decode: value => Web3Abi.decodeParameter('bytes32[]', value)
    },
    'bytes[]': {
        encode: value => Web3Abi.encodeParameter('bytes[]', value),
        decode: value => Web3Abi.decodeParameter('bytes[]', value)
    }
}


export const valueContentEncodingMap = {
    Keccak256: {
        type: 'bytes32',
        encode: value => value,
        decode: value => value
    },
    ArrayLength: {
        type: 'uint256',
        encode: value => Web3Utils.padLeft(Web3Utils.numberToHex(value), 64),
        decode: value => parseInt(Web3Utils.hexToNumber(value), 10)
    },
    Number: {
        type: 'uint256',
        // NOTE; extra logic is to handle and always return a string number
        encode: value => {

            // eslint-disable-next-line no-param-reassign
            try { value = parseInt(value, 10) } catch (error) { throw new Error(error) }

            return Web3Utils.padLeft(Web3Utils.numberToHex(value), 64)

        },
        decode: value => '' + parseInt(Web3Utils.hexToNumber(value), 10)
    },
    // NOTE: This is not symmetrical, and always returns a checksummed address
    Address: {
        type: 'address',
        encode: value => Web3Utils.toChecksumAddress(value),
        decode: value => Web3Utils.toChecksumAddress(value)
    },
    String: {
        type: 'string',
        encode: value => Web3Utils.utf8ToHex(value),
        decode: value => Web3Utils.hexToUtf8(value)
    },
    Markdown: {
        type: 'string',
        encode: value => Web3Utils.utf8ToHex(value),
        decode: value => Web3Utils.hexToUtf8(value)
    },
    URL: {
        type: 'string',
        encode: value => Web3Utils.utf8ToHex(value),
        decode: value => Web3Utils.hexToUtf8(value)
    },
    AssetURL: {
        type: 'custom',
        encode: value => encodeDataSourceWithHash(value.hashFunction, value.hash, value.url),
        decode: value => {

            const result = decodeDataSourceWithHash(value)
            return {
                hashFunction: result.hashFunction,
                hash: result.dataHash,
                url: result.dataSource
            }

        }
    },
    JSONURL: {
        type: 'custom',
        encode: value => encodeDataSourceWithHash(value.hashFunction, value.hash, value.url),
        decode: value => {

            const result = decodeDataSourceWithHash(value)
            return {
                hashFunction: result.hashFunction,
                hash: result.dataHash,
                url: result.dataSource
            }

        }
    }
}


export const encoder = {

    encodeValueType: (type, value) => {

        if (!valueTypeEncodingMap[type]) { throw new Error('Could not encode valueType: "' + type + '".') }

        return (value)
            ? valueTypeEncodingMap[type].encode(value)
            : value

    },

    decodeValueType: (type, value) => {

        if (!valueTypeEncodingMap[type]) { throw new Error('Could not decode valueType: "' + type + '".') }

        return (value)
            ? valueTypeEncodingMap[type].decode(value)
            : value

    },


    encodeValueContent: (type, value) => {

        if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

            throw new Error('Could not encode valueContent: "' + type + '".')

        } else if (type.substr(0, 2) === '0x') {

            return (type === value) ? value : false

        }

        return valueContentEncodingMap[type].encode(value)

    },

    decodeValueContent: (type, value) => {

        if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

            throw new Error('Could not decode valueContent: "' + type + '".')

        } else if (type.substr(0, 2) === '0x') {

            return (type === value) ? value : false

        }

        return valueContentEncodingMap[type].decode(value)

    }

}
