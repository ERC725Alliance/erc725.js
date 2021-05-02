Writing Data
############


How to use ERC725.js to write data...


Arrays expect to be set with lengths. And the object needed to encode is an array with minimum two keys. the full schema name key is the length.
You can pass an array if the schame keyType is array.

Put an example of replacing a single element of an array here? Make sure to `see how: <api-encode-data>`_.

Send Data to blockchain
-----------------------

.. code-block:: javascript

  await Account.methods.setData(
      encodedAssets[index + 1].key, // + 1 as encodedAssets[0] is the key for the array length 
      newAssetAddress // to remove set to "0x"
  ).send({...});