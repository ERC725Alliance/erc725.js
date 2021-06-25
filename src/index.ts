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
 * @file index.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import { isAddress, keccak256, toChecksumAddress } from 'web3-utils'
import axios from 'axios'

import GraphSource from './providers/subgraphProviderWrapper'
import Web3Source from './providers/web3ProviderWrapper'
import EthereumSource from './providers/ethereumProviderWrapper'
import {
    decodeAllData, decodeKey, decodeKeyValue, encodeAllData, encodeArrayKey, encodeKey, getSchemaElement
} from './lib/utils'

import {
    Erc725Schema,
    Erc725SchemaKeyType,
    Erc725SchemaValueContent,
    Erc725SchemaValueType
} from './types/Erc725Schema'

import { ERC725Config } from './types/Config'

enum ProviderType {
  GRAPH = 'graph',
  ETHEREUM = 'ethereum',
  WEB3 = 'web3',
}

export {
    Erc725Schema,
    Erc725SchemaKeyType,
    Erc725SchemaValueContent,
    Erc725SchemaValueType
}

export class ERC725 {

  options: {
    schema;
    address?;
    providerType?: ProviderType | null;
    provider?;
    config: ERC725Config;
  };

  constructor(schema: Erc725Schema[], address?: string, provider?: any, config?: ERC725Config) {

      // NOTE: provider param can be either the provider, or and object with {provider:xxx ,type:xxx}

      // TODO: Add check for schema format?
      if (!schema) {

          throw new Error('Missing schema.')

      }

      const defaultConfig = {
          ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/'
      }

      // Init options member
      this.options = {
          schema,
          address,
          providerType: null,
          config: {
              ...defaultConfig,
              ...config
          }
      }

      // do not fail on no-provider
      if (!provider) return

      const givenProvider = provider.provider || provider

      // CASE: GraphQL provider

      if (provider.type === 'ApolloClient') {

          this.options.providerType = ProviderType.GRAPH
          this.options.provider = new GraphSource(givenProvider)

          // This checks to see if its a subgraph, since TheGraph subgraphs cannot checksum addresses to store
          const isSubgraph = givenProvider.link?.options?.uri.includes('/subgraph')
          if (!isSubgraph && address) {

              this.options.address = toChecksumAddress(address)

          }


          // CASE: Ethereum provider

      } else if (provider.request || provider.type === 'EthereumProvider') {

          this.options.providerType = ProviderType.ETHEREUM
          this.options.provider = new EthereumSource(givenProvider)

          // CASE: Web3 or deprectaed ethereum provider

      } else if (
          (!provider.request && provider.send)
      || provider.type === 'Web3Provider'
      ) {

          this.options.providerType = ProviderType.WEB3
          this.options.provider = new Web3Source(givenProvider)

          // CASE: Unknown provider

      } else {

          throw new Error(`Incorrect or unsupported provider ${givenProvider}`)

      }

  }

  /**
   * Get decoded data from the contract key value store.
   * @param {string} key Either the schema name or key of a schema element on the class instance.
   * @param {*} [customSchema] An optional schema to override attached schema of ERC725 class instance.
   * @returns Returns decoded data as defined and expected in the schema
   */
  async getData(key: string, customSchema?: Erc725Schema) {

      if (!isAddress(this.options.address)) {

          throw new Error('Missing ERC725 contract address.')

      }
      if (!this.options.provider) {

          throw new Error('Missing provider.')

      }

      const schema = customSchema ? [customSchema] : this.options.schema
      const keySchema = getSchemaElement(schema, key)

      // Get all the raw data possible.
      const rawData = await this.options.provider.getData(
          this.options.address,
          keySchema.key
      )
      // Decode and return the data

      if (keySchema.keyType.toLowerCase() === 'array') {

          const dat = [{ key: keySchema.key, value: rawData }]
          const res = await this._getArrayValues(keySchema, dat)

          // Handle empty arrays
          if (res && res.length > 0) {

              res.push(dat[0]) // add the raw data array length
              return decodeKey(keySchema, res)

          }

          return [] // return empty array if no results

      }

      return decodeKey(keySchema, rawData)

  }

