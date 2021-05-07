.. _api-decode-all-data:

==================================================
decodeAllData
==================================================

Decode all data available, as per the schema definition, in the contract.

.. code-block:: javascript

  ERC725.decodeAllData(data);

--------------------------------------------------
Parameters
--------------------------------------------------

* ``data`` - ``Array`` of ``Object``: An array of encoded ``key``:``value`` pairs.

**Returns**

* ``Object``: An object with keys matching the erc725 instance schema keys, with attached decoded data as expected by the schema.

--------------------------------------------------
Example
--------------------------------------------------

.. code-block:: javascript
  
  ERC725.decodeAllData([
      {key:'0xc55da378b3897c7aeec303b4fa7eceb3005a395160399831e4be123082c760da', value:'0x6d792d636f6f6c2d757365726e616d65'},
      {key:'0x4eeb961b158da171122c794adc937981d3b441f1dc5b8f718a207667f992093d', value:'0x41206772656174206465736372697074696f6e2e'},
      {key:'0x1b0084c280dc983f326892fcc88f375797a50d4f792b20b5229caa857474e84e', value:'0x00000...02'} // The length of the array
      {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000000', value:'0x2309f...'} // The 0 element of the array
      {key:'0x1b0084c280dc983f326892fcc88f375700000000000000000000000000000001', value:'0x0fe09...'} // The 1 element of the array
  ]);

--------------------------------------------------
Result
--------------------------------------------------

.. code-block:: javascript

  {
      'Username':'my-cool-username',
      'Description': 'A great description.',
      'IssuedAssets[]': [
          '0x2309f...',
          '0x0fe09...'
      ]
  }

