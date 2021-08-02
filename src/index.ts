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

import GraphSource from './providers/graphSource';
import Web3Source from './providers/web3Source';
import EthereumSource from './providers/ethereumSource';
import {
  encodeArrayKey,
  getSchemaElement,
  encodeKey,
  decodeData,
  decodeKeyValue,
  decodeKey,
  hashAndCompare,
} from './lib/utils';

import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
  GenericSchema,
} from './types/ERC725JSONSchema';

import { ERC725Config } from './types/Config';
import { SUPPORTED_HASH_FUNCTION_STRINGS } from './lib/constants';
import { URLDataWithHash, KeyValuePair } from './types';

enum ProviderType {
  GRAPH = 'graph',
  ETHEREUM = 'ethereum',
  WEB3 = 'web3',
}

export {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
};

/**
 * :::warning
 * This package is currently in early stages of development, <br/>use only for testing or experimentation purposes.<br/>
 * :::
 */
export class ERC725<Schema extends GenericSchema> {
  options: {
    schema: ERC725JSONSchema[];
    address?: string;
    providerType?: ProviderType | null;
    provider?;
    config: ERC725Config;
  };

  /**
   * Creates an instance of ERC725.
   *
   * ```js title="Example"
   * import { ERC725 } from 'erc725.js';
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
   * @param {ERC725JSONSchema[]} schema More information available here: [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
   * @param {string} address Address of the ERC725 contract you want to interact with
   * @param {any} provider
   * @param {ERC725Config} config Configuration object.
   *
   */
  constructor(
    schema: ERC725JSONSchema[],
    address?,
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
   * Gets **decoded data** for one, many or all keys of the specified `ERC725` smart-contract.
   * When omitting the `keyOrKeys` parameter, it will get all the keys (as per {@link ERC725JSONSchema | ERC725JSONSchema} definition).
   *
   * :::caution
   * Data returned by this function does not contain external data of [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl),
   * or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl) schema elements.
   *
   * If you would like to receive everything in one go, you can use {@link ERC725.fetchData | `fetchData`} for that.
   * :::
   *
   * @returns An object with schema element key names as properties, with corresponding **decoded** data as values.
   *
   * ```javascript title="Get decoded data of all keys from schema"
   * await myERC725.getData();
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
   * //     ]
   * // }
   * ```
   *
   * ```javascript title="Get decoded data for one key"
   * await myERC725.getData('SupportedStandards:ERC725Account');
   * // {
   * //     'SupportedStandards:ERC725Account': '0xafdeb5d6',
   * // }
   * ```
   *
   * ```javascript title="Get decoded data for many keys"
   * await myERC725.getData(['SupportedStandards:ERC725Account', 'LSP3Profile']);
   * // {
   * //     'SupportedStandards:ERC725Account': '0xafdeb5d6',
   * //     LSP3Profile: {
   * //       hashFunction: 'keccak256(utf8)',
   * //       hash: '0x8700cccf72722106436cbc5309a8ebb308224d5f601990c070ea751a6bed4fc0',
   * //       url: 'ipfs://QmV8K2ZPZHErvVzjSE7vewgEzvfLnhdea8RLJRqZGNu9Je'
   * //     },
   * // }
   * ```
   */
  async getData(keysOrKeys?: string | string[]);
  async getData(
    keyOrKeys?: string | string[],
  ): Promise<{ [key: string]: any }> {
    if (!isAddress(this.options.address as string)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    if (!keyOrKeys) {
      // eslint-disable-next-line no-param-reassign
      keyOrKeys = this.options.schema.map((element) => element.name);
    }

    if (Array.isArray(keyOrKeys)) {
      return this.getDataMultiple(keyOrKeys);
    }

    return this.getDataSingle(keyOrKeys);
  }

  /**
   * Since {@link ERC725.getData | `getData`} exclusively returns data that is stored on the blockchain, `fetchData` comes in handy.
   * Additionally to the data from the blockchain, `fetchData` also returns data from IPFS or HTTP(s) endpoints
   * stored as [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl), or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl).
   *
   * :::info
   * To guarantee **data authenticity** `fetchData` compares the `hash` of the fetched JSON with the `hash` stored on the blockchain.
   * :::
   *
   * @param {string} keyOrKeys The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param {ERC725JSONSchema} customSchema An optional custom schema element to use for decoding the returned value. Overrides attached schema of the class instance on this call only.
   * @returns Returns the fetched and decoded value depending ‘valueContent’ for the schema element, otherwise works like getData
   *
   * ```javascript title="Example"
   * await myERC725.fetchData('LSP3Profile');
   * // {
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
   * :::info Try it
   * https://stackblitz.com/edit/erc725js-fetch-data?devtoolsheight=66&file=index.js
   * :::
   */
  async fetchData(
    keyOrKeys: string | string[],
  ): Promise<{ [key: string]: KeyValuePair }> {
    const dataFromChain = await this.getData(keyOrKeys);
    const dataFromExternalSources = await this.getDataFromExternalSources(
      dataFromChain,
    );

    return {
      ...dataFromChain,
      ...dataFromExternalSources,
    };
  }

  private getDataFromExternalSources(dataFromChain: { [key: string]: any }): {
    [key: string]: URLDataWithHash;
  } {
    return Object.entries(dataFromChain)
      .filter(([key]) => {
        const keySchema = getSchemaElement(this.options.schema, key);
        return ['jsonurl', 'asseturl'].includes(
          keySchema.valueContent.toLowerCase(),
        );
      })
      .reduce(async (accumulator: any, [key, dataEntry]) => {
        let receivedData;
        try {
          const { url } = this.patchIPFSUrlsIfApplicable(dataEntry);
          receivedData = await fetch(url).then(async (response) => {
            if (
              dataEntry.hashFunction ===
              SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES
            ) {
              return response
                .arrayBuffer()
                .then((buffer) => new Uint8Array(buffer));
            }

            return response.json();
          });
        } catch (error) {
          console.error(error, `GET request to ${dataEntry.url} failed`);
          throw error;
        }

        const isDataAuthentic = hashAndCompare(
          receivedData,
          dataEntry.hash,
          dataEntry.hashFunction,
        );

        if (!isDataAuthentic) {
          accumulator[key] = null;
        }

        accumulator[key] = receivedData;
        return accumulator;
      }, {});
  }

  /**
   * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
   * @returns An object with the same keys as the object that was passed in as a parameter containing the encoded data, ready to be stored on the blockchain.
   *
   * ```javascript title="Encoding object with one key"
   * const json = { LSP3Profile: { name: 'erc725.js', description: 'Javascript Library'} };
   *
   * myERC725.encodeData({
   *   LSP3Profile: {
   *     json,
   *     url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
   *   },
   * });
   * // {
   * //   LSP3Profile: {
   * //     key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
   * //     value:
   * //       "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178",
   * //   },
   * // };
   * ```
   *
   * ```javascript title="Encoding object with many keys"
   * myERC725.encodeData({
   *   'LSP3IssuedAssets[]': [
   *     '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
   *     '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
   *   ],
   *   LSP1UniversalReceiverDelegate: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb'
   * });
   * // {
   * //  "LSP1UniversalReceiverDelegate": {
   * //      "key": "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
   * //      "value": "0x1183790f29be3cdfd0a102862fea1a4a30b3adab"
   * //  },
   * //  "LSP3IssuedAssets[]": [
   * //      {
   * //          "key": "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
   * //          "value": "0x0000000000000000000000000000000000000000000000000000000000000002"
   * //      },
   * //      {
   * //          "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000",
   * //          "value": "0xd94353d9b005b3c0a9da169b768a31c57844e490"
   * //      },
   * //      {
   * //          "key": "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001",
   * //          "value": "0xdaea594e385fc724449e3118b2db7e86dfba1826"
   * //      }
   * //  ]
   * // }
   * ```
   * :::tip
   * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
   * The JSON will be hashed with keccak256.
   * :::
   */
  encodeData(data: { [key: string]: any }): { [key: string]: any };
  encodeData<T extends keyof Schema>(
    data: { [K in T]: Schema[T]['encodeData']['inputTypes'] },
  ) {
    return Object.entries(data).reduce(
      (accumulator, [key, value]) => {
        const schemaElement = getSchemaElement(this.options.schema, key);

        accumulator[key] = {
          value: encodeKey(schemaElement, value),
          key: schemaElement.key,
        };

        return accumulator;
      },
      {} as {
        [K in T]: {
          key: string;
          value: Schema[T]['encodeData']['returnValues'];
        };
      },
    );
  }

  /**
   * In case you are reading the key-value store from an ERC725 smart-contract key-value store
   * without `erc725.js` you can use `decodeData` to do the decoding for you.
   *
   * :::tip
   * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
   * It does the `decoding` and `fetching` of external references for you automatically.
   * :::
   *
   * @param {{ [key: string]: any }} data An object with one or many properties.
   * @returns Returns decoded data as defined and expected in the schema:
   *
   * ```javascript title="Decode one key"
   * myERC725.decodeData({
   *   "LSP3IssuedAssets[]": [
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
   *       value:
   *         "0x0000000000000000000000000000000000000000000000000000000000000002",
   *     },
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000",
   *       value: "0xd94353d9b005b3c0a9da169b768a31c57844e490",
   *     },
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001",
   *       value: "0xdaea594e385fc724449e3118b2db7e86dfba1826",
   *     },
   *   ],
   * });
   * // {
   * //   "LSP3IssuedAssets[]": [
   * //     "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
   * //     "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
   * //   ],
   * // }
   * ```
   *
   * ```javascript title="Decode multiple keys"
   * myERC725.decodeData({
   *   "LSP3IssuedAssets[]": [
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
   *       value:
   *         "0x0000000000000000000000000000000000000000000000000000000000000002",
   *     },
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000",
   *       value: "0xd94353d9b005b3c0a9da169b768a31c57844e490",
   *     },
   *     {
   *       key: "0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001",
   *       value: "0xdaea594e385fc724449e3118b2db7e86dfba1826",
   *     },
   *   ],
   *   LSP3Profile:
   *    '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
   * });
   * // {
   * //   "LSP3IssuedAssets[]": [
   * //     "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
   * //     "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
   * //   ],
   * //   LSP3Profile: {
   * //     hashFunction: 'keccak256(utf8)',
   * //     hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
   * //     url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
   * //   },
   * // }
   * ```
   */
  decodeData(data: { [key: string]: any }): { [key: string]: any };
  decodeData<T extends keyof Schema>(
    data: { [K in T]: Schema[T]['decodeData']['inputTypes'] },
  ): {
    [K in T]: Schema[T]['decodeData']['returnValues'];
  } {
    return decodeData<Schema, T>(data, this.options.schema);
  }

  /**
   * An added utility method which simply returns the owner of the contract.
   * Not directly related to ERC725 specifications.
   *
   * @param {string} [address]
   * @returns The address of the contract owner as stored in the contract.
   *
   * :::warning
   *    This method is not yet supported when using the `graph` provider type.
   * :::
   *
   * ```javascript title="Example"
   * await myERC725.getOwner();
   * // '0x94933413384997F9402cc07a650e8A34d60F437A'
   *
   * await myERC725.getOwner("0x3000783905Cc7170cCCe49a4112Deda952DDBe24");
   * // '0x7f1b797b2Ba023Da2482654b50724e92EB5a7091'
   * ```
   */
  getOwner(address?: string): string {
    return this.options.provider.getOwner(address || this.options.address);
  }

  /**
   * @internal
   * @param schema associated with the schema with keyType = 'Array'
   *               the data includes the raw (encoded) length key-value pair for the array
   * @param data array of key-value pairs, one of which is the length key for the schema array
   *             Data can hold other field data not relevant here, and will be ignored
   * @return an array of keys/values
   */
  private async getArrayValues(
    schema: ERC725JSONSchema,
    data: Record<string, any>,
  ) {
    if (schema.keyType !== 'Array') {
      throw new Error(
        `The "_getArrayFields" method requires a schema definition with "keyType: Array",
        ${schema}`,
      );
    }
    const results: { key: string; value }[] = [];

    // 1. get the array length
    const value = data[schema.key]; // get the length key/value pair

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
      arrayElement = data[arrayElementKey];

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

  private async getDataSingle(data: string) {
    const keySchema = getSchemaElement(this.options.schema, data);
    const rawData = await this.options.provider.getData(
      this.options.address,
      keySchema.key,
    );

    // Decode and return the data
    if (keySchema.keyType.toLowerCase() === 'array') {
      const dat = { [keySchema.key]: { key: keySchema.key, value: rawData } };
      const arrayValues = await this.getArrayValues(keySchema, dat);

      if (arrayValues && arrayValues.length > 0) {
        arrayValues.push(dat[keySchema.key]); // add the raw data array length
        return {
          [keySchema.name]: decodeKey(keySchema, arrayValues),
        };
      }

      return {}; // return empty object if there are no arrayValues
    }

    return {
      [keySchema.name]: decodeKey(keySchema, rawData),
    };
  }

  private async getDataMultiple(keyNames: string[]) {
    const keyHashes = keyNames.map((keyName) => {
      const schemaElement = getSchemaElement(this.options.schema, keyName);
      return schemaElement.key;
    });

    // Get all the raw data from the provider based on schema key hashes
    const allRawData = await this.options.provider.getAllData(
      this.options.address,
      keyHashes,
    );

    if (this.options.providerType === ProviderType.GRAPH) {
      // If the provider type is a graphql client, we assume it can get ALL keys (including array keys)
      return allRawData.reduce((accumulator, current) => {
        accumulator[current.key] = current.value;
        return accumulator;
      }, {});
    }

    const tmpData = allRawData.reduce((accumulator, current) => {
      accumulator[current.key] = current.value;
      return accumulator;
    }, {});

    // Get missing 'Array' fields for all arrays, as necessary
    const arraySchemas = this.options.schema.filter(
      (e) => e.keyType.toLowerCase() === 'array',
    );
    for (let index = 0; index < arraySchemas.length; index++) {
      const keySchema = arraySchemas[index];
      const dat = {
        [keySchema.key]: { key: keySchema.key, value: tmpData[keySchema.key] },
      };
      const arrayValues = await this.getArrayValues(keySchema, dat);

      if (arrayValues && arrayValues.length > 0) {
        arrayValues.push(dat[keySchema.key]); // add the raw data array length
        tmpData[keySchema.key] = arrayValues;
      } else {
        tmpData[keySchema.key] = {}; // return empty object if there are no arrayValues
      }
    }

    return decodeData(tmpData, this.options.schema);
  }

  private patchIPFSUrlsIfApplicable(receivedData: URLDataWithHash) {
    if (
      receivedData &&
      receivedData.url &&
      receivedData.url.indexOf('ipfs://') !== -1
    ) {
      return {
        ...receivedData,
        url: receivedData.url.replace(
          'ipfs://',
          this.options.config.ipfsGateway,
        ),
      };
    }

    return receivedData;
  }
}

export default ERC725;
export { ERC725Config, KeyValuePair } from './types';
