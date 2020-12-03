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

    const lowerHashType = hashType.toLowerCase()
    const hashFunction = CONSTANTS.hashFunctions.find(e => e.name === lowerHashType || e.sig === lowerHashType)

    if (!hashFunction) {

        return Error('Unsupported hash type to encode hash and value: ' + hashType)

    }

    // NOTE: QUESTION: Do we need 'toHex', in case future algorithms do not output hex as keccak does?
    return hashFunction.sig + dataHash.replace('0x', '') + Web3Utils.utf8ToHex(dataSource).replace('0x', '')

}

const decodeDataSourceWithHash = value => {

    const hashFunctionSig = value.substr(0, 10)
    const hashFunction = CONSTANTS.hashFunctions.find(e => e.sig === hashFunctionSig)
    const encoodedData = value.replace('0x', '').substr(8) // Rest of data string after function hash
    const dataHash = '0x' + encoodedData.substr(0, 64) // Get jsonHash 32 bytes
    const dataSource = Web3Utils.hexToUtf8('0x' + encoodedData.substr(64)) // Get remainder as URI
    return hashFunction ? { hashFunction: hashFunction.name, dataHash, dataSource } : null

}


const valueTypeEncodingMap = {
    string: {
        encode: value => Web3Abi.encodeParameter('string', value),
        decode: value => Web3Abi.decodeParameter('string', value)
    },
    address: {
        encode: value => Web3Abi.encodeParameter('address', value),
        decode: value => {

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
    // NOTE: Deprecated. For reference/testing in future
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
        encode: value => {

            if (Web3Utils.isAddress(value)) {

                return value.toLowerCase()

            }

            throw new Error('Address: "' + value + '" is an invalid address.')

        },
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
            return result
                ? {
                    hashFunction: result.hashFunction,
                    hash: result.dataHash,
                    url: result.dataSource
                }
                : null

        }
    },
    JSONURL: {
        type: 'custom',
        // eslint-disable-next-line arrow-body-style
        encode: value => {

            // TODO: do json hashing here
            // const hashFunction = CONSTANTS.hashFunctions.find(e => e.sig = value.hashFunction)
            // need the json
            // if (value.json) {

            //     const hash = hashFunction(JSON.stringify(value.json))

            // }
            return encodeDataSourceWithHash(value.hashFunction, value.hash, value.url)

        },
        decode: value => {

            const result = decodeDataSourceWithHash(value)
            return result
                ? {
                    hashFunction: result.hashFunction,
                    hash: result.dataHash,
                    url: result.dataSource
                }
                : null

        }
    }
}


export const encoder = {

    encodeValueType: (type, value) => {

        if (!value) { console.error('Missing value for encodeValueType: "' + type + '".') }
        if (!valueTypeEncodingMap[type]) { throw new Error('Could not encode valueType: "' + type + '".') }

        return (value)
            ? valueTypeEncodingMap[type].encode(value)
            : value

    },

    decodeValueType: (type, value) => {

        if (!value) { console.error('Missing value for encodeValueType: "' + type + '".') }
        if (!valueTypeEncodingMap[type]) { throw new Error('Could not decode valueType: "' + type + '".') }

        return (value)
            ? valueTypeEncodingMap[type].decode(value)
            : value

    },


    encodeValueContent: (type, value) => {

        if (!value) { console.error('Missing value for encodeValueType: "' + type + '".') }
        if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

            throw new Error('Could not encode valueContent: "' + type + '".')

        } else if (type.substr(0, 2) === '0x') {

            return (type === value) ? value : false

        }

        return valueContentEncodingMap[type].encode(value)

    },

    decodeValueContent: (type, value) => {

        if (!value) { console.error('Missing value for encodeValueType: "' + type + '".') }
        if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

            throw new Error('Could not decode valueContent: "' + type + '".')

        } else if (type.substr(0, 2) === '0x') {

            return (type === value) ? value : false

        }

        return valueContentEncodingMap[type].decode(value)

    }

}
