import type { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import LSP1JSONSchema from '../../schemas/LSP1UniversalReceiverDelegate.json';
import LSP3JSONSchema from '../../schemas/LSP3ProfileMetadata.json';
import LSP4JSONSchema from '../../schemas/LSP4DigitalAsset.json';
import LSP4LegacyJSONSchema from '../../schemas/LSP4DigitalAssetLegacy.json';
import LSP5JSONSchema from '../../schemas/LSP5ReceivedAssets.json';
import LSP6JSONSchema from '../../schemas/LSP6KeyManager.json';
import LSP8JSONSchema from '../../schemas/LSP8IdentifiableDigitalAsset.json';
import LSP9JSONSchema from '../../schemas/LSP9Vault.json';
import LSP10JSONSchema from '../../schemas/LSP10ReceivedVaults.json';
import LSP12JSONSchema from '../../schemas/LSP12IssuedAssets.json';
import LSP17JSONSchema from '../../schemas/LSP17ContractExtension.json';

type schemaType = ERC725JSONSchema[];

export const LSP1Schema: schemaType = LSP1JSONSchema as schemaType;
export const LSP3Schema: schemaType = LSP3JSONSchema as schemaType;
export const LSP4Schema: schemaType = LSP4JSONSchema as schemaType;
export const LSP4LegacySchema: schemaType = LSP4LegacyJSONSchema as schemaType;
export const LSP5Schema: schemaType = LSP5JSONSchema as schemaType;
export const LSP6Schema: schemaType = LSP6JSONSchema as schemaType;
export const LSP8Schema: schemaType = LSP8JSONSchema as schemaType;
export const LSP9Schema: schemaType = LSP9JSONSchema as schemaType;
export const LSP10Schema: schemaType = LSP10JSONSchema as schemaType;
export const LSP12Schema: schemaType = LSP12JSONSchema as schemaType;
export const LSP17Schema: schemaType = LSP17JSONSchema as schemaType;

const AllSchemas = LSP1Schema.concat(
  LSP3Schema,
  LSP4Schema,
  LSP4LegacySchema,
  LSP5Schema,
  LSP6Schema,
  LSP8Schema,
  LSP9Schema,
  LSP10Schema,
  LSP12Schema,
  LSP17Schema,
);

export default AllSchemas;
