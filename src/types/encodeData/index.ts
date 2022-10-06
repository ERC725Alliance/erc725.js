import { SUPPORTED_HASH_FUNCTIONS } from '../../constants/constants';

export interface AssetURLEncode {
  hashFunction: SUPPORTED_HASH_FUNCTIONS;
  hash: string;
  url: string;
}