  /**
   * Get all available data from the contract as per the class schema definition.
   * @returns An object with schema element key names as members, with correspoinding associated decoded data as values.
   */
  async getAllData() {

      const results = {}
      let res
      if (!isAddress(this.options.address)) {

          throw new Error('Missing ERC725 contract address.')

      }
      if (!this.options.provider) {

          throw new Error('Missing provider.')

      }

      // Get all the key hashes from the schema
      const keyHashes = this.options.schema.map(e => e.key)
      // Get all the raw data from the provider based on schema key hashes
      let allRawData = await this.options.provider.getAllData(
          this.options.address,
          keyHashes
      )

      // Take out null data values, since data may not fulfill entire schema
      allRawData = await allRawData.filter(e => e.value !== null)

      if (this.options.providerType === ProviderType.GRAPH) {

          // If the provider type is a graphql client, we assume it can get ALL keys (including array keys)
          res = decodeAllData(this.options.schema, allRawData)

      } else {

          // Otherwise we assume the array element keys are not avaiable in raw results, so they must be fetched
          const arraySchemas = this.options.schema.filter(
              e => e.keyType.toLowerCase() === 'array'
          )

          // Get missing 'Array' fields for all arrays, as necessary
          for (let index = 0; index < arraySchemas.length; index++) {

              const schemaElement = arraySchemas[index]
              const arrayValues = await this._getArrayValues(
                  schemaElement,
                  allRawData
              )
              arrayValues.forEach(e => allRawData.push(e))

          }

          this.options.schema.forEach(element => {

              results[element.name] = null

          })
          res = decodeAllData(this.options.schema, allRawData)

      }

      // Now that we can safely assume we have all array values

      // initialize values as null, to all schema name elements on results object
      this.options.schema.forEach(element => {

          results[element.name] = null

      })

      // Put the values in associated elements for return object
      for (let index = 0; index < Object.keys(res).length; index++) {

          const key = Object.keys(res)[index]
          const element = res[key]
          results[key] = element

      }

      return results

  }

  /**
   * Fetch data from IPFS or an HTTP(s) endpoint stored as ‘JSONURL’, or ‘ASSETURL’ valueContent type.
   * @param {string} key The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param {*} [customSchema] An optional custom schema element to use for decoding the returned value.
   *                     Overrides attached schema of instance on this call only.
   * @returns Returns the fetched and decoded value depending ‘valueContent’ for the schema element, otherwise works like getData
   */
  async fetchData(key: string, customSchema?: Erc725Schema) {

      const schema = customSchema ? [customSchema] : this.options.schema
      const keySchema = getSchemaElement(schema, key)

      const result = await this.getData(key, customSchema)

      if (!result) return null

      // change ipfs urls
      if (result && result.url && result.url.indexOf('ipfs://') !== -1) {

          result.url = result.url.replace('ipfs://', this.options.config.ipfsGateway)

      }

      switch (keySchema.valueContent.toLowerCase()) {

      case 'jsonurl':
      case 'asseturl': {

          let responseType
          let dataToHash
          const lowerCaseHashFunction = result.hashFunction.toLowerCase()

          // determine the decoding
          // options: 'arraybuffer', 'document', 'json', 'text', 'stream', Browser: 'blob'
          if (lowerCaseHashFunction === 'keccak256(utf8)') {

              responseType = 'json'

          }
          if (lowerCaseHashFunction === 'keccak256(bytes)') {

              responseType = 'arraybuffer'

          }

          // console.log(result)
          let response
          try {

              response = await axios({
                  method: 'get',
                  url: result.url,
                  responseType
              })

          } catch (error) {

              console.error(error, `GET request to ${result.url} failed`)
              throw (error)

          }


          // console.log(response.data)

          // determine the transformation of the data, before hashing
          if (lowerCaseHashFunction === 'keccak256(utf8)') {

              dataToHash = JSON.stringify(response.data)

          }
          if (lowerCaseHashFunction === 'keccak256(bytes)') {

              dataToHash = response.data

          }

          return response
          && response.data
          && this._hashAndCompare(dataToHash, result.hash)
              ? response.data
              : null

      }
      default:
          return result

      }

  }

