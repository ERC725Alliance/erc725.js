Encode Data
##################################################

This will talk about encoding all data

encodeData
**************************************************

.. code-block:: javascript

  erc725.encodeData(schemaKey, data)

**Parameters**

* ``schemaKey`` - ``String``: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.
* ``data`` - ``Mixed``:  Data structured according to the corresponding schema defition.

**Returns**

* ``Mixed``: Returns decoded data as defined and expected in the schema (single value for keyTypes 'Singleton' & 'Mapping', or an array of encoded key/value objects for keyType 'Array).

Singleton Example
==================================================

.. code-block:: javascript

    erc725.encodeData('Username', 'my-cool-username')


Singleton Result
--------------------------------------------------

.. code-block:: javascript

    "0x6d792d636f6f6c2d757365726e616d65"

Array Example
==================================================

.. code-block:: javascript

    erc725.encodeData('IssuedAssets[]',
        [
            '0xCC8c556EE154151d0A67b6e7F871fa8C6B263A8D'
        ]
    )

Array Result
--------------------------------------------------

.. code-block:: javascript

    [
        // First element must always be the length
        {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e',value:'0x0000000000000000000000000000000000000000000000000000000000000001'},
        {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000',value:'0xcc8c556ee154151d0a67b6e7f871fa8c6b263a8d'},
    ]

**Update a single item in an existing array**
--------------------------------------------------

The correct index of the element to be replaced must be used or else unecessary writes to the smart contract may be needed to represent a mutated array.

.. code-block:: javascript

    // Get the existing array
    let myAssets = await erc725Account.getData('IssuedAssets[]');

    // Encode the same array to get all array element keys
    let encodedAssets = erc725Account.encodeData('IssuedAssets[]', myAssets);

    // Find the index of the element to replace
    let key = encodedAssets.find
    let index = _.findIndex(myAssets, (asset) => { return asset === assetAddressToReplace; });

    let encodedAssets = erc725Account.encodeData('LSP3IssuedAssets[]', myAssets);

    // Using your contract instance to set the data
