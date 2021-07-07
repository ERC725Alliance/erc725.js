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
    ipfsGateway: string
}
