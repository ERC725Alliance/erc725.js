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
import { ERC725_VERSION, INTERFACE_IDS } from '../lib/constants';

// TS can't get the types from the import...
// @ts-ignore
const abiCoder: AbiCoder.AbiCoder = AbiCoder;

interface GetDataReturn {
  key: string;
  value: Record<string, any> | null;
}

export class Web3ProviderWrapper {
  type: ProviderTypes;
  provider: any;
  constructor(provider: any) {
    this.type = ProviderTypes.WEB3;
    this.provider = provider;
  }

  async getOwner(address: string) {
    const result = await this.callContract(
      constructJSONRPC(address, Method.OWNER),
    );
    if (result.error) {
      throw result.error;
    }

    return decodeResult(Method.OWNER, result);
  }

  async getErc725YVersion(address: string): Promise<ERC725_VERSION> {
    const isErc725Y = await this.supportsInterface(
      address,
      INTERFACE_IDS.ERC725Y,
    );

    if (isErc725Y) {
      return ERC725_VERSION.ERC725;
    }

    const isErc725Yv200 = await this.supportsInterface(
      address,
      INTERFACE_IDS.ERC725Y_v200,
    );

    if (isErc725Yv200) {
      return ERC725_VERSION.ERC725;
    }

    // v0.2.0 and v0.6.0 have the same function signatures for getData, only versions before v0.2.0 requires a different call

    const isErc725YLegacy = await this.supportsInterface(
      address,
      INTERFACE_IDS.ERC725Y_LEGACY,
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
    return decodeResult(
      Method.SUPPORTS_INTERFACE,
      await this.callContract(
        constructJSONRPC(
          address,
          Method.SUPPORTS_INTERFACE,
          `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`,
        ),
      ),
    );
  }

  /**
   * https://eips.ethereum.org/EIPS/eip-1271
   *
   * @param address the contract address
   * @param hash
   * @param signature
   */
  async isValidSignature(address: string, hash: string, signature: string) {
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

    return decodeResult(Method.IS_VALID_SIGNATURE, results[0]);
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
      case ERC725_VERSION.ERC725:
        return this._getAllData(address, keyHashes);
      case ERC725_VERSION.ERC725_LEGACY:
        return this._getAllDataLegacy(address, keyHashes);
      default:
        return [];
    }
  }

  private async _getAllData(
    address: string,
    keyHashes: string[],
  ): Promise<GetDataReturn[]> {
    const payload: JsonRpc[] = [
      constructJSONRPC(
        address,
        Method.GET_DATA,
        abiCoder.encodeParameter('bytes32[]', keyHashes),
      ),
    ];

    const results: any = await this.callContract(payload);
    const decodedValues = decodeResult(Method.GET_DATA, results[0]);

    return keyHashes.map<GetDataReturn>((key, index) => ({
      key,
      value: decodedValues[index],
    }));
  }

  private async _getAllDataLegacy(
    address: string,
    keyHashes: string[],
  ): Promise<GetDataReturn[]> {
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
        results.find((element) => payloadCall.id === element.id),
      ),
    }));
  }

  private async callContract(payload: JsonRpc[] | JsonRpc): Promise<any> {
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
