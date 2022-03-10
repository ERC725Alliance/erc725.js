// This file contains the mock providers used for tests

import AbiCoder from 'web3-eth-abi';

import { METHODS } from '../src/lib/constants';
import { Method } from '../src/types/Method';

interface HttpProviderPayload {
  jsonrpc: '2.0';
  method: string;
  params: Array<{
    to: string;
    gas: string;
    gasPrice: string;
    value: string;
    data: string;
  }>;
  id: number;
}

// @ts-ignore
const abiCoder: AbiCoder.AbiCoder = AbiCoder;

const IS_VALID_SIGNATURE_RESPONSE = {
  valid: '0x1626ba7e00000000000000000000000000000000000000000000000000000000',
  notValid:
    '0xffffffff00000000000000000000000000000000000000000000000000000000',
};

export class HttpProvider {
  public returnData: { key: string; value: string }[];
  public supportsInterfaces: string[];
  public isValidSignature: boolean;

  constructor(
    props: { returnData: { key: string; value: string }[] },
    supportsInterfaces: string[],
    isValidSignature?: boolean, // to mock isValidSignature call. If set to true, will return magic value.
  ) {
    // clone array
    this.returnData = [...props.returnData];
    this.supportsInterfaces = supportsInterfaces;
    this.isValidSignature = !!isValidSignature;
  }

  send(payload: HttpProviderPayload | HttpProviderPayload[], cb) {
    if (Array.isArray(payload)) {
      const results: {
        jsonrpc: '2.0';
        id: number;
        result?: string;
        error?: { code: number; message: string; data: string };
      }[] = [];
      for (let index = 0; index < payload.length; index++) {
        const methodSignature = payload[index].params[0].data.substr(0, 10);

        switch (methodSignature) {
          case METHODS[Method.SUPPORTS_INTERFACE].sig:
            throw new Error(
              'Mock of support interface not supported in array mode',
            );

          case METHODS[Method.GET_DATA_LEGACY].sig:
            // The legacy method does not support "multi" mode
            {
              const foundResult = this.returnData.find((element) => {
                // get call param (key)
                const keyParam =
                  '0x' + payload[index].params[0].data.substr(10);
                return element.key === keyParam;
              });

              results.push({
                jsonrpc: '2.0',
                id: payload[index].id,
                result: foundResult ? foundResult.value : '0x',
              });
            }
            break;
          case METHODS[Method.IS_VALID_SIGNATURE].sig: {
            results.push({
              jsonrpc: '2.0',
              id: payload[index].id,
              result: this.isValidSignature
                ? IS_VALID_SIGNATURE_RESPONSE.valid
                : IS_VALID_SIGNATURE_RESPONSE.notValid,
            });
            break;
          }
          case METHODS[Method.GET_DATA].sig:
            // The new ERC725Y allows requesting multiple items in one call
            // getData([A]), getData([A, B, C])...
            //
            {
              const requestedKeys = abiCoder.decodeParameter(
                'bytes32[]',
                payload[index].params[0].data.substr(10),
              );

              const decodedResult = requestedKeys.map((requestedKey) => {
                const foundElement = this.returnData.find((element) => {
                  return element.key === requestedKey;
                });
                return foundElement
                  ? abiCoder.decodeParameter('bytes[]', foundElement.value)[0] // we need to decode the keys as the values provided to the mock are already bytes[] encoded (as it was made for "single item" request mode)
                  : '0x';
              });

              results.push({
                jsonrpc: '2.0',
                id: payload[index].id,
                result: abiCoder.encodeParameter('bytes[]', decodedResult),
              });
            }
            break;
          default:
            throw new Error(
              `Method signature: ${methodSignature} mock is not supported in HttpProvider mock [array mode]`,
            );
        }
      }

      setTimeout(() => cb(null, results), 10);
    } else {
      let result: string;

      const methodSignature = payload.params[0].data.substr(0, 10);

      switch (methodSignature) {
        case METHODS[Method.SUPPORTS_INTERFACE].sig:
          {
            const requestedInterface = `0x${payload.params[0].data.substr(
              10,
              8,
            )}`;
            if (this.supportsInterfaces.includes(requestedInterface)) {
              result =
                '0x0000000000000000000000000000000000000000000000000000000000000001';
            } else {
              result =
                '0x0000000000000000000000000000000000000000000000000000000000000000';
            }
          }
          break;
        case METHODS[Method.GET_DATA_LEGACY].sig:
          {
            const keyParam = '0x' + payload.params[0].data.substr(10);
            const foundResult = this.returnData.find((e) => e.key === keyParam);
            result = foundResult ? foundResult.value : '0x';
          }
          break;
        case METHODS[Method.GET_DATA].sig:
          {
            const keyParam = '0x' + payload.params[0].data.substr(138);
            const foundResult = this.returnData.find((e) => e.key === keyParam);
            result = foundResult ? foundResult.value : '0x';
          }
          break;
        default:
          throw new Error(
            `Method signature: ${methodSignature} mock is not supported in HttpProvider mock [not array mode]`,
          );
      }

      setTimeout(
        () =>
          cb(null, {
            jsonrpc: '2.0',
            result,
          }),
        10,
      );
    }
  }
}

