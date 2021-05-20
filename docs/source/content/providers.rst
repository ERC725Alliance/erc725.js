.. _providers:

==================================================
Providers
==================================================

The provider by which erc725.js will request blockchain data is set on the instantiation of the class, through the configuration object.

The following provider types are supported:

--------------------------------------------------
Web3
--------------------------------------------------

This will use the web3 provider available at web3.providers

.. code-block:: javascript

  import Web3 from 'web3'

  const web3provider = new Web3(new Web3.providers.HttpProvider('https://rpc.l14.lukso.network'));

--------------------------------------------------
Ethereum (Metamask)
--------------------------------------------------

This is the provider available at ``window.ethereum`` injected into a compatible web browser from the `Metamask plugin <https://metamask.io/>`_.

.. code-block:: javascript

  const ethereumProvider = window.ethereum;

--------------------------------------------------
Graphql (Apollo)
--------------------------------------------------

Also supported is a `GraphQL client <https://www.apollographql.com/docs/>`_ as the provider.

.. code-block:: javascript

  import { ApolloClient, InMemoryCache } from '@apollo/client';

  const apolloProvider = new ApolloClient({
    uri: 'http://localhost:8080/graphql',
    cache: new InMemoryCache(),
    fetchOptions: {
      mode: 'no-cors'
    }
  });

  // NOTE: The apollo provider *must* be passed as a member of an object along
  // with a type member when creating a new instance of the ERC725 class.
  const providerParam = {
      provider: apolloProvider,
      type: 'ApolloClient'
  }

.. note::

  Currently the ``link`` memeber of the options object for the Apollo client is not supported, and known to not function correctly.