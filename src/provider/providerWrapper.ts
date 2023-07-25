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
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file providers/web3ProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/

import AbiCoder from 'web3-eth-abi';

import { JsonRpc } from '../types/JsonRpc';
import { Method } from '../types/Method';
import { constructJSONRPC, decodeResult } from '../lib/provider-wrapper-utils';
import { ProviderTypes } from '../types/provider';
import { ERC725_VERSION, ERC725Y_INTERFACE_IDS } from '../constants/constants';

const abiCoder = AbiCoder;

interface GetDataReturn {
  key: string;
  value: Record<string, any> | null;
}

export class ProviderWrapper {
  type: ProviderTypes;
  provider: any;
  constructor(provider: any) {
    if (typeof provider.request === 'function') {
      this.type = ProviderTypes.ETHEREUM;
    } else {
      this.type = ProviderTypes.WEB3;
    }
    this.provider = provider;
  }

  async getOwner(address: string) {
    const result = await this.callContract(
      constructJSONRPC(address, Method.OWNER),
    );
    if (result.error) {
      throw result.error;
    }

    return decodeResult(Method.OWNER, result.result);
  }

  async getErc725YVersion(address: string): Promise<ERC725_VERSION> {
    const isErc725Yv5 = await this.supportsInterface(
      address,
      ERC725Y_INTERFACE_IDS['5.0'],
    );

    if (isErc725Yv5) {
      return ERC725_VERSION.ERC725_v5;
    }

    const isErc725Yv3 = await this.supportsInterface(
      address,
      ERC725Y_INTERFACE_IDS['3.0'],
    );

    // The version 3 of the package can use the getData function from v2, still compatible
    if (isErc725Yv3) {
      return ERC725_VERSION.ERC725_v2;
    }

    const isErc725Yv2 = await this.supportsInterface(
      address,
      ERC725Y_INTERFACE_IDS['2.0'],
    );

    if (isErc725Yv2) {
      return ERC725_VERSION.ERC725_v2;
    }

    // v0.2.0 and v0.6.0 have the same function signatures for getData, only versions before v0.2.0 requires a different call

    const isErc725YLegacy = await this.supportsInterface(
      address,
      ERC725Y_INTERFACE_IDS.legacy,
    );

    return isErc725YLegacy
      ? ERC725_VERSION.ERC725_LEGACY
      : ERC725_VERSION.NOT_ERC725;
  }

  /**
   * https://eips.ethereum.org/EIPS/eip-165
   *
   * @param address the smart contract address
   * @param interfaceId ERC-165 identifier as described here: https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
   */
  async supportsInterface(
    address: string,
    interfaceId: string,
  ): Promise<boolean> {
    const result = await this.callContract(
      constructJSONRPC(
        address,
        Method.SUPPORTS_INTERFACE,
        `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`,
      ),
    );

    // These will be boolean because passing Method.SUPPORTS_INTERFACE ensures they will be decoded to bool by web3-eth-abi lib
    // The {[key: string]: any} return type causes problems for boolean values so we have to cast here
    if (this.type === ProviderTypes.ETHEREUM) {
      return decodeResult(
        Method.SUPPORTS_INTERFACE,
        result,
      ) as unknown as boolean;
    }
    return decodeResult(
      Method.SUPPORTS_INTERFACE,
      result.result,
    ) as unknown as boolean;
  }

  /**
   * https://eips.ethereum.org/EIPS/eip-1271
   *
   * @param address the contract address
   * @param hash
   * @param signature
   */
  async isValidSignature(
    address: string,
    hash: string,
    signature: string,
  ): Promise<string> {
    if (this.type === ProviderTypes.ETHEREUM) {
      const encodedParams = abiCoder.encodeParameters(
        ['bytes32', 'bytes'],
        [hash, signature],
      );

      const result = await this.callContract(
        constructJSONRPC(address, Method.IS_VALID_SIGNATURE, encodedParams),
      );

      if (result.error) {
        throw result.error;
      }

      // Passing Method.IS_VALID_SIGNATURE ensures this will be string
      return decodeResult(
        Method.IS_VALID_SIGNATURE,
        result,
      ) as unknown as string;
    }

    const encodedParams = abiCoder.encodeParameters(
      ['bytes32', 'bytes'],
      [hash, signature],
    );

    const results = await this.callContract([
      constructJSONRPC(address, Method.IS_VALID_SIGNATURE, encodedParams),
    ]);
    if (results.error) {
      throw results.error;
    }

    // Passing Method.IS_VALID_SIGNATURE ensures this will be string
    return decodeResult(
      Method.IS_VALID_SIGNATURE,
      results[0].result,
    ) as unknown as string;
  }

