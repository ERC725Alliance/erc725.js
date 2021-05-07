.. _api-common:

==================================================
Common assumptions
==================================================

The API documentation will generally assume the following code for examples where referenced.

--------------------------------------------------
Reference Code
--------------------------------------------------

.. code-block:: javascript

    import ERC725, { utils } from 'erc725.js'

    // In these documentation each 'field' defintiion is referred to as a 'schema element'
    const schema = [
        {
            name: 'Username',
            key: '0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da'
            keyType: 'Singleton',
            valueContent: 'String',
            valueType: 'string'
        },
        {
            name: 'Description',
            key: '0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d'
            keyType: 'Singleton',
            valueContent: 'String',
            valueType: 'string'
        },
        {
            name: 'Nicknames[]',
            key: '0x9cbb604dc999607e6b9fcae1affc083f71909d3a5ca3bcf37e75c79c7178adc5'
            keyType: 'Array',
            valueContent: 'String',
            valueType: 'string'
        },
        {
            name: 'IssuedAssets[]',
            key: '0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e'
            keyType: 'Array',
            valueContent: 'Address',
            valueType: 'bytes'
        }
    ]

    // const provider = ...

    // const address = ...

    const ERC725 = new ERC725(schema, address, provider);

For information about undefined above see :ref:`providers <providers>`.