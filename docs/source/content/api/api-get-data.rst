.. _api-get-data:

==================================================
getData
==================================================

Get decoded data from the contract key value store.

.. code-block:: javascript

  ERC725.getData(schemaKey[, customSchema]);

--------------------------------------------------
Parameters
--------------------------------------------------

* ``schemaKey`` - ``String``: Either the schema name or key of a schema element on the class instance.
* ``customSchema`` - ``Object`` (optional): An optional schema to override attached schema of ERC725 class instance.

--------------------------------------------------
Returns
--------------------------------------------------

``Mixed``: Returns decoded data as defined and expected in the schema:
* A single value (``String`` or ``Object``) for schema keyTypes 'Singleton' & 'Mapping'.
* An array of values (``String`` or ``Object``) for schema keyType 'Array'.

--------------------------------------------------
Example
--------------------------------------------------

.. code-block:: javascript

  ERC725.getData('Username');

  // > 'my-cool-username'