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
 * @file providers/ethereumProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the Ethereum provider api in accordance with
  implementation of smart contract interfaces of ERC725
*/

import * as abi from 'web3-eth-abi';

import { ERC725_VERSION, INTERFACE_IDS, METHODS } from '../lib/constants';
import { decodeResult as decodeResultUtils } from '../lib/provider-wrapper-utils';
import { JsonRpcEthereumProvider } from '../types/JsonRpc';
import { Method } from '../types/Method';
import { ProviderTypes } from '../types/provider';

// @ts-ignore
const abiCoder = abi.default;

interface GetDataReturn {
  key: string;
  value: Record<string, any> | null;
}

// https://docs.metamask.io/guide/ethereum-provider.html
export class EthereumProviderWrapper {
  type: ProviderTypes;
  provider: any;
  constructor(provider: any) {
    this.type = ProviderTypes.ETHEREUM;
    this.provider = provider;
  }

  async getOwner(address: string) {
    const params = this.constructJSONRPC(address, Method.OWNER);
    const result = await this.callContract([params]);
    if (result.error) {
      throw result.error;
    }

    return this.decodeResult(Method.OWNER, result);
  }

  async getErc725YVersion(address: string): Promise<ERC725_VERSION> {
    const isErc725Y = await this.supportsInterface(
      address,
      INTERFACE_IDS.ERC725Y,
    );

    if (isErc725Y) {
      return ERC725_VERSION.ERC725;
    }

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
  async supportsInterface(address: string, interfaceId: string) {
    return this.decodeResult(
      Method.SUPPORTS_INTERFACE,
      await this.callContract([
        this.constructJSONRPC(
          address,
          Method.SUPPORTS_INTERFACE,
          `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`,
        ),
      ]),
    );
  }

  async getData(address: string, keyHash: string) {
    const result = this.getAllData(address, [keyHash]);

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
    const encodedResults = await this.callContract([
      this.constructJSONRPC(
        address,
        Method.GET_DATA,
        abiCoder.encodeParameter('bytes32[]', keyHashes),
      ),
    ]);

    const decodedValues = this.decodeResult(Method.GET_DATA, encodedResults);

    return keyHashes.map<GetDataReturn>((keyHash, index) => ({
      key: keyHash,
      value: decodedValues[index],
    }));
  }

  private async _getAllDataLegacy(
    address: string,
    keyHashes: string[],
  ): Promise<GetDataReturn[]> {
    // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
    // But this is already legacy and it won't be used anymore..
    const encodedResultsPromises = keyHashes.map((keyHash) =>
      this.callContract([
        this.constructJSONRPC(address, Method.GET_DATA_LEGACY, keyHash),
      ]),
    );

    const decodedResults = await Promise.all(encodedResultsPromises);

    return decodedResults.map((decodedResult, index) => ({
      key: keyHashes[index],
      value: this.decodeResult(Method.GET_DATA_LEGACY, decodedResult),
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  private constructJSONRPC(
    address: string,
    method: Method,
    methodParam?: string,
  ): JsonRpcEthereumProvider {
    const data = methodParam
      ? METHODS[method].sig + methodParam.replace('0x', '')
      : METHODS[method].sig;

    return {
      to: address,
      gas: METHODS[method].gas,
      gasPrice: METHODS[method].gasPrice,
      value: METHODS[method].value,
      data,
    };
  }

  private async callContract(params: any) {
    return this.provider.request({ method: 'eth_call', params });
  }

  // eslint-disable-next-line class-methods-use-this
  private decodeResult(method: Method, result: string) {
    return decodeResultUtils(method, { result });
  }
}
