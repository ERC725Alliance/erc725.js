import { ERC725JSONSchema } from './ERC725JSONSchema';

export interface ERC725Config {
  /**
   * ```js title=Example
   * const config = {
   *   ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
   * };
   * ```
   * Make sure to use the following format: `<url>/ipfs/`.<br/>
   * Another example: `https://cloudflare-ipfs.com/ipfs/`
   */
  ipfsGateway: string;
}

export interface ERC725Options {
  schemas: ERC725JSONSchema[];
  address?: string;
  provider?;
}
