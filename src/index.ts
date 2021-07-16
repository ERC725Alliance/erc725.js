/* eslint-disable lines-between-class-members */
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

import { isAddress, toChecksumAddress } from 'web3-utils';

import GraphSource from './providers/subgraphProviderWrapper';
import Web3Source from './providers/web3ProviderWrapper';
import EthereumSource from './providers/ethereumProviderWrapper';
import {
  decodeAllData,
  decodeKey,
  decodeKeyValue,
  encodeAllData,
  encodeArrayKey,
  encodeKey,
  getSchemaElement,
  hashData,
} from './lib/utils';

import {
  Erc725Schema,
  Erc725SchemaKeyType,
  Erc725SchemaValueContent,
  Erc725SchemaValueType,
} from './types/Erc725Schema';

import { ERC725Config } from './types/Config';
import { SUPPORTED_HASH_FUNCTIONS } from './lib/constants';

enum ProviderType {
  GRAPH = 'graph',
  ETHEREUM = 'ethereum',
  WEB3 = 'web3',
}

export {
  Erc725Schema,
  Erc725SchemaKeyType,
  Erc725SchemaValueContent,
  Erc725SchemaValueType,
};

/**
 * :::caution
 * This package is currently in early stages of development, use only for testing or experimentation purposes.
 * :::
 *
 */
export class ERC725 {
  options: {
    schema;
    address?;
    providerType?: ProviderType | null;
    provider?;
    config: ERC725Config;
  };

  /**
   * Creates an instance of ERC725.
   *
   * **Example**
   *
   * ```js
   * import ERC725 from 'erc725.js';
   * import Web3 from 'web3';
   *
   * const schema = [
   *     {
   *         name: "LSP3Profile",
   *         key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
   *         keyType: "Singleton",
   *         valueContent: "JSONURL",
   *         valueType: "bytes",
   *     },
   * ];
   *
   * const address = "0x0c03fba782b07bcf810deb3b7f0595024a444f4e";
   * const provider = new Web3.providers.HttpProvider("https://rpc.l14.lukso.network");
   * const config = {
   *    ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
   * }
   *
   * const myERC725 = new ERC725(schema, address, provider, config);
   * ```
   *
   * @param {Erc725Schema[]} schema More information available here: [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
   * @param {string} address Address of the ERC725 contract you want to interact with
   * @param {any} provider
   * @param {ERC725Config} config Configuration object.
   *
   */
  constructor(
    schema: Erc725Schema[],
    address?: string,
    provider?: any,
    config?: ERC725Config,
  ) {
    // NOTE: provider param can be either the provider, or and object with {provider:xxx ,type:xxx}

    // TODO: Add check for schema format?
    if (!schema) {
      throw new Error('Missing schema.');
    }

    const defaultConfig = {
      ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
    };

    // Init options member
    this.options = {
      schema,
      address,
      providerType: null,
      config: {
        ...defaultConfig,
        ...config,
      },
    };

    // do not fail on no-provider
    if (!provider) return;

    const givenProvider = provider.provider || provider;

    // CASE: GraphQL provider

    if (provider.type === 'ApolloClient') {
      this.options.providerType = ProviderType.GRAPH;
      this.options.provider = new GraphSource(givenProvider);

      // This checks to see if its a subgraph, since TheGraph subgraphs cannot checksum addresses to store
      const isSubgraph = givenProvider.link?.options?.uri.includes('/subgraph');
      if (!isSubgraph && address) {
        this.options.address = toChecksumAddress(address);
      }

      // CASE: Ethereum provider
    } else if (provider.request || provider.type === 'EthereumProvider') {
      this.options.providerType = ProviderType.ETHEREUM;
      this.options.provider = new EthereumSource(givenProvider);

      // CASE: Web3 or deprecated ethereum provider
    } else if (
      (!provider.request && provider.send) ||
      provider.type === 'Web3Provider'
    ) {
      this.options.providerType = ProviderType.WEB3;
      this.options.provider = new Web3Source(givenProvider);

      // CASE: Unknown provider
    } else {
      throw new Error(`Incorrect or unsupported provider ${givenProvider}`);
    }
  }

