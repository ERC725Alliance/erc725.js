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

## Ethereum (Metamask)

This is the provider available at `window.ethereum` injected into a
compatible web browser from the [Metamask plugin](https://metamask.io/).

```javascript
const ethereumProvider = window.ethereum;
```

## Graphql (Apollo)

Also supported is a [GraphQL
client](https://www.apollographql.com/docs/) as the provider.

:::tip
The provider is located in an external package to avoid having a dependency to `graphql` by default.
:::

## Installation

`npm i @erc725/provider-wrappers @apollo/client`

## Usage

```javascript
import { GraphProviderWrapper } from '@erc725/provider-wrappers';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const apolloProvider = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors',
  },
});

const provider = new GraphProviderWrapper(apolloClient);
```

:::info Note
Currently the `link` property of the options object for the Apollo client
is not supported, and known to not function correctly.
:::
