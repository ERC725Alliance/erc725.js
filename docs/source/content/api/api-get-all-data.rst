.. _api-get-all-data:

==================================================
getAllData
==================================================

Get all available data from the contract as per the class schema definition.

.. code-block:: javascript
  
  erc725.getAllData();

--------------------------------------------------
Returns
--------------------------------------------------

``Promise(Object)``: An object with schema element key names as members, with correspoinding associated decoded data as values.

--------------------------------------------------
Example
--------------------------------------------------

.. code-block:: javascript

  await erc725.getAllData();

  /* >
    {
      "SupportedStandards:ERC725Account": "0xafdeb5d6",
      "LSP3Profile": '{
          url: 'ipfs://QmXybv2LdJWscy1C6yRKUjvnaj6aqKktZX4g4xmz2nyYj2',
          hash: '0xb4f9d72e83bbe7e250ed9ec80332c493b7b3d73e0d72f7b2c7ab01c39216eb1a',
          hashFunction: 'keccak256(utf8)'
      },
      "LSP1UniversalReceiverDelegate": "0xF42227dd9E12B11C003de32D5241822Ec47f3674",
      "LSP3IssuedAssets[]": ['0x2309f...','0x0fe09...', ...]
    }
  */

