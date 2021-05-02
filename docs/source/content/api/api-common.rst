Common assumptions
##################################################

The API documentation will generally assume the following schema for examples unless otherwise specified.

Reference Schema
--------------------------------------------------

.. code-block:: javascript

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
            name: 'IssuedAssets[]',
            key: '0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e'
            keyType: 'Array',
            valueContent: 'Address',
            valueType: 'bytes'
        }
    ]

include:: ./api/api-encode-data.rst
include:: ./api/api-decode-all-data
include:: ./api/api-decode-data
include:: ./api/api-encode-all-data
include:: ./api/api-encode-data
include:: ./api/api-fetch-data
include:: ./api/api-get-owner