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
 * @file lib/encoder.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  this handles encoding and decoding as per necessary for the erc725 schema specifications
*/

import Web3Abi from 'web3-eth-abi'
import {
    hexToNumber, hexToUtf8, isAddress, numberToHex, padLeft, toChecksumAddress, utf8ToHex
} from 'web3-utils'

import { CONSTANTS } from './constants'
import { hashData } from './utils'

const encodeDataSourceWithHash = (
    hashType: string,
    dataHash: string,
    dataSource: string
): string => {

    const lowerHashType = hashType.toLowerCase()
    const hashFunction = CONSTANTS.hashFunctions.find(
        e => e.name === lowerHashType || e.sig === lowerHashType
    )

    if (!hashFunction) {

        throw new Error(
            'Unsupported hash type to encode hash and value: ' + hashType
        )

    }

    // NOTE: QUESTION: Do we need 'toHex', in case future algorithms do not output hex as keccak does?
    return (
        hashFunction.sig
        + dataHash.replace('0x', '')
        + utf8ToHex(dataSource).replace('0x', '')
    )

}

const decodeDataSourceWithHash = (
    value: string
): { hashFunction: string; dataHash: string; dataSource: string } | null => {

    const hashFunctionSig = value.substr(0, 10)
    const hashFunction = CONSTANTS.hashFunctions.find(
        e => e.sig === hashFunctionSig
    )
    const encodedData = value.replace('0x', '').substr(8) // Rest of data string after function hash
    const dataHash = '0x' + encodedData.substr(0, 64) // Get jsonHash 32 bytes
    const dataSource = hexToUtf8('0x' + encodedData.substr(64)) // Get remainder as URI
    return hashFunction
        ? { hashFunction: hashFunction.name, dataHash, dataSource }
        : null

}

const valueTypeEncodingMap = {
    string: {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('string', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('string', value)
    },
    address: {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('address', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('address', value)
    },
    // NOTE: We could add conditional handling of numeric values here...
    uint256: {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('uint256', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('uint256', value)
    },
    bytes32: {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('bytes32', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('bytes32', value)
    },
    bytes: {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('bytes', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('bytes', value)
    },
    'string[]': {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('string[]', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('string[]', value)
    },
    'address[]': {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('address[]', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('address[]', value)
    },
    'uint256[]': {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('uint256[]', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('uint256[]', value)
    },
    'bytes32[]': {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('bytes32[]', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('bytes32[]', value)
    },
    'bytes[]': {
        // @ts-ignore
        encode: value => Web3Abi.encodeParameter('bytes[]', value),
        // @ts-ignore
        decode: value => Web3Abi.decodeParameter('bytes[]', value)
    }
}

// Use enum for type bellow
// Is it this enum Erc725SchemaValueType? (If so, custom is missing fron enum)
export const valueContentEncodingMap = {
    Keccak256: {
        type: 'bytes32',
        encode: value => value,
        decode: value => value
    },
    // NOTE: Deprecated. For reference/testing in future
    ArrayLength: {
        type: 'uint256',
        encode: value => padLeft(numberToHex(value), 64),
        decode: value => hexToNumber(value)
    },
    Number: {
        type: 'uint256',
        // NOTE; extra logic is to handle and always return a string number
        encode: value => {

            // eslint-disable-next-line no-param-reassign
            try {

                // eslint-disable-next-line no-param-reassign
                value = parseInt(value, 10)

            } catch (error) {

                throw new Error(error)

            }

            return padLeft(numberToHex(value), 64)

        },
        decode: value => '' + hexToNumber(value)
    },
    // NOTE: This is not symmetrical, and always returns a checksummed address
    Address: {
        type: 'address',
        encode: value => {

            if (isAddress(value)) {

                return value.toLowerCase()

            }

            throw new Error('Address: "' + value + '" is an invalid address.')

        },
        decode: value => toChecksumAddress(value)
    },
    String: {
        type: 'string',
        encode: value => utf8ToHex(value),
        decode: value => hexToUtf8(value)
    },
    Markdown: {
        type: 'string',
        encode: value => utf8ToHex(value),
        decode: value => hexToUtf8(value)
    },
    URL: {
        type: 'string',
        encode: value => utf8ToHex(value),
        decode: value => hexToUtf8(value)
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
        encode: (value: {hash?: string; json?: unknown, hashFunction: string, url: string}) => {

            const {
                hash, json, hashFunction, url
            } = value

            let hashedJson = hash

            if (json) {

                hashedJson = hashData(json, hashFunction)

            }

            if (!hashedJson) {

                throw new Error('You have to provider either the hash or the json via the respective properties')

            }

            return encodeDataSourceWithHash(
                hashFunction,
                hashedJson,
                url
            )

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

export function encodeValueType(type: string, value: string): string {

    if (!valueTypeEncodingMap[type]) {

        throw new Error('Could not encode valueType: "' + type + '".')

    }

    return value ? valueTypeEncodingMap[type].encode(value) : value

}

export function decodeValueType(type: string, value: string) {

    if (!valueTypeEncodingMap[type]) {

        throw new Error('Could not decode valueType: "' + type + '".')

    }

    if (value === '0x') return null

    return value ? valueTypeEncodingMap[type].decode(value) : value

}

export function encodeValueContent(type: string, value: string): string | false {

    if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

        throw new Error('Could not encode valueContent: "' + type + '".')

    } else if (type.substr(0, 2) === '0x') {

        return type === value ? value : false

    }

    return value ? valueContentEncodingMap[type].encode(value) : '0x'

}

export function decodeValueContent(type: string, value: string): string | false {

    if (!valueContentEncodingMap[type] && type.substr(0, 2) !== '0x') {

        throw new Error('Could not decode valueContent: "' + type + '".')

    } else if (type.substr(0, 2) === '0x') {

        return type === value ? value : false

    }

    return value ? valueContentEncodingMap[type].decode(value) : value

}
