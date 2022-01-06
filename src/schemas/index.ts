import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

import LSP3UniversalProfile from './LSP3UniversalProfile.json';
import LSP4DigitalAsset from './LSP4DigitalAsset.json';
import LSP5ReceivedAssets from './LSP5ReceivedAssets.json';
import LSP6KeyManager from './LSP6KeyManager.json';

export default LSP3UniversalProfile.concat(
  LSP4DigitalAsset,
  LSP5ReceivedAssets,
  LSP6KeyManager,
) as ERC725JSONSchema[];
