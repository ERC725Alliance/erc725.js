---
sidebar_position: 1.3
---

# Providers

The provider by which `@erc725/erc725.js` will request blockchain data is set on
the instantiation of the class, through the configuration object.

The following provider types are supported:

## Web3

This will use the web3 provider available at web3.providers

```javascript
import Web3 from 'web3';

const web3provider = new Web3(
  new Web3.providers.HttpProvider('https://rpc.l14.lukso.network'),
);
```

## Ethereum (MetaMask)

This is the provider available at `window.ethereum` injected into a
compatible web browser from the [Metamask plugin](https://metamask.io/).

```javascript
const ethereumProvider = window.ethereum;
```
