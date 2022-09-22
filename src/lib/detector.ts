// https://docs.lukso.tech/standards/standard-detection

import { INTERFACE_IDS_0_7_0 } from '../constants/interfaces';
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';
import { LSPType } from '../types/LSP';

import lsp3Schema from '../../schemas/LSP3UniversalProfileMetadata.json';
import lsp4Schema from '../../schemas/LSP4DigitalAsset.json';
import lsp9Schema from '../../schemas/LSP9Vault.json';

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
  lspType: LSPType,
  provider,
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
    const lspSupportedStandards = await  .fetchData(lsp2Schema.name);
    // @ts-ignore
    return lspSupportedStandards.value === lsp2Schema.valueContent;
  } catch (error) {
    return false;
  }
};

export const detectLSPs = (address: string, provider: any) => {
  return {
    LSP0ERC725Account: true,
    LSP1UniversalReceiver: false,
    LSP1UniversalReceiverDelegate: false,
    LSP6KeyManager: false,
    LSP7DigitalAsset: false,
    LSP8IdentifiableDigitalAsset: false,
    LSP9Vault: false,
  };
};