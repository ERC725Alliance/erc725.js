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
 * @file lib/getDataFromExternalSources.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
 * @author Reto Ryter <@rryter>
 * @date 2021
 */

import {
  DecodeDataOutput,
  GetDataExternalSourcesOutput,
} from '../types/decodeData';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { isDataAuthentic, patchIPFSUrlsIfApplicable } from './utils';
import { URLDataWithHash } from '../types';

export const getDataFromExternalSources = (
  schemas: ERC725JSONSchema[],
  dataFromChain: DecodeDataOutput[],
  ipfsGateway: string,
  throwException = true,
): Promise<GetDataExternalSourcesOutput[]> => {
  const promises = dataFromChain.map(async (dataEntry) => {
    const schemaElement = schemas.find(
      (schema) => schema.key === dataEntry.key,
    );

    if (!schemaElement) {
      // It is weird if we can't find the schema element for the key...
      // Let's simply ignore and return it...
      return dataEntry;
    }

    if (
      !['jsonurl', 'asseturl', 'verifiableuri'].includes(
        schemaElement.valueContent.toLowerCase(),
      )
    ) {
      return dataEntry;
    }

    try {
      // At this stage, value should be of type jsonurl, verifiableuri or asseturl
      if (typeof dataEntry.value === 'string') {
        throw new Error(
          `Value of key: ${dataEntry.name} (${dataEntry.value}) is string but valueContent is: ${schemaElement.valueContent}. Expected type should be object with url key.`,
        );
      }

      if (!dataEntry.value) {
        throw new Error(`Value of key: ${dataEntry.name} is empty`);
      }

      if (Array.isArray(dataEntry.value)) {
        throw new Error(
          `Value of key: ${dataEntry.name} (${dataEntry.value}) is string[] but valueContent is: ${schemaElement.valueContent}. Expected type should be object with url key.`,
        );
      }

      const urlDataWithHash: URLDataWithHash =
        dataEntry.value as URLDataWithHash; // Type URLDataWithHash

      let receivedData;
      const { url } = patchIPFSUrlsIfApplicable(
        urlDataWithHash as URLDataWithHash,
        ipfsGateway,
      );
      try {
        receivedData = await fetch(url).then(async (response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          // Previously we used to return a Uint8Array in the case of a verification
          // method of 'keccak256(bytes)' but since this is a JSONURL or VerifiableURI,
          // all data has to be json for sure.
          return response.json();
        });
        if (isDataAuthentic(receivedData, urlDataWithHash.verification)) {
          return { ...dataEntry, value: receivedData };
        }
        console.log(receivedData, urlDataWithHash.verification);
        throw new Error('result did not correctly validate');
      } catch (error: any) {
        error.message = `GET request to ${urlDataWithHash.url} (resolved as ${url}) failed: ${error.message}`;
        throw error;
      }
    } catch (error: any) {
      error.message = `Value of key: ${dataEntry.name} has an error: ${error.message}`;
      if (throwException) {
        throw error;
      }
      console.error(error);
    }
    // Invalid data
    return { ...dataEntry, value: null };
  });

  return Promise.all(promises);
};