  async getData(address: string, keyHash: string) {
    const result = await this.getAllData(address, [keyHash]);
    try {
      return result[0].value;
    } catch {
      return null;
    }
  }

  async getAllData(
    address: string,
    keyHashes: string[],
  ): Promise<GetDataReturn[]> {
    const erc725Version = await this.getErc725YVersion(address);

    if (erc725Version === ERC725_VERSION.NOT_ERC725) {
      throw new Error(
        `Contract: ${address} does not support ERC725Y interface.`,
      );
    }

    switch (erc725Version) {
      case ERC725_VERSION.ERC725_v5:
        return this._getAllDataGeneric(
          address,
          keyHashes,
          Method.GET_DATA_BATCH,
        );
      case ERC725_VERSION.ERC725_v2:
        return this._getAllDataGeneric(address, keyHashes, Method.GET_DATA);
      case ERC725_VERSION.ERC725_LEGACY:
        return this._getAllDataLegacy(address, keyHashes);
      default:
        return [];
    }
  }

  private async _getAllDataGeneric(
    address: string,
    keyHashes: string[],
    method: Method.GET_DATA | Method.GET_DATA_BATCH,
  ): Promise<GetDataReturn[]> {
    if (this.type === ProviderTypes.ETHEREUM) {
      const encodedResults = await this.callContract(
        constructJSONRPC(
          address,
          method,
          abiCoder.encodeParameter('bytes32[]', keyHashes),
        ),
      );

      const decodedValues = decodeResult(method, encodedResults);

      return keyHashes.map<GetDataReturn>((keyHash, index) => ({
        key: keyHash,
        value: decodedValues ? decodedValues[index] : decodedValues,
      }));
    }

    const payload: JsonRpc[] = [
      constructJSONRPC(
        address,
        method,
        abiCoder.encodeParameter('bytes32[]', keyHashes),
      ),
    ];

    const results: any = await this.callContract(payload);
    const decodedValues = decodeResult(method, results[0].result);

    return keyHashes.map<GetDataReturn>((key, index) => ({
      key,
      value: decodedValues ? decodedValues[index] : decodedValues,
    }));
  }

  private async _getAllDataLegacy(
    address: string,
    keyHashes: string[],
  ): Promise<GetDataReturn[]> {
    if (this.type === ProviderTypes.ETHEREUM) {
      // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
      // But this is already legacy and it won't be used anymore..
      const encodedResultsPromises = keyHashes.map((keyHash) =>
        this.callContract(
          constructJSONRPC(address, Method.GET_DATA_LEGACY, keyHash),
        ),
      );

      const decodedResults = await Promise.all(encodedResultsPromises);

      return decodedResults.map((decodedResult, index) => ({
        key: keyHashes[index],
        value: decodeResult(Method.GET_DATA_LEGACY, decodedResult),
      }));
    }

    const payload: JsonRpc[] = [];
    // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
    // But this is already legacy and it won't be used anymore..
    for (let index = 0; index < keyHashes.length; index++) {
      payload.push(
        constructJSONRPC(address, Method.GET_DATA_LEGACY, keyHashes[index]),
      );
    }

    const results: any = await this.callContract(payload);

    return payload.map<GetDataReturn>((payloadCall, index) => ({
      key: keyHashes[index],
      value: decodeResult(
        Method.GET_DATA_LEGACY,
        results.find((element) => payloadCall.id === element.id).result,
      ),
    }));
  }

  private async callContract(payload: JsonRpc[] | JsonRpc): Promise<any> {
    if (this.type === ProviderTypes.ETHEREUM) {
      return this.provider.request({
        method: 'eth_call',
        params: (payload as JsonRpc).params,
      });
    }

    return new Promise((resolve, reject) => {
      // Send old web3 method with callback to resolve promise
      // This is deprecated: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-send-deprecated

      this.provider.send(payload, (e, r) => {
        if (e) {
          reject(e);
        } else {
          resolve(r);
        }
      });
    });
  }
}
