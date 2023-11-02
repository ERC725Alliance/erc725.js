import { SUPPORTED_VERIFICATION_FUNCTIONS } from '../../constants/constants';

export interface AssetURLEncode {
  verificationFunction: SUPPORTED_VERIFICATION_FUNCTIONS;
  verificationData: string;
  url: string;
}
