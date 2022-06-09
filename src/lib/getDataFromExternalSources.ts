import {
  DecodeDataOutput,
  GetDataExternalSourcesOutput,
} from '../types/decodeData';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import {
  SUPPORTED_HASH_FUNCTIONS,
  SUPPORTED_HASH_FUNCTION_STRINGS,
} from './constants';
import { isDataAuthentic, patchIPFSUrlsIfApplicable } from './utils';

export const getDataFromExternalSources = (
  schemas: ERC725JSONSchema[],
  dataFromChain: DecodeDataOutput[],
  ipfsGateway: string,
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
      !['jsonurl', 'asseturl'].includes(
        schemaElement.valueContent.toLowerCase(),
      )
    ) {
      return dataEntry;
    }

    // At this stage, value should be of type jsonurl or asseturl
    if (typeof dataEntry.value === 'string') {
      console.error(
        `Value of key: ${dataEntry.name} (${dataEntry.value}) is string but valueContent is: ${schemaElement.valueContent}. Expected type should be object with url key.`,
      );
      return dataEntry;
    }

    if (!dataEntry.value) {
      return dataEntry;
    }

    if (Array.isArray(dataEntry.value)) {
      console.error(
        `Value of key: ${dataEntry.name} (${dataEntry.value}) is string[] but valueContent is: ${schemaElement.valueContent}. Expected type should be object with url key.`,
      );
      return dataEntry;
    }

    const urlDataWithHash = dataEntry.value; // Type URLDataWithHash

    let receivedData;
    try {
      const { url } = patchIPFSUrlsIfApplicable(urlDataWithHash, ipfsGateway);

      receivedData = await fetch(url).then(async (response) => {
        if (
          urlDataWithHash.hashFunction ===
          SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_BYTES
        ) {
          return response
            .arrayBuffer()
            .then((buffer) => new Uint8Array(buffer));
        }

        return response.json();
      });
    } catch (error) {
      console.error(error, `GET request to ${urlDataWithHash.url} failed`);
      throw error;
    }

    return isDataAuthentic(
      receivedData,
      urlDataWithHash.hash,
      urlDataWithHash.hashFunction as SUPPORTED_HASH_FUNCTIONS,
    )
      ? { ...dataEntry, value: receivedData }
      : { ...dataEntry, value: null };
  });

  return Promise.all(promises);
};
