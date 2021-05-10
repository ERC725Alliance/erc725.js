.. _api-decode-data:

decodeData
==================================================

Decode data from contract store.

.. code-block:: javascript

  ERC725.decodeData(schemaKey, data);

Parameters
--------------------------------------------------

* ``schemaKey`` - ``String``: Either the schema element name or key.
* ``data`` - ``Ojbect`` or ``Object[]``: Either a single object, or an array of objects of key: value: pairs.
* ``customSchema`` - ``Object`` (optional): An optional schema to override default schema of ERC725 class instance.

Returns
--------------------------------------------------

``Mixed``: Returns decoded data as defined and expected in the schema:

* A single value (``String`` or ``Object``) for schema keyTypes 'Singleton' & 'Mapping'.
* An array of values (``String`` or ``Object``) for schema keyType 'Array'.

Singleton Example
--------------------------------------------------

.. code-block:: javascript

  ERC725.decodeData('Username', {key:'key value pair object', value:''});

  // > 'my-cool-username'

Array Example
--------------------------------------------------

.. code-block:: javascript

  ERC725.decodeData('Nicknames[]', [
    {key:'0x9cbb604dc999607e6b9fcae1affc083f71909d3a5ca3bcf37e75c79c7178adc5', value:'0x0000000000000000000000000000000000000000000000000000000000000002'}, // Array length
    {key:'0x9cbb604dc999607e6b9fcae1affc083f00000000000000000000000000000000', value:'0x636f6f6c2d6e69636b'},
    {key:'0x9cbb604dc999607e6b9fcae1affc083f00000000000000000000000000000001', value:'0x636f6f6c2d6e61636b'},
  ]);

  /* > 
    [
      'cool-nick',
      'cool-nack'
    ]
  */

