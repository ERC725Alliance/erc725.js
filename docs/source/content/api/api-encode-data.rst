.. _api-encode-data:

==================================================
encodeData
==================================================

Encode data according to schema.

.. code-block:: javascript

  ERC725.encodeData(schemaKey, data);

--------------------------------------------------
Parameters
--------------------------------------------------

* ``schemaKey`` - ``String``: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.
* ``data`` - ``Mixed``:  Data structured according to the corresponding schema defition.

--------------------------------------------------
Returns
--------------------------------------------------

``Mixed``: Returns decoded data as defined and expected in the schema (single value for keyTypes 'Singleton' & 'Mapping', or an array of encoded key/value objects for keyType 'Array).

--------------------------------------------------
Example: Singleton
--------------------------------------------------

.. code-block:: javascript

    ERC725.encodeData('Username', 'my-cool-username');


    // > "0x6d792d636f6f6c2d757365726e616d65"

--------------------------------------------------
Example: Array
--------------------------------------------------

.. code-block:: javascript

    ERC725.encodeData('IssuedAssets[]',
        [
            '0xCC8c556EE154151d0A67b6e7F871fa8C6B263A8D'
        ]
    );


    /* >
        [
            // First element must always be the length
            {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e',value:'0x0000000000000000000000000000000000000000000000000000000000000001'},
            {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000',value:'0xcc8c556ee154151d0a67b6e7f871fa8c6b263a8d'},
        ]
    */


--------------------------------------------------
Example: Update a single item in an existing array
--------------------------------------------------

The correct index of the element to be replaced must be used to avoid uncessessary writes to the smart contract for an unecessarily mutated array.

.. code-block:: javascript

    const myKey = '0x9fe...'; // As required by application.

    // Get the existing array
    const myAssets = await ERC725.getData('IssuedAssets[]');

    // Encode the same array to get all array element keys
    const encodedAssets = ERC725.encodeData('IssuedAssets[]', myAssets);

    // Find the index of the element to replace
    const key = encodedAssets.find(e => e === myKey);
    const index = _.findIndex(myAssets, (asset) => { return asset === assetAddressToReplace; });

    const newEncodedAssets = ERC725.encodeData('LSP3IssuedAssets[]', myAssets);

You can then choose the correct index key and corresponding value to update the element(s) you wish to when you :ref:`write data <writing-data>` to the blockchain. 
