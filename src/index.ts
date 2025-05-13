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
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @author Jean Cavallera <@CJ42>
 * @date 2020
 */

import { ProviderWrapper } from './provider/providerWrapper';

import {
  encodeData,
  convertIPFSGatewayUrl,
  generateSchemasFromDynamicKeys,
  duplicateMultiTypeERC725SchemaEntry,
  getVerificationMethod,
  isDataAuthentic,
} from './lib/utils';

import { getSchema } from './lib/schemaParser';
import { isValidSignature } from './lib/isValidSignature';

import {
  DEFAULT_GAS_VALUE,
  type SUPPORTED_VERIFICATION_METHODS,
  type SUPPORTED_VERIFICATION_METHOD_STRINGS,
} from './constants/constants';
import { encodeKeyName, isDynamicKeyName } from './lib/encodeKeyName';

// Types
import type { ERC725Config, ERC725Options } from './types/Config';
import type { Permissions } from './types/Method';
import type {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
} from './types/ERC725JSONSchema';
import type {
  DecodeDataInput,
  DecodeDataOutput,
  EncodeDataInput,
  FetchDataOutput,
} from './types/decodeData';
import type { GetDataDynamicKey, GetDataInput } from './types/GetData';
import { decodeData } from './lib/decodeData';
import { getDataFromExternalSources } from './lib/getDataFromExternalSources';
import type { DynamicKeyPart, DynamicKeyParts } from './types/dynamicKeys';
import { getData } from './lib/getData';
import {
  encodeDataSourceWithHash,
  decodeDataSourceWithHash,
  encodeValueType,
  decodeValueType,
  encodeValueContent,
  decodeValueContent,
} from './lib/encoder';
import { internalSupportsInterface } from './lib/detector';
import { decodeMappingKey } from './lib/decodeMappingKey';
import {
  encodePermissions,
  decodePermissions,
  checkPermissions,
  mapPermission,
} from './lib/permissions';
import type { AssetURLEncode } from './types/encodeData';
import type { URLDataToEncode, URLDataWithHash, Verification } from './types';

export type {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
  Permissions,
};

export type { ERC725Config, KeyValuePair, ProviderTypes } from './types';
export {
  encodeData,
  encodeArrayKey,
  getVerificationMethod,
  isDataAuthentic,
} from './lib/utils';
export { decodeData } from './lib/decodeData';
export { encodeKeyName, isDynamicKeyName } from './lib/encodeKeyName';
export { decodeMappingKey } from './lib/decodeMappingKey';
export {
  encodeDataSourceWithHash,
  decodeDataSourceWithHash,
  encodeValueType,
  decodeValueType,
  encodeValueContent,
  decodeValueContent,
} from './lib/encoder';
export { getDataFromExternalSources } from './lib/getDataFromExternalSources';
export {
  encodePermissions,
  decodePermissions,
  checkPermissions,
  mapPermission,
} from './lib/permissions';
export { getSchema } from './lib/schemaParser';
import { createPublicClient, Hex, http, isAddress } from 'viem';
import { lukso } from 'viem/chains';

// PRIVATE FUNCTION
function initializeProvider(providerOrRpcUrl, gasInfo) {
  // do not fail on no-provider
  if (!providerOrRpcUrl) return undefined;

  // if provider is a string, assume it's a rpcUrl
  if (typeof providerOrRpcUrl === 'string') {
    const client = createPublicClient({
      chain: lukso,
      transport: http(providerOrRpcUrl),
    });
    return new ProviderWrapper(client, gasInfo);
  }

  if (
    typeof providerOrRpcUrl.request === 'function' ||
    typeof providerOrRpcUrl.send === 'function'
  )
    return new ProviderWrapper(providerOrRpcUrl, gasInfo);

  throw new Error(`Incorrect or unsupported provider ${providerOrRpcUrl}`);
}

