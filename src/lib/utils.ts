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
 * @file lib/utils.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import * as Web3Utils from 'web3-utils'
import { Erc725Schema } from '../types/Erc725Schema'

import { encoder, valueContentEncodingMap as valueContentMap } from './encoder'

type Erc725ObjectSchema = Pick<
    Erc725Schema,
    'key' | 'keyType' | 'valueContent' | 'valueType' | 'name'
>;

export const utils = {
    /**
     *
     * @param schemas schemas is an array of objects of schema definitions
     * @param data data is an array of objects of key/value pairs
     * @return: all decoded data as per required by the schema and provided data
     */
    decodeAllData: (schemas: Erc725Schema[], data) => {

        const results = {}

        for (let index = 0; index < schemas.length; index++) {

            const schemaElement = schemas[index]

            const res = utils.decodeKey(schemaElement, data)
            if (res) {

                results[schemaElement.name] = res

            }

        }

        return results

    },

    /**
     *
     * @param schemas schemas is an array of objects of schema definitions
     * @param data data is an array of objects of key/value pairs
     * @return: all encoded data as per required by the schema and provided data
     */
    encodeAllData: (schemas: Erc725Schema[], data) => {

        const results: {key: string, value: string}[] = []

        for (let index = 0; index < schemas.length; index++) {

            const schemaElement = schemas[index]
            const filteredData = data[schemaElement.name]

            const res = utils.encodeKey(schemaElement, filteredData)
            if (res) {

                if (schemaElement.keyType === 'Array') {

                    // Encoded array element returns as key/value pairs
                    results.push(...res)

                } else {

                    // Singleton encoding returns just the value, so we add the key for key/value pair
                    results.push({
                        key: schemaElement.key,
                        value: res
                    })

                }

            }

        }

        return results

    },

    /**
     *
     * @param schema is an object of a schema definitions
     * @param value will be either key/value pairs for a key type of Array, or a single value for type Singleton
     * @return the decoded value/values as per the schema definition
     */
    decodeKey: (schema: Erc725Schema, value) => {

        if (schema.keyType.toLowerCase() === 'array') {

            const results: any[] = []
            const valueElement = value.find(e => e.key === schema.key)
            // Handle empty/non-existent array
            if (!valueElement) {

                return results

            }

            const arrayLength = utils.decodeKeyValue(schema, valueElement.value) || 0

            // This will not run if no match or arrayLength
            for (let index = 0; index < arrayLength; index++) {

                const newSchema = utils.transposeArraySchema(schema, index)
                const dataElement = value.find(e => e.key === newSchema.key)

                if (dataElement) {

                    results.push(
                        utils.decodeKeyValue(newSchema, dataElement.value)
                    )

                }

            } // end for loop

            return results

        }

        if (
            schema.keyType.toLowerCase() === 'singleton'
            || schema.keyType.toLowerCase() === 'mapping'
        ) {

            if (Array.isArray(value)) {

                const newValue = value.find(e => e.key === schema.key)

                // Handle empty or non-values
                if (!newValue) {

                    return null

                }

                return utils.decodeKeyValue(schema, newValue.value)

            }

            return utils.decodeKeyValue(schema, value)

        }

        console.error(
            'Incorrect data match or keyType in schema from decodeKey(): "'
                + schema.keyType
                + '"'
        )
        return null

    },

    /**
     *
     * @param schema is an object of a schema definitions
     * @param value will be either key/value pairs for a key type of Array, or a single value for type Singleton
     * @return the encoded value for the key as per the supplied schema
     */
    encodeKey: (schema: Erc725Schema, value) => {

        // NOTE: This will not guarantee order of array as on chain. Assumes developer must set correct order
        if (schema.keyType.toLowerCase() === 'array' && Array.isArray(value)) {

            const results: { key: string; value: string }[] = []

            for (let index = 0; index < value.length; index++) {

                const dataElement = value[index]
                if (index === 0) {

                    // This is arrayLength as the first element in the raw array
                    results.push({
                        key: schema.key,
                        // @ts-ignore
                        value: utils.encodeKeyValue(schema, value.length) // the array length
                    })

                }

                const newSchema = utils.transposeArraySchema(schema, index)
                results.push({
                    key: newSchema.key,
                    value: utils.encodeKeyValue(newSchema, dataElement)
                })

            }

            return results

        }

        if (
            schema.keyType.toLowerCase() === 'singleton'
            || schema.keyType.toLowerCase() === 'mapping'
        ) {

            return utils.encodeKeyValue(schema, value)

        }

        console.error(
            'Incorrect data match or keyType in schema from encodeKey(): "'
                + schema.keyType
                + '"'
        )
        return null

    },

    /**
     *
     * @param schemaElementDefinition An object of the schema for this key
     * @param value the value to decode
     * @return the decoded value as per the schema
     */
    decodeKeyValue: (schemaElementDefinition, value) => {

        // Check for the missing map.
        if (
            !valueContentMap[schemaElementDefinition.valueContent]
            && schemaElementDefinition.valueContent.substr(0, 2) !== '0x'
        ) {

            throw new Error(
                'The valueContent "'
                    + schemaElementDefinition.valueContent
                    + '" for "'
                    + schemaElementDefinition.name
                    + '" is not supported.'
            )

        }

        let sameEncoding = valueContentMap[schemaElementDefinition.valueContent]
            && valueContentMap[schemaElementDefinition.valueContent].type
                === schemaElementDefinition.valueType.split('[]')[0]
        const isArray = schemaElementDefinition.valueType.substr(
            schemaElementDefinition.valueType.length - 2
        ) === '[]'

        // VALUE TYPE
        if (
            schemaElementDefinition.valueType !== 'bytes' // we ignore becuase all is decoded by bytes to start with (abi)
            && schemaElementDefinition.valueType !== 'string'
            && !Web3Utils.isAddress(value) // checks for addresses, since technically an address is bytes?
        ) {

            // eslint-disable-next-line no-param-reassign
            value = encoder.decodeValueType(
                schemaElementDefinition.valueType,
                value
            )

        }

        // As per exception above, if address and sameEncoding, then the address still needs to be handled
        if (
            sameEncoding
            && Web3Utils.isAddress(value)
            && !Web3Utils.checkAddressChecksum(value)
        ) {

            sameEncoding = !sameEncoding

        }

        if (sameEncoding && schemaElementDefinition.valueType !== 'string') {

            return value

        }

        // VALUE CONTENT
        // We are finished if duplicated encoding methods

        if (isArray && Array.isArray(value)) {

            // value must be an array also
            const results: (string | false)[] = []

            for (let index = 0; index < value.length; index++) {

                const element = value[index]
                results.push(
                    encoder.decodeValueContent(
                        schemaElementDefinition.valueContent,
                        element
                    )
                )

            }

            return results

        }

        return encoder.decodeValueContent(
            schemaElementDefinition.valueContent,
            value
        )

    },

    /**
     *
     * @param schemaElementDefinition An object of the schema for this key
     * @param value can contain single value, or an object as required by schema (JSONURL, or ASSETURL)
     * @return the encoded value as per the schema
     */
    encodeKeyValue: (
        schemaElementDefinition: Erc725ObjectSchema,
        value: string
    ) => {

        // Check if existing in the supported valueContent mapping.
        if (
            !valueContentMap[schemaElementDefinition.valueContent]
            && schemaElementDefinition.valueContent.substr(0, 2) !== '0x'
        ) {

            throw new Error(
                'The valueContent "'
                    + schemaElementDefinition.valueContent
                    + '" for "'
                    + schemaElementDefinition.name
                    + '" is not supported.'
            )

        }

        let result
        const sameEncoding = valueContentMap[schemaElementDefinition.valueContent]
            && valueContentMap[schemaElementDefinition.valueContent].type
                === schemaElementDefinition.valueType.split('[]')[0]
        const isArray = schemaElementDefinition.valueType.substr(
            schemaElementDefinition.valueType.length - 2
        ) === '[]'

        // We only loop if the valueType done by abi.encodeParameter can not handle it directly
        if (Array.isArray(value) && !sameEncoding) {

            // value type encoding will handle it?

            // we handle an array element encoding
            const results: (string | false)[] = []
            for (let index = 0; index < value.length; index++) {

                const element = value[index]
                results.push(
                    encoder.encodeValueContent(
                        schemaElementDefinition.valueContent,
                        element
                    )
                )

            }
            result = results

        } else if (!isArray) {

            // Straight forward encode
            result = encoder.encodeValueContent(
                schemaElementDefinition.valueContent,
                value
            )

        } else if (sameEncoding) {

            result = value // leaving this for below

        }

        if (
            // and we only skip bytes regardless
            schemaElementDefinition.valueType !== 'bytes'
            // Requires encoding because !sameEncoding means both encodings are required
            && !sameEncoding
        ) {

            result = encoder.encodeValueType(
                schemaElementDefinition.valueType,
                result
            )

        } else if (isArray && sameEncoding) {

            result = encoder.encodeValueType(
                schemaElementDefinition.valueType,
                result
            )

        }

        return result

    },

    /**
     *
     * @param name the schema element name
     * @return the name of the key encoded as per specifications
     * @return a string of the encoded schema name
     */
    encodeKeyName: (name: string) => {

        const colon = name.indexOf(':')
        // if name:subname, then construct using bytes16(hashFirstWord) + bytes12(0) + bytes4(hashLastWord)
        return colon !== -1
            ? Web3Utils.keccak256(name.substr(0, colon)).substr(0, 34)
                  + Web3Utils.leftPad(
                      Web3Utils.keccak256(name.substr(colon + 1)).substr(2, 8),
                      32
                  )
            : Web3Utils.keccak256(name) // otherwise just bytes32(hash)

    },

    /**
     *
     * @param key The schema key of a schema with keyType = 'Array'
     * @param index An integer repredenting the inteded array index
     * @return The raw bytes key for the array element
     */
    // eslint-disable-next-line arrow-body-style
    encodeArrayKey: (key: string, index: number) => {

        return (
            key.substr(0, 34)
            + Web3Utils.padLeft(Web3Utils.numberToHex(index), 32).replace(
                '0x',
                ''
            )
        )

    },

    /**
     *
     * @param schemas An array of objects
     * @param {string} key A string of either the schema element name, or key
     * @return The requested schema element from the full array of schemas
     */
    getSchemaElement: (schemas: Erc725Schema[], key: string) => {

        const keyHash = key.substr(0, 2) !== '0x' ? utils.encodeKeyName(key) : key
        const schemaElement = schemas.find(e => e.key === keyHash)
        if (!schemaElement) {

            throw new Error(
                'No matching schema found for key: "'
                    + key
                    + '" ('
                    + keyHash
                    + ').'
            )

        }

        return schemaElement

    },

    /**
     *
     * @param schema An object of a schema defnition that must have a keyType of 'Array'
     * @param index The index of the array element to transpose the schema to
     * @return Modified schema element of keyType 'Singleton' for fetching or decoding/encoding the array element
     */
    // eslint-disable-next-line arrow-body-style
    transposeArraySchema: (
        schema: Erc725Schema,
        index: number
    ): Erc725ObjectSchema => {

        // Use enum Erc725SchemaKeyType instead?
        if (schema.keyType.toLowerCase() !== 'array') {

            console.error(
                'Schema is not of keyType "Array" for schema: "'
                    + schema.name
                    + '".'
            )

        }

        return {
            key: utils.encodeArrayKey(schema.key, index),
            keyType: 'Singleton',
            // TODO: This can be solved by defining an extra "Erc725ArraySchema" for array
            // @ts-ignore
            valueContent: schema.elementValueContent,
            // @ts-ignore
            valueType: schema.elementValueType
        }

    }
}
