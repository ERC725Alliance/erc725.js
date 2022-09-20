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
 * @date 2020
 */

import { hexToNumber, isAddress, leftPad, toHex, AbiItem } from 'web3-utils';
import Web3 from 'web3';

import { Web3ProviderWrapper } from './providers/web3ProviderWrapper';
import { EthereumProviderWrapper } from './providers/ethereumProviderWrapper';

import {
  encodeData,
  convertIPFSGatewayUrl,
  generateSchemasFromDynamicKeys,
} from './lib/utils';

import { getSchema } from './lib/schemaParser';
import { isValidSignature } from './lib/isValidSignature';

import {
  LSP6_ALL_PERMISSIONS,
  LSP6_DEFAULT_PERMISSIONS,
} from './lib/constants';
import {
  LSPType,
  COMMON_ABIS,
  INTERFACE_IDS_0_7_0,
  LSPTypeOptions,
} from './lib/interfaces';
import { encodeKeyName, isDynamicKeyName } from './lib/encodeKeyName';

// Types
import { ERC725Config, ERC725Options } from './types/Config';
import { Permissions } from './types/Method';
import {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
} from './types/ERC725JSONSchema';
import lsp3Schema from '../schemas/LSP3UniversalProfileMetadata.json';
import lsp4Schema from '../schemas/LSP4DigitalAsset.json';
import lsp5Schema from '../schemas/LSP5ReceivedAssets.json';
import lsp6Schema from '../schemas/LSP6KeyManager.json';
import lsp9Schema from '../schemas/LSP9Vault.json';
import {
  DecodeDataInput,
  DecodeDataOutput,
  EncodeDataInput,
} from './types/decodeData';
import { GetDataDynamicKey, GetDataInput } from './types/GetData';
import { decodeData } from './lib/decodeData';
import { getDataFromExternalSources } from './lib/getDataFromExternalSources';
import { DynamicKeyParts } from './types/dynamicKeys';
import { getData } from './lib/getData';

export {
  ERC725JSONSchema,
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
};

export { ERC725Config, KeyValuePair, ProviderTypes } from './types';
export { encodeData } from './lib/utils';
/**
 * This package is currently in early stages of development, <br/>use only for testing or experimentation purposes.<br/>
 *
 * @typeParam Schema
 *
 */
