Getting Started
##################################################

This will get you started

Installation
**************************************************

.. code-block:: shell

  npm install erc725.js


Usage
**************************************************

In your code...

.. code-block:: javascript

  import ERC725 from 'erc725.js'

Or alternately the named export in cases where it assists with integration between node modules and commonjs.

.. code-block:: javascript

  import { ERC725 } from 'erc725.js'


Instantiation
**************************************************

Instantiate with schema 

`Schemas: <erc725-schema>`

.. code-block:: javascript

  let myERC725 = new ERC725(schema[, address, provider, ipfsGateway])