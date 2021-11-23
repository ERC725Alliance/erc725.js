/*
    This file is part of @erc725/erc725.js.
    @erc725/erc725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    @erc725/erc725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with @erc725/erc725.js.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @file index.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import { isAddress } from 'web3-utils';

import { Web3ProviderWrapper } from './providers/web3ProviderWrapper';
import { EthereumProviderWrapper } from './providers/ethereumProviderWrapper';

import {
  encodeArrayKey,
  getSchemaElement,
  decodeData,
  decodeKeyValue,
  decodeKey,
  isDataAuthentic,
  encodeData,
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
import { URLDataWithHash, KeyValuePair, ProviderTypes } from './types';

export {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
};

export { ERC725Config, KeyValuePair, ProviderTypes } from './types';
export { flattenEncodedData, encodeData } from './lib/utils';
/**
 * :::warning
 * This package is currently in early stages of development, <br/>use only for testing or experimentation purposes.<br/>
 * :::
 *
 * @typeParam Schema **Work in progress, nothing to see here**.
 *
 */
export class ERC725<Schema extends GenericSchema> {
  options: {
    schema: ERC725JSONSchema[];
    address?: string;
    provider?;
    config: ERC725Config;
  };

  /**
   * Creates an instance of ERC725.
   *
   * ```js reference title="Instantiation"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/instantiation.js#L1-L50
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

    this.options = {
      schema,
      address,
      provider: this.initializeProvider(provider),
      config: {
        ...defaultConfig,
        ...config,
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private initializeProvider(providerOrProviderWrapper) {
    // do not fail on no-provider
    if (!providerOrProviderWrapper) return undefined;

    if (typeof providerOrProviderWrapper.request === 'function')
      return new EthereumProviderWrapper(providerOrProviderWrapper);

    if (
      !providerOrProviderWrapper.request &&
      typeof providerOrProviderWrapper.send === 'function'
    )
      return new Web3ProviderWrapper(providerOrProviderWrapper);

    if (providerOrProviderWrapper.type === ProviderTypes.GRAPH_QL)
      return providerOrProviderWrapper;

    throw new Error(
      `Incorrect or unsupported provider ${providerOrProviderWrapper}`,
    );
  }

  /**
   * Gets **decoded data** for one, many or all keys of the specified `ERC725` smart-contract.
   * When omitting the `keyOrKeys` parameter, it will get all the keys (as per {@link ERC725JSONSchema | ERC725JSONSchema} definition).
   *
   * :::caution
   * Data returned by this function does not contain external data of [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl)
   * or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl) schema elements.
   *
   * If you would like to receive everything in one go, you can use {@link ERC725.fetchData | `fetchData`} for that.
   * :::
   *
   * @returns An object with schema element key names as properties, with corresponding **decoded** data as values.
   *
   * ```javascript reference title="getData - all keys from schema"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/getData.js#L7-L30
   * ```
   *
   * ```javascript reference title="getData - one key  "
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/getData.js#L32-L41
   * ```
   *
   * ```javascript reference title="getData - many keys"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/getData.js#L43-L56
   * ```
   */
  async getData(
    keyOrKeys?: string | string[],
  ): Promise<{ [key: string]: any }> {
    this.getAddressAndProvider();

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
   * stored as [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl) or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl).
   *
   * :::info
   * To ensure **data authenticity** `fetchData` compares the `hash` of the fetched JSON with the `hash` stored on the blockchain.
   * :::
   *
   * @param {string} keyOrKeys The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   * @param {ERC725JSONSchema} customSchema An optional custom schema element to use for decoding the returned value. Overrides attached schema of the class instance on this call only.
   * @returns Returns the fetched and decoded value depending ‘valueContent’ for the schema element, otherwise works like getData
   *
   * ```javascript title="getData - all keys from schema"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/fetchData.js#L7-L35
   * ```
   *
   * ```javascript reference title="getData - one key  "
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/fetchData.js#L37-L51
   * ```
   *
   * ```javascript reference title="getData - many keys"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/fetchData.js#L53-L71
   * ```
   */
  async fetchData(
    keyOrKeys?: string | string[],
  ): Promise<{ [key: string]: any }> {
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
    [key: string]: any;
  } {
    return Object.entries(dataFromChain)
      .filter(([key]) => {
        const keySchema = getSchemaElement(this.options.schema, key);
        return ['jsonurl', 'asseturl'].includes(
          keySchema.valueContent.toLowerCase(),
        );
      })
      .reduce(async (accumulator, [key, dataEntry]) => {
        if (!dataEntry) {
          accumulator[key] = null;
          return accumulator;
        }

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

        accumulator[key] = isDataAuthentic(
          receivedData,
          dataEntry.hash,
          dataEntry.hashFunction,
        )
          ? receivedData
          : null;

        return accumulator;
      }, {});
  }

  /**
   * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
   * @returns An object with the same keys as the object that was passed in as a parameter containing the encoded data, ready to be stored on the blockchain.
   *
   * ```javascript reference title="Encoding object with one key"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/encodeData.js#L7-L19
   * ```
   *
   * ```javascript reference title="Encoding object with one key"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/encodeData.js#L22-L37
   * ```
   *
   * ```javascript reference title="Encoding object with one key"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/encodeData.js#L39-L67
   * ```
   *
   * :::tip
   * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
   * The JSON will be hashed with `keccak256`.
   * :::
   */
  encodeData(data: { [key: string]: any }): { [key: string]: any };
  encodeData<T extends keyof Schema>(data: {
    [K in T]: Schema[T]['encodeData']['inputTypes'];
  }) {
    return encodeData<Schema, T>(data, this.options.schema);
  }

