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

import type { JsonRpc } from '../types/JsonRpc';
import { Method } from '../types/Method';
import { constructJSONRPC, decodeResult } from '../lib/provider-wrapper-utils';
import { ProviderTypes } from '../types/provider';
import { ERC725_VERSION, ERC725Y_INTERFACE_IDS } from '../constants/constants';
import { encodeAbiParameters, Hex } from 'viem';

interface GetDataReturn {
  key: string;
  value: Record<string, any> | null;
}

export class ProviderWrapper {
  type: ProviderTypes;
  provider: any;
  gas: number;
  constructor(provider: any, gasInfo: number) {
    if (typeof provider.request === 'function') {
      this.type = ProviderTypes.ETHEREUM;
    } else {
      this.type = ProviderTypes.WEB3;
    }
    this.provider = provider;
    this.gas = gasInfo;
  }

  async getOwner(address: string) {
    const result = await this.callContract(
      constructJSONRPC(address, Method.OWNER, this.gas),
    );
    return decodeResult(Method.OWNER, result);
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

    if (isErc725YLegacy) {
      return ERC725_VERSION.ERC725_LEGACY;
    }
    return ERC725_VERSION.NOT_ERC725;
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
        this.gas,
        `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`,
      ),
    );
    return decodeResult(
      Method.SUPPORTS_INTERFACE,
      result,
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
      const encodedParams = encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'bytes' }],
        [hash as Hex, signature as Hex],
      );

      const result = await this.callContract(
        constructJSONRPC(
          address,
          Method.IS_VALID_SIGNATURE,
          undefined, // this.gas,
          encodedParams,
        ),
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

    const encodedParams = encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'bytes' }],
      [hash as Hex, signature as Hex],
    );

    const results = await this.callContract([
      constructJSONRPC(
        address,
        Method.IS_VALID_SIGNATURE,
        undefined, // this.gas,
        encodedParams,
      ),
    ]);

    // Passing Method.IS_VALID_SIGNATURE ensures this will be string
    return decodeResult(
      Method.IS_VALID_SIGNATURE,
      results[0],
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
          undefined, // this.gas,
          encodeAbiParameters([{ type: 'bytes32[]' }], [keyHashes as Hex[]]),
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
        undefined, // this.gas,
        encodeAbiParameters([{ type: 'bytes32[]' }], [keyHashes as Hex[]]),
      ),
    ];

    const results: any = await this.callContract(payload);
    const decodedValues = decodeResult(method, results[0]);

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
          constructJSONRPC(address, Method.GET_DATA_LEGACY, this.gas, keyHash),
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
        constructJSONRPC(
          address,
          Method.GET_DATA_LEGACY,
          this.gas,
          keyHashes[index],
        ),
      );
    }

    const results: Hex[] = await this.callContract(payload);

    return payload.map<GetDataReturn>((_payloadCall, index) => {
      return {
        key: keyHashes[index],
        value: decodeResult(Method.GET_DATA_LEGACY, results[index]),
      };
    });
  }

  // public for testing
  public async callContract(payload: JsonRpc[] | JsonRpc): Promise<any> {
    // Make this mock provider always return the result in terms of data.
    // So if the result is wrapped in an object as result.result then unwrap it.
    // Some code was assuming it's wrapped and other was it's not wrapped.
    if (this.type === ProviderTypes.ETHEREUM) {
      const result = await this.provider.request(payload);
      if (result.error) {
        const error = new Error('Call failed');
        Object.assign(error, result.error);
        throw error;
      }
      if (result.result) {
        return result.result;
      }
      return result;
    }

    const handleOne = async (payload: JsonRpc) => {
      return new Promise((resolve, reject) => {
        // Send old web3 method with callback to resolve promise
        // This is deprecated: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-send-deprecated

        const doResolve = (r) => {
          if (r.error) {
            let error: any;
            ({ error } = r);
            if (!(error instanceof Error)) {
              error = new Error('Call failed');
              Object.assign(error, r.error);
            }
            return reject(error);
          }
          return resolve(r.result || '0x');
        };
        const promise = this.provider.send(payload, (e, r) => {
          if (e) {
            reject(e);
          } else {
            doResolve(r);
          }
        });
        if (promise && typeof promise.then === 'function') {
          promise.then(doResolve, reject);
        }
      });
    };
    if (Array.isArray(payload)) {
      return Promise.all(payload.map(handleOne));
    }
    return handleOne(payload);
  }
}
