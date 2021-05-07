.. _getting-started:

==================================================
Getting Started
==================================================

This will get you started

--------------------------------------------------
Installation
--------------------------------------------------

.. code-block:: shell

  npm install erc725.js


--------------------------------------------------
Usage
--------------------------------------------------

In your code...

.. code-block:: javascript

  import ERC725 from 'erc725.js'

Or alternately the named export in cases where it assists with integration between node modules and commonjs.

.. code-block:: javascript

  import { ERC725 } from 'erc725.js'


--------------------------------------------------
Instantiation
--------------------------------------------------

Create in instance of the ERC725 class with a

`Schemas <erc725-schema>`

.. code-block:: javascript

    let myERC725 = new ERC725(schema, address, provider[, ipfsGateway]);


Parameters are described:


* `schema <https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md>`_.
* :ref:`providers`.

After the instance has been created is is still possible to change value through the class ``options`` member.

.. code-block:: javascript 

    ERC725.options.ipfsGateway = '<url>' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
    ERC725.options.schema = '<schema>' // change schema
    ERC725.options.address '<address>' // change address
    // NOTE: ERC725.provider can not be changed