interface EthereumProviderPayload {
  method: string;
  params: Array<{
    to: string;
    gas: string;
    gasPrice: string;
    value: string;
    data: string;
  }>;
}

export class EthereumProvider {
  public returnData;
  public supportsInterfaces: string[];
  public isValidSignature: boolean;

  constructor(
    props: { returnData: { key: string; value: string }[] },
    supportsInterfaces: string[],
    isValidSignature?: boolean, // to mock isValidSignature call. If set to true, will return magic value.
  ) {
    // Deconstruct to create local copy of array
    this.returnData = [...props.returnData];
    this.supportsInterfaces = supportsInterfaces;
    this.isValidSignature = !!isValidSignature;
  }

  request(payload: EthereumProviderPayload) {
    let result: string;

    const methodSignature = payload.params[0].data.substr(0, 10);

    switch (methodSignature) {
      case METHODS[Method.SUPPORTS_INTERFACE].sig:
        {
          const requestedInterface = `0x${payload.params[0].data.substr(
            10,
            8,
          )}`;
          if (this.supportsInterfaces.includes(requestedInterface)) {
            result =
              '0x0000000000000000000000000000000000000000000000000000000000000001';
          } else {
            result =
              '0x0000000000000000000000000000000000000000000000000000000000000000';
          }
        }
        break;
      case METHODS[Method.GET_DATA_LEGACY].sig:
        {
          const keyParam = '0x' + payload.params[0].data.substr(10);

          result = this.returnData.find((e) => e.key === keyParam)?.value;
        }
        break;
      case METHODS[Method.IS_VALID_SIGNATURE].sig:
        result = this.isValidSignature
          ? IS_VALID_SIGNATURE_RESPONSE.valid
          : IS_VALID_SIGNATURE_RESPONSE.notValid;
        break;
      case METHODS[Method.GET_DATA].sig:
        {
          // Duplicated logic with HttpProvider
          const requestedKeys = abiCoder.decodeParameter(
            'bytes32[]',
            payload.params[0].data.substr(10),
          );

          const decodedResult = requestedKeys.map((requestedKey) => {
            const foundElement = this.returnData.find((element) => {
              return element.key === requestedKey;
            });
            return foundElement
              ? abiCoder.decodeParameter('bytes[]', foundElement.value)[0] // we need to decode the keys as the values provided to the mock are already bytes[] encoded (as it was made for "single item" request mode)
              : '0x';
          });

          result = abiCoder.encodeParameter('bytes[]', decodedResult);
        }
        break;
      default:
        throw new Error(
          `Method signature: ${methodSignature} is not supported in EthereumProvider mock`,
        );
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // TODO: Handle reject
        resolve(result);
      }, 50);
    });
  }
}
