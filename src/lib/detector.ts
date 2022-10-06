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

// https://docs.lukso.tech/standards/standard-detection

/**
 * @file detector.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Felix Hildebrandt <@fhildeb>
 * @date 2022
 */

import {
  AddressProviderOptions,
  INTERFACE_IDS_0_7_0,
} from '../constants/interfaces';
import { LSPSchemaType } from '../constants/schemas';
import { ERC725Options } from '../types/Config';

import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import lsp3Schema from '../../schemas/LSP3UniversalProfileMetadata.json';
import lsp4Schema from '../../schemas/LSP4DigitalAsset.json';
import lsp9Schema from '../../schemas/LSP9Vault.json';

import { getData } from './getData';

/**
 * Check if a smart contract address
 * supports a certain interface.
 *
 * @param {string} interfaceId  Interface ID or supported interface name.
 * @param options Object with address and RPC URL.
 * @returns {Promise<boolean>} if interface is supported.
 */
export const supportsInterface = async (
  interfaceIdOrName: string,
  options: AddressProviderOptions,
): Promise<boolean> => {
  let plainInterfaceId: string;
  if (INTERFACE_IDS_0_7_0[interfaceIdOrName]) {
    plainInterfaceId = INTERFACE_IDS_0_7_0[interfaceIdOrName];
  } else {
    plainInterfaceId = interfaceIdOrName;
  }

  try {
    return await options.provider.supportsInterface(
      options.address,
      plainInterfaceId,
    );
  } catch (error) {
    throw new Error(`Error checking the interface: ${error}`);
  }
};

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
      return schema.name.startsWith('SupportedStandards:');
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
 * Check if the key value store of the smart
 * contract supports a certain schema.
 *
 * @param schemaKey Schema key or supported schema name
 * @param schemaOptions Object with address and provider
 * @param schema ERC725JSONSchema of the key
 */
export const supportsSchema = async (
  schemaKeyOrName: string,
  schemaOptions: AddressProviderOptions,
  schema?: ERC725JSONSchema,
): Promise<boolean> => {
  const erc725Options: ERC725Options = {
    // @ts-ignore schema can be null here, since we check later (knownSchema)
    schemas: [schema],
    address: schemaOptions.address,
    provider: schemaOptions.provider,
  };

  let plainSchemaName = '';
  let knownSchema: ERC725JSONSchema;

  // If full schema name was used, trim down
  if (schemaKeyOrName.startsWith('SupportedStandards:')) {
    plainSchemaName = schemaKeyOrName.substring(19);
  } else {
    plainSchemaName = schemaKeyOrName;
  }

  // Look if there is a key to the schema name
  let plainSchemaKey: string;
  if (lspSchemaOptions[plainSchemaName].schema.key) {
    plainSchemaKey = lspSchemaOptions[plainSchemaName].schema.key;
  } else {
    plainSchemaKey = schemaKeyOrName;
  }

  if (!schema) {
    if (lspSchemaOptions[plainSchemaName].schema) {
      knownSchema = lspSchemaOptions[plainSchemaName].schema;
      erc725Options.schemas = [knownSchema];
    } else {
      throw new Error(
        `There is no default schema for schemaKeyOrName: ${schemaKeyOrName}. Please provide one within the options parameter.`,
      );
    }

    try {
      const schemaContents = await getData(erc725Options, plainSchemaKey);

      if (!schema) {
        // @ts-ignore .value does exist on getData return value
        return schemaContents.value === knownSchema.valueContent;
      }
      // @ts-ignore .value does exist on getData return value
      return schemaContents.value === schema.valueContent;
    } catch (error) {
      throw new Error(`Error checking the schema: ${error}`);
    }
  }
  return false;
};