// PUBLIC FUNCTION
export async function supportsInterface(
  interfaceIdOrName: string,
  options: {
    address: string;
    rpcUrl: string;
    gas?: number;
    provider?: any;
  },
): Promise<boolean> {
  if (!isAddress(options.address)) {
    throw new Error('Invalid address');
  }
  if (!options.rpcUrl) {
    throw new Error('Missing RPC URL');
  }

  return internalSupportsInterface(interfaceIdOrName, {
    address: options.address,
    provider:
      options.provider ||
      initializeProvider(
        options.rpcUrl,
        options?.gas ? options?.gas : DEFAULT_GAS_VALUE,
      ),
  });
}

/**
 * This package is currently in early stages of development, <br/>use only for testing or experimentation purposes.<br/>
 *
 * @typeParam Schema
 *
 */
export class ERC725 {
  options: ERC725Options;

  /**
   * Creates an instance of ERC725.
   * @param {ERC725JSONSchema[]} schema More information available here: [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
   * @param {string} address Address of the ERC725 contract you want to interact with
   * @param {any} provider
   * @param {ERC725Config} config Configuration object.
   *
   */
  constructor(
    schemas: ERC725JSONSchema[],
    address?,
    provider?: any,
    config?: ERC725Config,
  ) {
    // NOTE: provider param can be either the provider, or and object with {provider:xxx ,type:xxx}

    // TODO: Add check for schema format?
    if (!schemas) {
      throw new Error('Missing schema.');
    }

    const defaultConfig = {
      ipfsGateway: 'https://api.universalprofile.cloud/ipfs/',
      gas: DEFAULT_GAS_VALUE,
      throwSchemaErrors: false,
    };

    const gas = config?.gas ? config?.gas : defaultConfig.gas;

    this.options = {
      schemas: this.validateSchemas(
        schemas.flatMap((schema) =>
          duplicateMultiTypeERC725SchemaEntry(schema),
        ),
        config?.throwSchemaErrors || defaultConfig.throwSchemaErrors,
      ),
      address,
      provider: initializeProvider(provider, gas),
      ipfsFetch: config?.ipfsFetch,
      ipfsConvertUrl: config?.ipfsConvertUrl,
      ipfsGateway: config?.ipfsGateway
        ? convertIPFSGatewayUrl(config?.ipfsGateway)
        : defaultConfig.ipfsGateway,
      gas,
    };
  }