  /**
   * Get decoded data from the contract key value store.
   * @param {string} key Either the schema name or key of a schema element on the class instance.
   * @param {Erc725Schema} customSchema An optional schema to override attached schema of ERC725 class instance.
   * @returns Returns decoded data as defined and expected in the schema.
   *
   * **Example**
   *
   * ```javascript
   * await myERC725.getData("SupportedStandards:ERC725Account");
   * // > '0xafdeb5d6'
   *
   * await myERC725.getData('LSP3Profile');
   * // > {
   * //   hashFunction: 'keccak256(utf8)',
   * //   hash: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
   * //   url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
   * // }
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-get-data?devtoolsheight=66&file=index.js
   * :::
   */
  async getData(key: string, customSchema?: Erc725Schema) {
    if (!isAddress(this.options.address)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    const schema = customSchema ? [customSchema] : this.options.schema;
    const keySchema = getSchemaElement(schema, key);

    // Get all the raw data possible.
    const rawData = await this.options.provider.getData(
      this.options.address,
      keySchema.key,
    );
    // Decode and return the data

    if (keySchema.keyType.toLowerCase() === 'array') {
      const dat = [{ key: keySchema.key, value: rawData }];
      const res = await this._getArrayValues(keySchema, dat);

      // Handle empty arrays
      if (res && res.length > 0) {
        res.push(dat[0]); // add the raw data array length
        return decodeKey(keySchema, res);
      }

      return []; // return empty array if no results
    }

    return decodeKey(keySchema, rawData);
  }

  /**
   * Get all available data from the contract as per the class schema definition.
   * @returns An object with schema element key names as properties, with corresponding associated decoded data as values.
   *
   * **Example**
   *
   * ```javascript
   * await myERC725.getAllData();
   * // >
   * // {
   * //     'SupportedStandards:ERC725Account': '0xafdeb5d6',
   * //     LSP3Profile: {
   * //       hashFunction: 'keccak256(utf8)',
   * //       hash: '0x8700cccf72722106436cbc5309a8ebb308224d5f601990c070ea751a6bed4fc0',
   * //       url: 'ipfs://QmV8K2ZPZHErvVzjSE7vewgEzvfLnhdea8RLJRqZGNu9Je'
   * //     },
   * //     LSP1UniversalReceiverDelegate: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
   * //     'LSP3IssuedAssets[]': [
   * //       '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   * //       '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
   * //       ...
   * //     ]
   * // }
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-get-all-data?devtoolsheight=33&file=index.js
   * :::
   */
  async getAllData() {
    const results = {};
    let res;
    if (!isAddress(this.options.address)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    // Get all the key hashes from the schema
    const keyHashes = this.options.schema.map((e) => e.key);
    // Get all the raw data from the provider based on schema key hashes
    let allRawData = await this.options.provider.getAllData(
      this.options.address,
      keyHashes,
    );

    // Take out null data values, since data may not fulfill entire schema
    allRawData = await allRawData.filter((e) => e.value !== null);

    if (this.options.providerType === ProviderType.GRAPH) {
      // If the provider type is a graphql client, we assume it can get ALL keys (including array keys)
      res = decodeAllData(this.options.schema, allRawData);
    } else {
      // Otherwise we assume the array element keys are not available in raw results, so they must be fetched
      const arraySchemas = this.options.schema.filter(
        (e) => e.keyType.toLowerCase() === 'array',
      );

      // Get missing 'Array' fields for all arrays, as necessary
      for (let index = 0; index < arraySchemas.length; index++) {
        const schemaElement = arraySchemas[index];
        const arrayValues = await this._getArrayValues(
          schemaElement,
          allRawData,
        );
        arrayValues.forEach((e) => allRawData.push(e));
      }

      this.options.schema.forEach((element) => {
        results[element.name] = null;
      });
      res = decodeAllData(this.options.schema, allRawData);
    }

    // Now that we can safely assume we have all array values

    // initialize values as null, to all schema name elements on results object
    this.options.schema.forEach((element) => {
      results[element.name] = null;
    });

    // Put the values in associated elements for return object
    for (let index = 0; index < Object.keys(res).length; index++) {
      const key = Object.keys(res)[index];
      const element = res[key];
      results[key] = element;
    }

    return results;
  }

  /**
   * Fetches data from IPFS or an HTTP(s) endpoint stored as `JSONURL`, or `ASSETURL` valueContent type and
   * compares the hash of the downloaded JSON with the hash stored on the blockchain. More details available here:
   * https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl
   *
   * @param {string} key The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param {Erc725Schema} customSchema An optional custom schema element to use for decoding the returned value. Overrides attached schema of the class instance on this call only.
   * @returns Returns the fetched and decoded value depending ‘valueContent’ for the schema element, otherwise works like getData
   *
   * **Example**
   *
   * ```javascript
   * await myERC725.fetchData('LSP3Profile');
   * // > {
   * //   LSP3Profile: {
   * //     name: 'the-dematerialised',
   * //     description: 'The Destination for Digital Fashion. We are a Web 3.0 Marketplace, Authenticated on the LUKSO Blockchain. The Future is Dematerialised.',
   * //     profileImage: [ [Object], [Object], [Object], [Object], [Object] ],
   * //     backgroundImage: [ [Object], [Object], [Object], [Object], [Object] ],
   * //     tags: [ 'marketplace' ],
   * //     links: [ [Object], [Object], [Object], [Object] ]
   * //   }
   * // }
   * ```
   *
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-fetch-data?devtoolsheight=66&file=index.js
   * :::
   *
   */
  async fetchData(key: string, customSchema?: Erc725Schema) {
    const schema = customSchema ? [customSchema] : this.options.schema;
    const keySchema = getSchemaElement(schema, key);

    const result = await this.getData(key, customSchema);

    if (!result) return null;

    // change ipfs urls
    if (result && result.url && result.url.indexOf('ipfs://') !== -1) {
      result.url = result.url.replace(
        'ipfs://',
        this.options.config.ipfsGateway,
      );
    }

    switch (keySchema.valueContent.toLowerCase()) {
      case 'jsonurl':
      case 'asseturl': {
        const lowerCaseHashFunction = result.hashFunction.toLowerCase();

        let response;
        try {
          response = await fetch(result.url).then((a) => {
            if (lowerCaseHashFunction === 'keccak256(bytes)') {
              return a.arrayBuffer().then((buffer) => new Uint8Array(buffer));
            }

            return a.json();
          });
        } catch (error) {
          console.error(error, `GET request to ${result.url} failed`);
          throw error;
        }

        return response &&
          this._hashAndCompare(response, result.hash, lowerCaseHashFunction)
          ? response
          : null;
      }
      default:
        return result;
    }
  }

  /**
   * @param data An object of keys matching to corresponding schema element names, with associated data.
   * @returns all encoded data as per required by the schema and provided data
   *
   * **Example**
   *
   * ```javascript
   * myERC725.encodeAllData({
   *   LSP3Profile: {
   *     hashFunction: 'keccak256(utf8)',
   *     hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
   *     url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
   *   },
   *   'LSP3IssuedAssets[]': [
   *     '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   *     '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
   *   ],
   *   LSP1UniversalReceiverDelegate: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb'
   * });
   *
   * // > [
   * //  {
   * //      "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
   * //      "value": "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178"
   * //  },
   * //  {
   * //      "key": "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
   * //      "value": "0x1183790f29be3cdfd0a102862fea1a4a30b3adab"
   * //  },
   * //  {
   * //      "key": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
   * //      "value": "0x0000000000000000000000000000000000000000000000000000000000000002"
   * //  },
   * //  {
   * //      "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000",
   * //      "value": "0xd94353d9b005b3c0a9da169b768a31c57844e490"
   * //  },
   * //  {
   * //      "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001",
   * //      "value": "0xdaea594e385fc724449e3118b2db7e86dfba1826"
   * //  }
   * // ]
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-encode-all-data?devtoolsheight=66&file=index.js
   * :::
   */
  encodeAllData(data) {
    return encodeAllData(this.options.schema, data);
  }

  /**
   * Encode data according to schema.
   * @param key The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param data Data structured according to the corresponding schema definition.
   * @returns Returns encoded data as defined and expected in the schema (single value for keyTypes ‘Singleton’ & ‘Mapping’, or an array of encoded key-value objects for keyType ‘Array).
   *
   * **Example**
   *
   * ```javascript
   * myERC725.encodeData('LSP3IssuedAssets[]', [
   *     '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   *     '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
   * ]);
   * // > [
   * //     {
   * //         key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
   * //         value: '0x0000000000000000000000000000000000000000000000000000000000000002'
   * //     },
   * //     {
   * //         key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
   * //         value: '0xd94353d9b005b3c0a9da169b768a31c57844e490'
   * //     },
   * //     {
   * //         key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
   * //         value: '0xdaea594e385fc724449e3118b2db7e86dfba1826'
   * //     }
   * // ]
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-encode-data?devtoolsheight=66&file=index.js
   * :::
   */
  encodeData(
    key: string,
    data: { json: unknown; url: string; hashFunction: string },
  ): string;
  encodeData(key: string, data) {
    const schema = getSchemaElement(this.options.schema, key);
    return encodeKey(schema, data);
  }

  /**
   * Decode all data available, as per the schema definition, in the contract.
   * @param data An array of encoded key:value pairs.
   * @returns An object with keys matching the ERC725 instance schema keys, with attached decoded data as expected by the schema.
   *
   * **Example**
   *
   * ```javascript
   * myERC725.decodeAllData([
   *    {
   *        // Array length of LSP3IssuedAssets[]
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
   *        value: '0x0000000000000000000000000000000000000000000000000000000000000002'
   *    },
   *    {
   *        // First LSP3IssuedAssets[] array element
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
   *        value: '0xd94353d9b005b3c0a9da169b768a31c57844e490'
   *    },
   *    {
   *        // Second LSP3IssuedAssets[] array element
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
   *        value: '0xdaea594e385fc724449e3118b2db7e86dfba1826'
   *    },
   *    {
   *        // LSP3Profile
   *        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
   *        value: '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178'
   *    }
   * ]);
   * // > {
   * //   LSP3Profile: {
   * //     hashFunction: 'keccak256(utf8)',
   * //     hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
   * //     url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
   * //   },
   * //   'LSP3IssuedAssets[]': [
   * //     '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   * //     '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
   * //   ]
   * // }
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-decode-all-data?devtoolsheight=33&file=index.js
   * :::
   */
  decodeAllData(data: { key: string; value: string }[]) {
    return decodeAllData(this.options.schema, data);
  }

  /**
   * Decode data from contract store.
   * @param {string} key Either the schema element name or key.
   * @param data Either a single object, or an array of objects of key: value: pairs.
   * @returns Returns decoded data as defined and expected in the schema:
   *
   * **Example**
   *
   * ```javascript
   * myERC725.decodeData('LSP3IssuedAssets[]', [
   *    {
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
   *        value: '0x0000000000000000000000000000000000000000000000000000000000000002'
   *    },
   *    {
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
   *        value: '0xd94353d9b005b3c0a9da169b768a31c57844e490'
   *    },
   *    {
   *        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
   *        value: '0xdaea594e385fc724449e3118b2db7e86dfba1826'
   *    }
   * ]);
   * // > [
   * //   '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   * //   '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
   * // ]
   * ```
   * :::note Try it
   * https://stackblitz.com/edit/erc725js-decode-data?devtoolsheight=33&file=index.js
   * :::
   */
  decodeData(key: string, data) {
    const schema = getSchemaElement(this.options.schema, key);
    return decodeKey(schema, data);
  }

  /**
   * An added utility method which simply returns the owner of the contract.
   * Not directly related to ERC725 specifications.
   *
   * @param {string} [address]
   * @returns The address of the contract owner as stored in the contract.
   *
   * :::caution
   *
   *    This method is not yet supported when using the `graph` provider type.
   *
   * :::
   *
   * **Example**
   *
   * ```javascript
   * await myERC725.getOwner();
   * // > '0x94933413384997F9402cc07a650e8A34d60F437A'
   *
   * await myERC725.getOwner("0x3000783905Cc7170cCCe49a4112Deda952DDBe24");
   * // > '0x7f1b797b2Ba023Da2482654b50724e92EB5a7091'
   * ```
   */
  getOwner(address?: string): string {
    return this.options.provider.getOwner(address || this.options.address);
  }

  /**
   * Hashes the data received with the specified hashing function,
   * and compares the result with the provided hash.
   *
   * @throws *Error* in case of a mismatch of the hashes.
   * @internal
   */
  // eslint-disable-next-line class-methods-use-this
  _hashAndCompare(
    data,
    hash: string,
    lowerCaseHashFunction: SUPPORTED_HASH_FUNCTIONS,
  ) {
    const jsonHash = hashData(data, lowerCaseHashFunction);

    // throw error if hash mismatch
    if (jsonHash !== hash) {
      throw new Error(`
              Hash mismatch, returned JSON ("${jsonHash}") is different than the one 
              linked from the ERC725Y Smart contract: "${hash}"
          `);
    }

    return true;
  }

  /**
   * @internal
   * @param schema associated with the schema with keyType = 'Array'
   *               the data includes the raw (encoded) length key-value pair for the array
   * @param data array of key-value pairs, one of which is the length key for the schema array
   *             Data can hold other field data not relevant here, and will be ignored
   * @return an array of keys/values
   */
  async _getArrayValues(schema: Erc725Schema, data: Record<string, any>) {
    if (schema.keyType !== 'Array') {
      throw new Error(
        `The "_getArrayFields" method requires a schema definition with "keyType: Array",
        ${schema}`,
      );
    }
    const results: { key: string; value }[] = [];

    // 1. get the array length
    const value = data.find((e) => e.key === schema.key); // get the length key/value pair

    if (!value || !value.value) {
      return results;
    } // Handle empty/non-existent array
    const arrayLength = await decodeKeyValue(schema, value.value); // get the int array length

    // 2. Get the array values for the length of the array
    for (let index = 0; index < arrayLength; index++) {
      // 2.1 get the new schema key
      const arrayElementKey = encodeArrayKey(schema.key, index);
      let arrayElement;

      // 2.2 Check the data first just in case.
      arrayElement = data.find((e) => e.key === arrayElementKey);

      if (!arrayElement) {
        // 3. Otherwise we get the array key element value
        arrayElement = await this.options.provider.getData(
          this.options.address,
          arrayElementKey,
        );

        results.push({
          key: arrayElementKey,
          value: arrayElement,
        });
      }
    }

    return results;
  }
}

export default ERC725;
