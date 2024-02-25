import HttpProvider from 'web3-providers-http';
import { isAddress } from 'web3-validator';
import { ProviderWrapper } from '../provider/providerWrapper';
import {
  encodeData,
  convertIPFSGatewayUrl,
  generateSchemasFromDynamicKeys,
  duplicateMultiTypeERC725SchemaEntry,
} from './utils';
import { getSchema } from './schemaParser';
import { isValidSignature } from './isValidSignature';
import { DEFAULT_GAS_VALUE } from '../constants/constants';
import { encodeKeyName, isDynamicKeyName } from './encodeKeyName';
import { ERC725Config, ERC725Options } from '../types/Config';
import { Permissions } from '../types/Method';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import {
  DecodeDataInput,
  DecodeDataOutput,
  EncodeDataInput,
  FetchDataOutput,
} from '../types/decodeData';
import { GetDataDynamicKey, GetDataInput } from '../types/GetData';
import { decodeData } from './decodeData';
import { getDataFromExternalSources } from './getDataFromExternalSources';
import { DynamicKeyPart, DynamicKeyParts } from '../types/dynamicKeys';
import { getData } from './getData';
import { decodeValueType, encodeValueType } from './encoder';
import { supportsInterface, checkPermissions } from './detector';
import { decodeMappingKey } from './decodeMappingKey';
import { decodePermissions, encodePermissions } from './permissions';

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
    };

    this.options = {
      schemas: this.validateSchemas(
        schemas
          .map((schema) => duplicateMultiTypeERC725SchemaEntry(schema))
          .flat(),
      ),
      address,
      provider: ERC725.initializeProvider(
        provider,
        config?.gas ? config?.gas : defaultConfig.gas,
      ),
      ipfsGateway: config?.ipfsGateway
        ? convertIPFSGatewayUrl(config?.ipfsGateway)
        : defaultConfig.ipfsGateway,
      gas: config?.gas ? config?.gas : defaultConfig.gas,
    };
  }

  /**
   * To prevent weird behavior from the lib, we must make sure all the schemas are correct before loading them.
   *
   * @param schemas
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  private validateSchemas(schemas: ERC725JSONSchema[]) {
    return schemas.filter((schema) => {
      if (
        schema.valueContent === 'AssetURL' ||
        schema.valueContent === 'JSONURL'
      ) {
        console.warn(
          `[Deprecation notice] The schema with keyName: ${schema.name} uses deprecated valueContent: ${schema.valueContent}. It has been replaced by VerifiableURI. Decoding is backward compatible but value will be encoded as VerifiableURI.`,
        );
      }

      try {
        const encodedKeyName = encodeKeyName(schema.name);

        const isKeyValid = schema.key === encodedKeyName;

        if (!isKeyValid) {
          console.warn(
            `The schema with keyName: ${schema.name} is skipped because its key hash does not match its key name (expected: ${encodedKeyName}, got: ${schema.key}).`,
          );
        }

        return isKeyValid;
      } catch (err: any) {
        // We could not encodeKeyName, probably because the key is dynamic (Mapping or MappingWithGrouping).
        // TODO: make sure the dynamic key name is valid:
        // - has max 2 variables
        // - variables are correct (<string>, <bool>, etc.)
        // Keeping dynamic keys may be an issue for getData / fetchData functions.
        return true;
      }
    });
  }

  private static initializeProvider(providerOrRpcUrl, gasInfo) {
    // do not fail on no-provider
    if (!providerOrRpcUrl) return undefined;

    // if provider is a string, assume it's a rpcUrl
    if (typeof providerOrRpcUrl === 'string') {
      return new ProviderWrapper(new HttpProvider(providerOrRpcUrl), gasInfo);
    }

    if (
      typeof providerOrRpcUrl.request === 'function' ||
      typeof providerOrRpcUrl.send === 'function'
    )
      return new ProviderWrapper(providerOrRpcUrl, gasInfo);

    throw new Error(`Incorrect or unsupported provider ${providerOrRpcUrl}`);
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
    let throwException = false;
    if (Array.isArray(keyOrKeys)) {
      keyNames = keyOrKeys;
    } else if (!keyOrKeys) {
      keyNames = this.options.schemas
        .map((element) => element.name)
        .filter((key) => !isDynamicKeyName(key));
    } else {
      throwException = true; // If it's explicitely a single key, then we allow throwing an exception
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
      this.options.ipfsGateway,
      throwException,
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
    return getSchema(
      keyOrKeys,
      this.options.schemas.concat(providedSchemas || []),
    );
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
  encodeData(data: EncodeDataInput[], schemas?: ERC725JSONSchema[]) {
    return encodeData(
      data,
      Array.prototype.concat(this.options.schemas, schemas),
    );
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
  static encodeData(data: EncodeDataInput[], schemas: ERC725JSONSchema[]) {
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
    return decodeData(
      data,
      Array.prototype.concat(this.options.schemas, schemas),
    );
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
    messageOrHash: string,
    signature: string,
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

    return supportsInterface(interfaceIdOrName, {
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
    if (!isAddress(options.address)) {
      throw new Error('Invalid address');
    }
    if (!options.rpcUrl) {
      throw new Error('Missing RPC URL');
    }

    return supportsInterface(interfaceIdOrName, {
      address: options.address,
      provider: this.initializeProvider(
        options.rpcUrl,
        options?.gas ? options?.gas : DEFAULT_GAS_VALUE,
      ),
    });
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
    return ERC725.checkPermissions(requiredPermissions, grantedPermissions);
  }

  /**
   * @param type The valueType to encode the value as
   * @param value The value to encode
   * @returns The encoded value
   */
  static encodeValueType(
    type: string,
    value: string | string[] | number | number[] | boolean | boolean[],
  ): string {
    return encodeValueType(type, value);
  }

  encodeValueType(
    type: string,
    value: string | string[] | number | number[] | boolean | boolean[],
  ): string {
    return ERC725.encodeValueType(type, value);
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
    return ERC725.decodeValueType(type, data);
  }
}