export class ERC725 {
  options: ERC725Options & ERC725Config;

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
      ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
    };

    this.options = {
      schemas: this.validateSchemas(schemas),
      address,
      provider: this.initializeProvider(provider),
      ipfsGateway: config?.ipfsGateway
        ? convertIPFSGatewayUrl(config?.ipfsGateway)
        : defaultConfig.ipfsGateway,
    };
  }

  /**
   * To prevent weird behovior from the lib, we must make sure all the schemas are correct before loading them.
   *
   * @param schemas
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  private validateSchemas(schemas: ERC725JSONSchema[]) {
    return schemas.filter((schema) => {
      try {
        const encodedKeyName = encodeKeyName(schema.name);

        const isKeyValid = schema.key === encodedKeyName;

        if (!isKeyValid) {
          console.log(
            `The schema with keyName: ${schema.key} is skipped because its key hash does not match its key name (expected: ${encodedKeyName}, got: ${schema.key}).`,
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

  // eslint-disable-next-line class-methods-use-this
  private initializeProvider(providerOrRpcUrl) {
    // do not fail on no-provider
    if (!providerOrRpcUrl) return undefined;

    // if provider is a string, assume it's a rpcUrl
    if (typeof providerOrRpcUrl === 'string') {
      return new Web3ProviderWrapper(
        new Web3.providers.HttpProvider(providerOrRpcUrl),
      );
    }

    if (typeof providerOrRpcUrl.request === 'function')
      return new EthereumProviderWrapper(providerOrRpcUrl);

    if (
      !providerOrRpcUrl.request &&
      typeof providerOrRpcUrl.send === 'function'
    )
      return new Web3ProviderWrapper(providerOrRpcUrl);

    throw new Error(`Incorrect or unsupported provider ${providerOrRpcUrl}`);
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
  ): Promise<DecodeDataOutput[]>;
  async fetchData(
    keyOrKeys?: string | GetDataDynamicKey,
  ): Promise<DecodeDataOutput>;
  async fetchData(
    keyOrKeys?: GetDataInput,
  ): Promise<DecodeDataOutput | DecodeDataOutput[]> {
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
      this.options.ipfsGateway,
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
   * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
   * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
   */
  static encodePermissions(permissions: Permissions): string {
    const result = Object.keys(permissions).reduce((previous, key) => {
      return permissions[key]
        ? previous + hexToNumber(LSP6_DEFAULT_PERMISSIONS[key])
        : previous;
    }, 0);

    return leftPad(toHex(result), 64);
  }

  /**
   * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
   * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
   */
  encodePermissions(permissions: Permissions): string {
    return ERC725.encodePermissions(permissions);
  }

  /**
   * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissionHex The permission hexadecimal value to be decoded.
   * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
   */
  static decodePermissions(permissionHex: string) {
    const result = {
      CHANGEOWNER: false,
      CHANGEPERMISSIONS: false,
      ADDPERMISSIONS: false,
      SETDATA: false,
      CALL: false,
      STATICCALL: false,
      DELEGATECALL: false,
      DEPLOY: false,
      TRANSFERVALUE: false,
      SIGN: false,
      ENCRYPT: false,
      SUPER_SETDATA: false,
      SUPER_TRANSFERVALUE: false,
      SUPER_CALL: false,
      SUPER_STATICCALL: false,
      SUPER_DELEGATECALL: false,
    };

    const permissionsToTest = Object.keys(LSP6_DEFAULT_PERMISSIONS);
    if (permissionHex === LSP6_ALL_PERMISSIONS) {
      permissionsToTest.forEach((testPermission) => {
        result[testPermission] = true;
      });
      return result;
    }

    const passedPermissionDecimal = hexToNumber(permissionHex);

    permissionsToTest.forEach((testPermission) => {
      const decimalTestPermission = hexToNumber(
        LSP6_DEFAULT_PERMISSIONS[testPermission],
      );
      const isPermissionIncluded =
        (passedPermissionDecimal & decimalTestPermission) ===
        decimalTestPermission;

      result[testPermission] = isPermissionIncluded;
    });

    return result;
  }

  /**
   * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
   *
   * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
   * @param permissionHex The permission hexadecimal value to be decoded.
   * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
   */
  decodePermissions(permissionHex: string) {
    return ERC725.decodePermissions(permissionHex);
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

  LSPTypeOptions: Record<Exclude<LSPType, LSPType.Unknown>, LSPTypeOptions> = {
    [LSPType.LSP0ERC725Account]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP0ERC725Account,
    },
    [LSPType.LSP1UniversalReceiver]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP1UniversalReceiver,
    },
    [LSPType.LSP1UniversalReceiverDelegate]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP1UniversalReceiverDelegate,
    },
    [LSPType.LSP3UniversalProfile]: {
      lsp2Schema: this.getSupportedStandardObject(
        lsp3Schema as ERC725JSONSchema[],
      ),
    },
    [LSPType.LSP4DigitalAssetMetadata]: {
      lsp2Schema: this.getSupportedStandardObject(
        lsp4Schema as ERC725JSONSchema[],
      ),
    },
    [LSPType.LSP5ReceivedAssets]: {
      // TODO: No supportedStandards key nor interface
    },
    [LSPType.LSP6KeyManager]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP6KeyManager,
    },
    [LSPType.LSP7DigitalAsset]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP7DigitalAsset,
    },
    [LSPType.LSP8IdentifiableDigitalAsset]: {
      interfaceId: INTERFACE_IDS_0_7_0.LSP8IdentifiableDigitalAsset,
    },
    [LSPType.LSP9Vault]: {
      // TODO: Check both: InterfaceId and schema?
      interfaceId: INTERFACE_IDS_0_7_0.LSP9Vault,
      lsp2Schema: this.getSupportedStandardObject(
        lsp9Schema as ERC725JSONSchema[],
      ),
    },
    [LSPType.LSP10ReceivedVaults]: {
      // TODO: No supportedStandards key nor interface
    },
    [LSPType.LSP12IssuedAssets]: {
      // TODO: No supportedStandards key nor interface
    },
  };

  private getSupportedStandardObject(schemas: ERC725JSONSchema[]) {
    try {
      const results = schemas.filter((schema) => {
        return schema.name.startsWith('SupportedStandard:');
      });

      if (results.length === 0) {
        return null;
      }

      return results[0];
    } catch (error) {
      return null;
    }
  }

  async detectLSP(
    contractAddress: string,
    lspType: LSPType,
    web3Provider: Web3,
  ) {
    if (lspType === LSPType.Unknown) {
      return false;
    }

    // EIP-165 detection
    const contract = new web3Provider.eth.Contract(
      COMMON_ABIS.supportsInterface as AbiItem[],
      contractAddress,
    );

    // Check if the contract implements the LSP interface ID
    if (this.LSPTypeOptions[lspType].interfaceId) {
      try {
        return await contract.methods.supportsInterface(
          this.LSPTypeOptions[lspType],
        ).call;
      } catch (err) {
        return false;
      }
    }

    // Check if the contract implements the LSP schema
    if (this.LSPTypeOptions[lspType].lsp2Schema) {
      const { lsp2Schema } = this.LSPTypeOptions[lspType];

      if (!lsp2Schema) {
        return false;
      }

      try {
        const lspSupportedStandards = await this.fetchData(lsp2Schema.name);
        // @ts-ignore
        return lspSupportedStandards.value === lsp2Schema.valueContent;
      } catch (error) {
        return false;
      }
    } else return false;
  }
}
export default ERC725;
