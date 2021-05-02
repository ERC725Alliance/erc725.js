Decode Data
##################################################

This will talk about decoding a single field of data


decodeData
**************************************************

.. code-block:: javascript

  erc725.decodeData(schemaKey, data)


**Parameters**

* ``schemaKey`` - ``String``: The name (or the encoded name as the schema 'key') of the schema element in the class instance's schema.

* ``data`` - ``Mixed``: Either the single value to be decoded for 'Singleton' or 'Mapping' keyTypes, or an array of key/value (``[{key:'0x04f9u0weuf...',value:'0x0f3209fj...'}]`` pairs if the schema ``keyType`` is 'Array'.

**Returns**

* ``Mixed``: Returns decoded data as defined and expected in the schema (single value for keyTypes 'Singleton' & 'Mapping', or an array of values keyType 'Array).

**Example**

.. code-block:: javascript

  erc725.decodeData('UsernameKey', '0x6d792d636f6f6c2d757365726e616d65')

  // returns > 'my-cool-username'