  /**
   * To prevent weird behavior from the lib, we must make sure all the schemas are correct before loading them.
   *
   * @param schemas
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  private validateSchemas(schemas: ERC725JSONSchema[], doThrow: boolean) {
    return schemas.filter((schema) => {
      if (
        schema.valueContent === 'AssetURL' ||
        schema.valueContent === 'JSONURL'
      ) {
        console.warn(
          `[Deprecation notice] The schema with keyName: ${schema.name} uses deprecated valueContent: ${schema.valueContent}. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.`,
        );
      }

      let isKeyValid: true | false | null = null;
      const segments: string[] = [];
      const errors: string[] = [];
      // Check schema item for dynamic key names. If it has, then make sure they have valid types.
      schema.name.replace(/<(.*?)>/g, (_, item) => {
        if (isKeyValid == null) {
          isKeyValid = true;
        }
        const valid = /bytes\d*|string|bool|address|u?int\d*/.test(item);
        if (!valid) {
          isKeyValid &&= valid;
          errors.push(`invalid dynamic key type: ${item} in name`);
        }
        segments.push(item);
        return '';
      });
      if (isKeyValid === true) {
        let index = 0;
        schema.key.replace(/<(.*?)>/g, (_, item) => {
          if (segments[index] !== item) {
            isKeyValid = false;
            errors.push(`dynamic ${segments[index]} != ${item} in key`);
          }
          index++;
          return '';
        });
      }

      let encodedKeyName = '';
      if (isKeyValid == null) {
        // If this key is not dynamic, then isKeyValid is null at this point.
        encodedKeyName = encodeKeyName(schema.name);

        if (schema.key !== encodedKeyName) {
          isKeyValid = false;
          errors.push(`key hash ${encodedKeyName} != ${schema.key}`);
        }
      }

      if (isKeyValid === false) {
        const message = `The schema with keyName: ${schema.name} is skipped because ${errors.join(', ')}`;
        if (doThrow) {
          throw new Error(message);
        }
        console.warn(message);
      }

      return isKeyValid !== false;
    });
  }

  private getAddressAndProvider() {
    if (!this.options.address || !isAddress(this.options.address)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    return {
      address: this.options.address,
      provider: this.options.provider,
    };
  }

  /**
   * Gets **decoded data** for one, many or all keys of the specified `ERC725` smart-contract.
   * When omitting the `keyOrKeys` parameter, it will get all the keys (as per {@link ERC725JSONSchema | ERC725JSONSchema} definition).
   *
   * Data returned by this function does not contain external data of [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl)
   * or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl) schema elements.
   *
   * If you would like to receive everything in one go, you can use {@link ERC725.fetchData | `fetchData`} for that.
   *
   * @param {*} keyOrKeys The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   *
   * @returns If the input is an array: an object with schema element key names as properties, with corresponding **decoded** data as values. If the input is a string, it directly returns the **decoded** data.
   */
  async getData(
    keyOrKeys?: Array<string | GetDataDynamicKey>,
  ): Promise<DecodeDataOutput[]>;
  async getData(
    keyOrKeys?: string | GetDataDynamicKey,
  ): Promise<DecodeDataOutput>;
  async getData(
    keyOrKeys?: GetDataInput,
  ): Promise<DecodeDataOutput | DecodeDataOutput[]> {
    this.getAddressAndProvider();
    return getData(this.options, keyOrKeys);
  }

  /**
   * Since {@link ERC725.getData | `getData`} exclusively returns data that is stored on the blockchain, `fetchData` comes in handy.
   * Additionally to the data from the blockchain, `fetchData` also returns data from IPFS or HTTP(s) endpoints
   * stored as [`JSONURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl) or [`ASSETURL`](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl).
   *
   * To ensure **data authenticity** `fetchData` compares the `hash` of the fetched JSON with the `hash` stored on the blockchain.
   *
   * @param {*} keyOrKeys The name (or the encoded name as the schema ‘key’) of the schema element in the class instance’s schema.
   *
   * @returns Returns the fetched and decoded value depending ‘valueContent’ for the schema element, otherwise works like getData.
   */

  async fetchData(
    keyOrKeys?: Array<string | GetDataDynamicKey>,
  ): Promise<FetchDataOutput[]>;
  async fetchData(
    keyOrKeys?: string | GetDataDynamicKey,
  ): Promise<FetchDataOutput>;
  async fetchData(
    keyOrKeys?: GetDataInput,
  ): Promise<FetchDataOutput | FetchDataOutput[]> {
    let keyNames: Array<string | GetDataDynamicKey>;
    if (Array.isArray(keyOrKeys)) {
      keyNames = keyOrKeys;
    } else if (!keyOrKeys) {
      keyNames = this.options.schemas
        .map((element) => element.name)
        .filter((key) => !isDynamicKeyName(key));
    } else {
      keyNames = [keyOrKeys];
    }

    const dataFromChain = await this.getData(keyNames);

    // NOTE: this step is executed in getData function above
    // We can optimize by computing it only once.
    const schemas = generateSchemasFromDynamicKeys(
      keyNames,
      this.options.schemas,
    );

    const dataFromExternalSources = await getDataFromExternalSources(
      schemas,
      dataFromChain,
      this.options,
    );

    if (
      keyOrKeys &&
      !Array.isArray(keyOrKeys) &&
      dataFromExternalSources.length > 0
    ) {
      return dataFromExternalSources[0];
    }

    return dataFromExternalSources;
  }

  /**
   * Parses a hashed key or a list of hashed keys and will attempt to return its corresponding LSP-2 ERC725YJSONSchema object.
   * The function will look for a corresponding key within the schemas:
   *  - in `./schemas` folder
   *  - provided at initialisation
   *  - provided in the function call
   *
   * @param keyOrKeys The hashed key or array of keys for which you want to find the corresponding LSP-2 ERC725YJSONSchema.
   * @param providedSchemas If you provide your own ERC725JSONSchemas, the parser will also try to find a key match against these schemas.
   */
  getSchema(
    keyOrKeys: string[],
    providedSchemas?: ERC725JSONSchema[],
  ): Record<string, ERC725JSONSchema | null>;
  getSchema(
    keyOrKeys: string,
    providedSchemas?: ERC725JSONSchema[],
  ): ERC725JSONSchema | null;
  getSchema(
    keyOrKeys: string | string[],
    providedSchemas?: ERC725JSONSchema[],
  ): ERC725JSONSchema | null | Record<string, ERC725JSONSchema | null> {
    return getSchema(keyOrKeys, providedSchemas || this.options.schemas);
  }

  /**
   * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
   * @param schemas Additionnal ERC725JSONSchemas which will be concatenated with the schemas provided on init.
   *
   * @returns An object with hashed keys and encoded values.
   *
   * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
   * The JSON will be hashed with `keccak256`.
   */
  encodeData(
    data: EncodeDataInput[] | EncodeDataInput,
    schemas?: ERC725JSONSchema[],
  ) {
    return encodeData(data, schemas || this.options.schemas);
  }

  /**
   * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
   * @param schemas ERC725JSONSchemas which will be used to encode the keys.
   *
   * @returns An object with hashed keys and encoded values.
   *
   * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
   * The JSON will be hashed with `keccak256`.
   */
  static encodeData(
    data: EncodeDataInput[] | EncodeDataInput,
    schemas: ERC725JSONSchema[],
  ) {
    return encodeData(data, schemas);
  }

  /**
   * In case you are reading the key-value store from an ERC725 smart-contract key-value store
   * without `@erc725/erc725.js` you can use `decodeData` to do the decoding for you.
   *
   * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
   * It does the `decoding` and `fetching` of external references for you automatically.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties.
   * @param schemas ERC725JSONSchemas which will be used to encode the keys.
   *
   * @returns Returns decoded data as defined and expected in the schema:
   */
  decodeData(
    data: DecodeDataInput[],
    schemas?: ERC725JSONSchema[],
  ): { [key: string]: any } {
    return decodeData(data, schemas || this.options.schemas);
  }

  /**
   * In case you are reading the key-value store from an ERC725 smart-contract key-value store
   * without `@erc725/erc725.js` you can use `decodeData` to do the decoding for you.
   *
   * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
   * It does the `decoding` and `fetching` of external references for you automatically.
   *
   * @param {{ [key: string]: any }} data An object with one or many properties.
   * @param schemas ERC725JSONSchemas which will be used to encode the keys.
   *
   * @returns Returns decoded data as defined and expected in the schema:
   */
  static decodeData(
    data: DecodeDataInput[],
    schemas: ERC725JSONSchema[],
  ): { [key: string]: any } {
    return decodeData(data, schemas);
  }

  /**
   * An added utility method which simply returns the owner of the contract.
   * Not directly related to ERC725 specifications.
   *
   * @param {string} [address]
   * @returns The address of the contract owner as stored in the contract.
   *
   *    This method is not yet supported when using the `graph` provider type.
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
   * A helper function which checks if a signature is valid according to the EIP-1271 standard.
   *
   * @param messageOrHash if it is a 66 chars string with 0x prefix, it will be considered as a hash (keccak256). If not, the message will be wrapped as follows: "\x19Ethereum Signed Message:\n" + message.length + message and hashed.
   * @param signature
   * @returns true if isValidSignature call on the contract returns the magic value. false otherwise
   */
  async isValidSignature(
    messageOrHash: Hex | string,
    signature: Hex,
  ): Promise<boolean> {
    if (!this.options.address || !isAddress(this.options.address)) {
      throw new Error('Missing ERC725 contract address.');
    }
    if (!this.options.provider) {
      throw new Error('Missing provider.');
    }

    return isValidSignature(
      messageOrHash,
      signature,
      this.options.address,
      this.options.provider,
    );
  }

  /**
   * Hashes a key name for use on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
   *
   * @param {string} keyName The key name you want to encode.
   * @param {DynamicKeyParts} dynamicKeyParts String or Array of String values used to construct the key.
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
   * @returns {string} The keccak256 hash of the provided key name. This is the key that must be retrievable from the ERC725Y contract via ERC725Y.getData(bytes32 key).
   */
  static encodeKeyName(
    keyName: string,
    dynamicKeyParts?: DynamicKeyParts,
  ): string {
    return encodeKeyName(keyName, dynamicKeyParts);
  }

  /**
   * Hashes a key name for use on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
   *
   * @param {string} keyName The key name you want to encode.
   * @param {DynamicKeyParts} dynamicKeyParts String or Array of String values used to construct the key.
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
   * @returns {string} The keccak256 hash of the provided key name. This is the key that must be retrievable from the ERC725Y contract via ERC725Y.getData(bytes32 key).
   */
  encodeKeyName(keyName: string, dynamicKeyParts?: DynamicKeyParts): string {
    return encodeKeyName(keyName, dynamicKeyParts);
  }

  /**
   * Decodes a hashed key used on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
   *
   * @param {string} keyHash Key hash that needs to be decoded.
   * @param {string | ERC725JSONSchema} keyNameOrSchema Key name following schema specifications or ERC725Y JSON Schema to follow in order to decode the key.
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
   * @returns {DynamicKeyPart[]} The Array with all the key decoded dynamic parameters. Each object have an attribute type and value.
   */
  static decodeMappingKey(
    keyHash: string,
    keyNameOrSchema: string | ERC725JSONSchema,
  ): DynamicKeyPart[] {
    return decodeMappingKey(keyHash, keyNameOrSchema);
  }

  /**
   * Decodes a hashed key used on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
   *
   * @param {string} keyHash Key hash that needs to be decoded.
   * @param {string | ERC725JSONSchema} keyNameOrSchema Key name following schema specifications or ERC725Y JSON Schema to follow in order to decode the key.
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
   * @returns {DynamicKeyPart[]} The Array with all the key decoded dynamic parameters. Each object have an attribute type and value.
   */
  decodeMappingKey(
    keyHash: string,
    keyNameOrSchema: string | ERC725JSONSchema,
  ): DynamicKeyPart[] {
    return decodeMappingKey(keyHash, keyNameOrSchema);
  }

  /**
   * Check if the ERC725 object supports
   * a certain interface.
   *
   * @param interfaceIdOrName Interface ID or supported interface name.
   * @returns {Promise<boolean>} if interface is supported.
   */
  async supportsInterface(interfaceIdOrName: string): Promise<boolean> {
    const { address, provider } = this.getAddressAndProvider();

    return internalSupportsInterface(interfaceIdOrName, {
      address,
      provider,
    });
  }

  /**
   * Check if a smart contract address
   * supports a certain interface.
   *
   * @param {string} interfaceIdOrName Interface ID or supported interface name.
   * @param options Object of address, RPC URL and optional gas.
   * @returns {Promise<boolean>} if interface is supported.
   */
  static async supportsInterface(
    interfaceIdOrName: string,
    options: { address: string; rpcUrl: string; gas?: number },
  ): Promise<boolean> {
    return supportsInterface(interfaceIdOrName, options);
  }

  // Permissions related functions
  // -----------------------------

  /**
   * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
   * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
   */
  static encodePermissions(permissions: Permissions): string {
    return encodePermissions(permissions);
  }

  /**
   * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
   * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
   */
  encodePermissions(permissions: Permissions): string {
    return encodePermissions(permissions);
  }

  /**
   * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissionHex The permission hexadecimal value to be decoded.
   * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
   */
  static decodePermissions(permissionHex: string) {
    return decodePermissions(permissionHex);
  }

  /**
   * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissionHex The permission hexadecimal value to be decoded.
   * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
   */
  decodePermissions(permissionHex: string) {
    return decodePermissions(permissionHex);
  }

  /**
   * Check if the required permissions are included in the granted permissions as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param requiredPermissions An array of required permissions or a single required permission.
   * @param grantedPermissions The granted permissions as a 32-byte hex string.
   * @return A boolean value indicating whether the required permissions are included in the granted permissions.
   */
  static checkPermissions(
    requiredPermissions: string[] | string,
    grantedPermissions: string,
  ): boolean {
    return checkPermissions(requiredPermissions, grantedPermissions);
  }

  /**
   * Check if the required permissions are included in the granted permissions as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param requiredPermissions An array of required permissions or a single required permission.
   * @param grantedPermissions The granted permissions as a 32-byte hex string.
   * @return A boolean value indicating whether the required permissions are included in the granted permissions.
   */
  checkPermissions(
    requiredPermissions: string[] | string,
    grantedPermissions: string,
  ): boolean {
    return checkPermissions(requiredPermissions, grantedPermissions);
  }

  static mapPermission(permission: string): string | null {
    return mapPermission(permission);
  }

  mapPermission(permission: string): string | null {
    return mapPermission(permission);
  }

  // Encoding methods
  // ----------------

  /**
   * @param type The valueType to encode the value as
   * @param value The value to encode
   * @returns The encoded value
   */
  static encodeValueType(
    type: string,
    value: string | string[] | bigint | bigint[] | boolean | boolean[],
  ): string {
    return encodeValueType(type, value);
  }

  encodeValueType(
    type: string,
    value: string | string[] | bigint | bigint[] | boolean | boolean[],
  ): string {
    return encodeValueType(type, value);
  }

  /**
   * @param type The valueType to decode the value as
   * @param data The data to decode
   * @returns The decoded value
   */
  static decodeValueType(type: string, data: string) {
    return decodeValueType(type, data);
  }

  decodeValueType(type: string, data: string) {
    return decodeValueType(type, data);
  }

  static encodeValueContent(
    valueContent: string,
    value:
      | string
      | number
      | bigint
      | AssetURLEncode
      | URLDataToEncode
      | boolean,
  ): string {
    return encodeValueContent(valueContent, value);
  }

  encodeValueContent(
    valueContent: string,
    value:
      | string
      | number
      | bigint
      | AssetURLEncode
      | URLDataToEncode
      | boolean,
  ): string {
    return encodeValueContent(valueContent, value);
  }

  static decodeValueContent(
    valueContent: string,
    value: string,
  ): string | URLDataWithHash | bigint | boolean | null {
    return decodeValueContent(valueContent, value);
  }

  decodeValueContent(
    valueContent: string,
    value: string,
  ): string | URLDataWithHash | bigint | boolean | null {
    return decodeValueContent(valueContent, value);
  }

  // External Data Source utilities (`VerifiableURI` and `JSONURI`)
  // ----------------------------------------------------------------

  encodeDataSourceWithHash(
    verification: undefined | Verification,
    dataSource: string,
  ): string {
    return encodeDataSourceWithHash(verification, dataSource);
  }

  static encodeDataSourceWithHash(
    verification: undefined | Verification,
    dataSource: string,
  ): string {
    return encodeDataSourceWithHash(verification, dataSource);
  }

  decodeDataSourceWithHash(value: string): URLDataWithHash {
    return decodeDataSourceWithHash(value);
  }

  static decodeDataSourceWithHash(value: string): URLDataWithHash {
    return decodeDataSourceWithHash(value);
  }

  static getVerificationMethod(nameOrSig: string):
    | {
        method: (data: string | object | Uint8Array | null) => string;
        name: SUPPORTED_VERIFICATION_METHOD_STRINGS;
        sig: SUPPORTED_VERIFICATION_METHODS;
      }
    | undefined {
    return getVerificationMethod(nameOrSig);
  }

  getVerificationMethod(nameOrSig: string):
    | {
        method: (data: string | object | Uint8Array | null) => string;
        name: SUPPORTED_VERIFICATION_METHOD_STRINGS;
        sig: SUPPORTED_VERIFICATION_METHODS;
      }
    | undefined {
    return getVerificationMethod(nameOrSig);
  }

  static isDataAuthentic(
    data: string | Uint8Array,
    verificationOptions: Verification,
  ): boolean {
    return isDataAuthentic(data, verificationOptions);
  }

  isDataAuthentic(
    data: string | Uint8Array,
    verificationOptions: Verification,
  ): boolean {
    return isDataAuthentic(data, verificationOptions);
  }
}

export default ERC725;
