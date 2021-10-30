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

  async getData(address: string, keyHash: string) {
    const erc725Version = await this.getErc725YVersion(address);

    switch (erc725Version) {
      case 'ERC725': {
        return decodeResult(
          Method.GET_DATA,
          await this.callContract(
            constructJSONRPC(
              address,
              Method.GET_DATA,
              abiCoder.encodeParameter('bytes32[]', [keyHash]),
            ),
          ),
        )[0];
      }
      case 'ERC725_LEGACY': {
        return decodeResult(
          Method.GET_DATA_LEGACY,
          await this.callContract(
            constructJSONRPC(address, Method.GET_DATA_LEGACY, keyHash),
          ),
        );
      }
      default:
        throw new Error(
          `Contract: ${address} does not support ERC725Y interface.`,
        );
    }
  }

  async getAllData(address: string, keys: string[]) {
    const erc725Version = await this.getErc725YVersion(address);

    if (erc725Version === 'NOT_ERC725') {
      throw new Error(
        `Contract: ${address} does not support ERC725Y interface.`,
      );
    }

    const method =
      erc725Version === 'ERC725' ? Method.GET_DATA : Method.GET_DATA_LEGACY;

    const payload: JsonRpc[] = [];
    for (let index = 0; index < keys.length; index++) {
      payload.push(
        constructJSONRPC(
          address,
          method,
          erc725Version === 'ERC725'
            ? abiCoder.encodeParameter('bytes32[]', [keys[index]])
            : keys[index],
        ),
      );
    }

    const results: any = await this.callContract(payload);

    // map results to keys
    const returnValues: {
      key: string;
      value: Record<string, any> | null;
    }[] = [];
    for (let index = 0; index < payload.length; index++) {
      const decodedValue = decodeResult(
        method,
        results.find((element) => payload[index].id === element.id),
      );

      returnValues.push({
        key: keys[index],
        value: erc725Version === 'ERC725' ? decodedValue[0] : decodedValue,
      });
    }

    return returnValues;
  }

  private async callContract(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      // Send old web3 method with callback to resolve promise
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