  /**
   * In case you are reading the key-value store from an ERC725 smart-contract key-value store
   * without `@erc725/erc725.js` you can use `decodeData` to do the decoding for you.
   *
   * :::tip
   * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
   * It does the `decoding` and `fetching` of external references for you automatically.
   * :::
   *
   * @param {{ [key: string]: any }} data An object with one or many properties.
   * @returns Returns decoded data as defined and expected in the schema:
   *
   * ```javascript reference title="Decode one key"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/decodeData.js#L7-L19
   * ```
   *
   * ```javascript reference title="Decode multiple keys"
   * https://github.com/ERC725Alliance/erc725.js/tree/main/examples/src/decodeData.js#L21-L49
   * ```
   */
  decodeData(data: { [key: string]: any }): { [key: string]: any };
  decodeData<T extends keyof Schema>(data: {
    [K in T]: Schema[T]['decodeData']['inputTypes'];
  }): {
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
  async getOwner(_address?: string) {
    const { address, provider } = this.getAddressAndProvider();

    return provider.getOwner(_address || address);
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
        `The "getArrayValues" method requires a schema definition with "keyType: Array",
         ${schema}`,
      );
    }
    const results: { key: string; value }[] = [];

    // 1. get the array length
    const value = data[schema.key]; // get the length key/value pair

    if (!value || !value.value) {
      return results;
    } // Handle empty/non-existent array

    const arrayLength = await decodeKeyValue(
      'Number',
      'uint256',
      value.value,
      schema.name,
    ); // get the int array length

    const arrayElementKeys: string[] = [];
    for (let index = 0; index < arrayLength; index++) {
      const arrayElementKey = encodeArrayKey(schema.key, index);
      if (!data[arrayElementKey]) {
        arrayElementKeys.push(arrayElementKey);
      }
    }

    if (this.options.provider.type !== ProviderTypes.GRAPH_QL) {
      try {
        const arrayElements = await this.options.provider?.getAllData(
          this.options.address as string,
          arrayElementKeys,
        );

        results.push(...arrayElements);
      } catch (err) {
        // This case may happen if user requests an array key which does not exist in the contract.
        // In this case, we simply skip
      }

      return results;
    }

    for (let index = 0; index < arrayElementKeys.length; index++) {
      // GraphQL provider has a different signature for getAllData(), it doesn't support `keys[]` parameter

      const arrayElement = await this.options.provider?.getData(
        this.options.address as string,
        arrayElementKeys[index],
      );

      results.push({
        key: arrayElementKeys[index],
        value: arrayElement,
      });
    }

    return results;
  }

  private async getDataSingle(data: string) {
    const keySchema = getSchemaElement(this.options.schema, data);
    const rawData = await this.options.provider?.getData(
      this.options.address as string,
      keySchema.key,
    );

    // Decode and return the data
    if (keySchema.keyType.toLowerCase() === 'array') {
      const dataKeyValue = {
        [keySchema.key]: { key: keySchema.key, value: rawData },
      };

      const arrayValues = await this.getArrayValues(keySchema, dataKeyValue);

      if (arrayValues && arrayValues.length > 0) {
        arrayValues.push(dataKeyValue[keySchema.key]); // add the raw data array length
        return {
          [keySchema.name]: decodeKey(keySchema, arrayValues),
        };
      }

      return { [keySchema.name]: [] }; // return empty object if there are no arrayValues
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
    const allRawData: KeyValuePair[] = await this.options.provider?.getAllData(
      this.options.address as string,
      keyHashes,
    );

    if (this.options.provider?.type === ProviderTypes.GRAPH_QL) {
      // If the provider type is a graphql client, we assume it can get ALL keys (including array keys)
      return allRawData.reduce<{ [key: string]: any }>(
        (accumulator, current) => {
          accumulator[current.key] = current.value;
          return accumulator;
        },
        {},
      );
    }

    const tmpData = allRawData.reduce<{ [key: string]: any }>(
      (accumulator, current) => {
        accumulator[current.key] = current.value;
        return accumulator;
      },
      {},
    );

    // Get missing 'Array' fields for all arrays, as necessary
    const arraySchemas = this.options.schema.filter(
      (e) => e.keyType.toLowerCase() === 'array',
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const keySchema of arraySchemas) {
      const dataKeyValue = {
        [keySchema.key]: { key: keySchema.key, value: tmpData[keySchema.key] },
      };
      const arrayValues = await this.getArrayValues(keySchema, dataKeyValue);

      if (arrayValues && arrayValues.length > 0) {
        arrayValues.push(dataKeyValue[keySchema.key]); // add the raw data array length
        tmpData[keySchema.key] = arrayValues;
      }
    }

    return decodeData(tmpData, this.options.schema);
  }

  /**
   * Changes the protocol from `ipfs://` to `http(s)://` and adds the selected IPFS gateway.
   * `ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D => https://ipfs.lukso.network/ipfs/QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D`
   */
  private patchIPFSUrlsIfApplicable(
    receivedData: URLDataWithHash,
  ): URLDataWithHash {
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

  private getAddressAndProvider() {
    if (!isAddress(this.options.address as string)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    return {
      address: this.options.address as string,
      provider: this.options.provider,
    };
  }
}

export default ERC725;
