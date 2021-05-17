.. _api-fetch-data:

fetchData
##################################################

This method will fetch data from IPFS or an HTTP(s) endpoint stored as `'JSONURL', or 'ASSETURL' <https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#asseturl>`_ valueContent type.

.. code-block:: javascript

  await erc725.fetchData(schemaKey [, schemaElement])

--------------------------------------------------
Parameters
--------------------------------------------------

* ``schemaKey`` - ``String``: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

* ``schemaElement`` - ``Object``: (optional) An optional custom schema element to use for decoding the returned value. Overrides attached schema of instance on this call only.

--------------------------------------------------
Returns
--------------------------------------------------

``Promise(Mixed)``: Returns the fetched and decoded value depending 'valueContent' for the schema element, otherwise works like :ref:`api-get-data`.

* ``Object`` if 'valueContent' of schema element is 'JSONURL'
* ``Uint8Array`` if the 'valueContent' of the schema element is 'ASSETURL'

Examples below use schemas from the `LUSKO Network LSP schemas <https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md>`_.

--------------------------------------------------
Example: JSONURL
--------------------------------------------------

.. code-block:: javascript

  await ERC725.fetchData('LSP3Profile')

  /*
  > {
      LSP3Profile: {
          name: 'frozeman',
          description: 'The inventor of ERC725 and ERC20...',
          links: [
              { title: 'Twitter', url: 'https://twitter.com/feindura' },
              { title: 'lukso.network', url: 'https://lukso.network' }
          ],
          profileImage: [
              {
                  width: 1024,
                  height: 974,
                  hashFunction: 'keccak256(bytes)',
                  hash: '0xa9399df007997de92a820c6c2ec1cb2d3f5aa5fc1adf294157de563eba39bb6e',
                  url: 'ifps://QmW4wM4r9yWeY1gUCtt7c6v3ve7Fzdg8CKvTS96NU9Uiwr'
              },
              { ... }
          ],
          backgroundImage: [
              {
                  ...
              }
          ]
      }
  }
  */

--------------------------------------------------
Example: ASSETURL 
--------------------------------------------------

.. code-block:: javascript

  await ERC725.fetchData('KeyWithAssetURL')

  // > Uint8Array([...])
