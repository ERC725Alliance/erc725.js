// https://docs.lukso.tech/standards/standard-detection

/**
 * @file detector.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Felix Hildebrandt <@fhildeb>
 * @date 2022
 */
import { isValidAddress } from 'ethereumjs-util';

import { INTERFACE_IDS_0_7_0 } from '../constants/interfaces';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { LSPType } from '../types/LSP';

import lsp3Schema from '../../schemas/LSP3UniversalProfileMetadata.json';
import lsp4Schema from '../../schemas/LSP4DigitalAsset.json';
import lsp9Schema from '../../schemas/LSP9Vault.json';
import { getData } from './getData';

interface LSPTypeOptions {
  interfaceId?: string; // EIP-165
  lsp2Schema?: ERC725JSONSchema | null;
}

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

const lspTypeOptions: Record<LSPType, LSPTypeOptions> = {
  [LSPType.LSP0ERC725Account]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP0ERC725Account,
  },
  [LSPType.LSP1UniversalReceiver]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP1UniversalReceiver,
  },
  [LSPType.LSP1UniversalReceiverDelegate]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP1UniversalReceiverDelegate,
  },
  [LSPType.LSP3UniversalProfile]: {
    lsp2Schema: getSupportedStandardSchema(lsp3Schema as ERC725JSONSchema[]),
  },
  [LSPType.LSP4DigitalAssetMetadata]: {
    lsp2Schema: getSupportedStandardSchema(lsp4Schema as ERC725JSONSchema[]),
  },
  [LSPType.LSP6KeyManager]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP6KeyManager,
  },
  [LSPType.LSP7DigitalAsset]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP7DigitalAsset,
  },
  [LSPType.LSP8IdentifiableDigitalAsset]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP8IdentifiableDigitalAsset,
  },
  [LSPType.LSP9Vault]: {
    interfaceId: INTERFACE_IDS_0_7_0.LSP9Vault,
    lsp2Schema: getSupportedStandardSchema(lsp9Schema as ERC725JSONSchema[]),
  },
};

/**
 * Checks if the ERC725 object has the interface ID and/or
 * schema key of the provided LSP type.
 *
 * @param lspType Name of the LSP
 * @returns Boolean
 */
const checkInterfaceIdAndLsp2Key = async (
  address: string,
  provider: any,
  lspType: LSPType,
) => {
  const { interfaceId, lsp2Schema } = lspTypeOptions[lspType];

  // ERC-1271 Detection
  let hasValidInterfaceId = false;
  if (interfaceId) {
    try {
      hasValidInterfaceId = await provider.supportsInterface(
        address,
        interfaceId,
      );
    } catch (err) {
      return false;
    }
  }

  // LSP2 Key Detection
  if (!lsp2Schema) {
    return hasValidInterfaceId;
  }

  try {
    const lspSupportedStandards = await getData(
      { provider, schemas: [lsp2Schema], address },
      lsp2Schema.name,
    );
    // @ts-ignore
    return lspSupportedStandards.value === lsp2Schema.valueContent;
  } catch (error) {
    return false;
  }
};

/**
 * Detect all LSPs the ERC725 Object or
 * smart contract address implements
 *
 * @param address address to check against LSP standards
 * @param provider blockchain provider to call
 * @returns JSON Object with booleans for each LSP
 */
export const detectLSPs = async (address: string, provider: any) => {
  if (!isValidAddress(address)) {
    throw new Error(`Address: ${address} is not a valid address`);
  }

  // TODO: Use Promise.all

  const lspMap: Record<LSPType, boolean> | Record<string, never> = Object.keys(
    lspTypeOptions,
  ).reduce(async (acc, lspKey) => {
    return {
      ...acc,
      [lspKey]: await checkInterfaceIdAndLsp2Key(
        address,
        provider,
        lspTypeOptions[lspKey],
      ),
    };
  }, {});

  return lspMap as Record<LSPType, boolean>;
};
