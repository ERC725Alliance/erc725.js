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
Schema
--------------------------------------------------
.. code-block:: javascript

  // Part of LSP3-UniversalProfile Schema
  // https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md
  const mySchema = [
    {
      name: "SupportedStandards:ERC725Account",
      key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
      keyType: "Mapping",
      valueContent: "0xafdeb5d6",
      valueType: "bytes",
    },
    {
      name: "LSP3Profile",
      key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
      keyType: "Singleton",
      valueContent: "JSONURL",
      valueType: "bytes",
    },
    {
      name: "LSP1UniversalReceiverDelegate",
      key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
      keyType: "Singleton",
      valueContent: "Address",
      valueType: "address",
    },
  ];


--------------------------------------------------
Provider
--------------------------------------------------

.. code-block:: javascript
  
  let myERC725Address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';
  let myProvider = new Web3.providers.HttpProvider('https://rpc.l14.lukso.network');
  // optionally you can specifiy your own IPFS gateway
  let myIPFSGateway = 'https://ipfs.lukso.network/ipfs/'

--------------------------------------------------
Instantiation
--------------------------------------------------

.. code-block:: javascript

    let myERC725 = new ERC725(mySchema, myAddress, myProvider[, myIPFSGateway]);


Parameters descriptions:

* `schema <https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md>`_.
* :ref:`providers`.

After the instance has been created is is still possible to change settings through the class options member.

.. code-block:: javascript 

    ERC725.options.ipfsGateway = '<url>' // used for fetchData(), default: 'https://cloudflare-ipfs.com/ipfs/'
    ERC725.options.schema = '<schema>' // change schema
    ERC725.options.address '<address>' // change address
    // NOTE: ERC725.provider can not be changed