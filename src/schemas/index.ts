import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import LSP1UniversalReceiverDelegate from '../../schemas/LSP1UniversalReceiverDelegate.json';
import LSP3Profile from '../../schemas/LSP3ProfileMetadata.json';
import LSP4DigitalAssetLegacy from '../../schemas/LSP4DigitalAssetLegacy.json';
import LSP4DigitalAsset from '../../schemas/LSP4DigitalAsset.json';
import LSP5ReceivedAssets from '../../schemas/LSP5ReceivedAssets.json';
import LSP6KeyManager from '../../schemas/LSP6KeyManager.json';
import LSP8IdentifiableDigitalAsset from '../../schemas/LSP8IdentifiableDigitalAsset.json';
import LSP9Vault from '../../schemas/LSP9Vault.json';
import LSP10ReceivedVaults from '../../schemas/LSP10ReceivedVaults.json';
import LSP12IssuedAssets from '../../schemas/LSP12IssuedAssets.json';
import LSP17ContractExtension from '../../schemas/LSP17ContractExtension.json';

export default LSP1UniversalReceiverDelegate.concat(
  LSP3Profile,
  LSP4DigitalAssetLegacy,
  LSP4DigitalAsset,
  LSP5ReceivedAssets,
  LSP6KeyManager,
  LSP8IdentifiableDigitalAsset,
  LSP9Vault,
  LSP10ReceivedVaults,
  LSP12IssuedAssets,
  LSP17ContractExtension,
) as ERC725JSONSchema[];
