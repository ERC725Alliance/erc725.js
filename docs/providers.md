---
sidebar_position: 3
---

# Providers

The provider by which `@erc725/erc725.js` will request blockchain data is set on the instantiation of the class through the configuration object.

The following provider types are supported:

## Web3

The following code snippet will use the web3 provider available at web3.providers from the corresponding `web3` library.

```javascript
import Web3 from 'web3';

const web3provider = new Web3(
  new Web3.providers.HttpProvider('https://rpc.l14.lukso.network'),
);
```

## Ethereum (MetaMask)

The following code snippet will use the web3 provider available at web3.providers from the corresponding `web3` library.

```javascript
const ethereumProvider = window.ethereum;
```
