// https://docs.lukso.tech/standards/standard-detection

/**
 * @file detector.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Felix Hildebrandt <@fhildeb>
 * @date 2022
 */

import {
  addressProviderOption,
  INTERFACE_IDS_0_7_0,
} from '../constants/interfaces';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import lsp3Schema from '../../schemas/LSP3UniversalProfileMetadata.json';
import lsp4Schema from '../../schemas/LSP4DigitalAsset.json';
import lsp9Schema from '../../schemas/LSP9Vault.json';
import { getData } from './getData';
import { ERC725Options } from '../types/Config';
import { LSPSchemaType } from '../constants/schemas';

/**
 * Find the SupportedStandard schema object
 * out of all supported schema objects of the LSP.
 *
 * @param schemas Array of LSP schemas
 * @returns SupportedStandard schema
 */
const getSupportedStandardSchema = (schemas: ERC725JSONSchema[]) => {
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
};

const lspSchemaOptions: Record<LSPSchemaType, any> = {
  [LSPSchemaType.LSP3UniversalProfile]: {
    schema: getSupportedStandardSchema(lsp3Schema as ERC725JSONSchema[]),
  },
  [LSPSchemaType.LSP4DigitalAssetMetadata]: {
    schema: getSupportedStandardSchema(lsp4Schema as ERC725JSONSchema[]),
  },
  [LSPSchemaType.LSP9Vault]: {
    schema: getSupportedStandardSchema(lsp9Schema as ERC725JSONSchema[]),
  },
};

/**
 * Check if the smart contract address
 * supports a certain interface.
 *
 * @param interfaceId Interface ID or supported interface name
 * @param interfaceOptions Object with address and provider
 * @returns Boolean if interface is supported
 */
export const supportsInterface = async (
  interfaceIdOrName: string,
  interfaceOptions: addressProviderOption,
) => {
  // @ts-ignore
  let plainInterfaceId = INTERFACE_IDS_0_7_0[interfaceId];
  if (!plainInterfaceId) {
    plainInterfaceId = interfaceIdOrName;
  }

  try {
    return await interfaceOptions.provider.supportsInterface(
      interfaceOptions.address,
      plainInterfaceId,
    );
  } catch (err) {
    return false;
  }
};

/**
 * Check if the key value store of the smart
 * contract supports a certain schema.
 *
 * @param schemaKey Schema key or supported schema name
 * @param schemaOptions Object with address and provider
 * @param schema ERC725JSONSchema of the key
 */
export const supportsSchema = async (
  schemaKeyOrName: string,
  schemaOptions: addressProviderOption,
  schema?: ERC725JSONSchema,
) => {
  try {
    const erc725Options: ERC725Options = {
      // @ts-ignore
      schemas: [schema],
      address: schemaOptions.address,
      provider: schemaOptions.provider,
    };

    let plainSchemaName = '';
    let knownSchema: ERC725JSONSchema;

    // If full schema name was used, trim down
    if (schemaKeyOrName.startsWith('SupportedStandard:')) {
      plainSchemaName = schemaKeyOrName.substring(18);
    } else {
      plainSchemaName = schemaKeyOrName;
    }

    // Look if
    let plainSchemaKey = lspSchemaOptions[plainSchemaName].schema.key;

    // If
    if (!plainSchemaKey) {
      plainSchemaKey = schemaKeyOrName;
    }

    if (!schema) {
      knownSchema = lspSchemaOptions[plainSchemaName].schema;
      if (!knownSchema) {
        throw new Error(
          `There is no default schema for schemaKeyOrName: ${plainSchemaKey}. Please provide one.`,
        );
      }
    }

    const schemaContents = await getData(erc725Options, plainSchemaKey);

    if (!schema) {
      // @ts-ignore
      return schemaContents.value === knownSchema.valueContent;
    }
    // @ts-ignore
    return schemaContents.value === schema.valueContent;
  } catch (error) {
    return false;
  }
};