  /**
   * @param data An object of keys matching to corresponding schema element names, with associated data.
   * @returns all encoded data as per required by the schema and provided data
   */
  encodeAllData(data) {

      return encodeAllData(this.options.schema, data)

  }

  /**
   * Decode all data available, as per the schema definition, in the contract.
   * @param data An array of encoded key:value pairs.
   * @returns An object with keys matching the erc725 instance schema keys, with attached decoded data as expected by the schema.
   */
  decodeAllData(data: {key: string, value: string}[]) {

      return decodeAllData(this.options.schema, data)

  }

  /**
   * Encode data according to schema.
   * @param key The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param data Data structured according to the corresponding schema defition.
   * @returns Returns decoded data as defined and expected in the schema (single value for keyTypes ‘Singleton’ & ‘Mapping’, or an array of encoded key/value objects for keyType ‘Array).
   */
  encodeData(key: string, data) {

      const schema = getSchemaElement(this.options.schema, key)
      return encodeKey(schema, data)

  }

  /**
   * Decode data from contract store.
   * @param {string} key Either the schema element name or key.
   * @param data Either a single object, or an array of objects of key: value: pairs.
   * @returns Returns decoded data as defined and expected in the schema:
   */
  decodeData(key: string, data) {

      const schema = getSchemaElement(this.options.schema, key)
      return decodeKey(schema, data)

  }

  /**
   * An added utility method which simply returns the owner of the contract. Not directly related to ERC725 specifications.
   * @param {string} [address]
   * @returns The address of the contract owner as stored in the contract.
   */
  getOwner(address?: string): string {

      return this.options.provider.getOwner(address || this.options.address)

  }

  // eslint-disable-next-line class-methods-use-this
  _hashAndCompare(data, hash: string) {

      const jsonHash = keccak256(data)

      // throw error if hash mismatch
      if (jsonHash !== hash) {

          throw new Error(
              'Hash mismatch, returned JSON ("'
          + jsonHash
          + '") is different than the one linked from the ERC725Y Smart contract: "'
          + hash
          + '"'
          )

      }

      return true

  }

  /**
   *
   * @param schema assodiated with the schema with keyType = 'Array'
   *               the data includes the raw (encoded) length key/value pair for the array
   * @param data array of key/value pairs, one of which is the length key for the schema array
   *             Data can hold other field data not relevant here, and will be ignored
   * @return an array of keys/values
   */
  async _getArrayValues(schema: Erc725Schema, data: Record<string, any>) {

      if (schema.keyType !== 'Array') {

          throw new Error(
              `The "_getArrayFields" method requires a schema definition with "keyType: Array",
        ${schema}`
          )

      }
      const results: { key: string; value }[] = []

      // 1. get the array length
      const value = data.find(e => e.key === schema.key) // get the length key/value pair

      if (!value || !value.value) {

          return results

      } // Handle empty/non-existent array
      const arrayLength = await decodeKeyValue(schema, value.value) // get the int array length

      // 2. Get the array values for the length of the array
      for (let index = 0; index < arrayLength; index++) {

          // 2.1 get the new schema key
          const arrayElementKey = encodeArrayKey(schema.key, index)
          let arrayElement

          // 2.2 Check the data first just in case.
          arrayElement = data.find(e => e.key === arrayElementKey)

          if (!arrayElement) {

              // 3. Otherwise we get the array key element value
              arrayElement = await this.options.provider.getData(
                  this.options.address,
                  arrayElementKey
              )

              results.push({
                  key: arrayElementKey,
                  value: arrayElement
              })

          }

      }

      return results

  }

}

export default ERC725
