import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import LSP1UniversalReceiverDelegate from '../../schemas/LSP1UniversalReceiverDelegate.json';
import LSP3UniversalProfile from '../../schemas/LSP3UniversalProfileMetadata.json';
import LSP4DigitalAssetLegacy from '../../schemas/LSP4DigitalAssetLegacy.json';
import LSP4DigitalAsset from '../../schemas/LSP4DigitalAsset.json';
import LSP5ReceivedAssets from '../../schemas/LSP5ReceivedAssets.json';
import LSP6KeyManager from '../../schemas/LSP6KeyManager.json';

export default LSP1UniversalReceiverDelegate.concat(
  LSP3UniversalProfile,
  LSP4DigitalAssetLegacy,
  LSP4DigitalAsset,
  LSP5ReceivedAssets,
  LSP6KeyManager,
) as ERC725JSONSchema[];
