.. _api-encode-all-data:

==================================================
encodeAll Data
==================================================

This will talk about encoding all data

.. code-block:: javascript

    ERC725.encodeAllData(data);

--------------------------------------------------
Parameters
--------------------------------------------------

* ``data`` - ``Object``: An object of keys matching to corresponding schema element names, with associated data.

--------------------------------------------------
Returns
--------------------------------------------------

``Array``: An array of objects of key value pairs.

--------------------------------------------------
Example
--------------------------------------------------

.. code-block:: javascript

    ERC725.encodeAllData({
        'Username':'my-cool-username',
        'Description': 'A great description.',
        'IssuedAssets[]': [
            '0x2309f...',
            '0x0fe09...'
        ]
    });


    /* > 
    [
        {key:'0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da', value:'0x6d792d636f6f6c2d757365726e616d65'},
        {key:'0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d', value:'0x41206772656174206465736372697074696f6e2e'},
        {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e', value:'0x00000...02'} // The length of the array
        {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000', value:'0x2309f...'} // The element of the array at index 0
        {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000001', value:'0x0fe09...'} // The element of the array at index 1
    ]
    */
