import { SUPPORTED_HASH_FUNCTIONS } from '../../lib/constants';

export interface AssetURLEncode {
  hashFunction: SUPPORTED_HASH_FUNCTIONS;
  hash: string;
  url: string;
}
