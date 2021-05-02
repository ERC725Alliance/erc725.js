Providers
##################################################

The provider by which erc725.js will request blockchain data is set on the instantiation of the class, through the configuration object.

Web3
**************************************************

This will use the web3 provider available at web3.providers

.. code-block:: javascript

  import 'Web3' from 'web3'

  const web3local = new Web3(new Web3.providers.HttpProvider("https://rpc.l14.lukso.network"));


Ethereum (Metamask)
**************************************************

This is the provider available at ``window.ethereum`` injected into a compatible web browser from the `Metamask plugin <https://metamask.io/>`_.

.. code-block:: javascript

  const myvar = new ERC725(schema, address, window.ethereum)

Graphql (Apollo)
**************************************************

Currently supported as a graphql provider is the `Apollo client <https://www.apollographql.com/docs/>`_.

.. code-block:: javascript

  const apolloProvider = new ApolloClient({
    uri: 'http://localhost:8080/graphql',
    cache: new InMemoryCache(),
    fetchOptions: {
      mode: 'no-cors'
    }
  })

  const myvar = new ERC725(schema, address, apolloProvider)

.. note::

  Currently the ``link`` memeber of the options object for the Apollo client is not currently, and known to not function correctly.