---
sidebar_position: 1.4
---

# Writing Data

This package is not capable of writing data to the blockchain, or relaying data do the blockchain. However it’s utility methods can be used to prepare data for writing to the blockchain. This will provide information that may provide guidance for doing so outside of this package.

## Arrays

Arrays expect to be set with lengths. And the object needed to encode is an array with a minimum of two keys. The full schema name key is the length. You can pass an array if the schema keyType is array.

This will require at least two writes to the contract.

The necessary connection and interface to the blockchain smart contract can be done through the [Web3 library](https://web3js.readthedocs.io/).

## Example: web3.eth.Contract

```js
// Generate contract instance as per Web3 docs.
await Contract.methods
  .setData(
    key,
    value, // to manually set null, '0x'
  )
  .send({
    // ... Sign and send transaction as necessary and per specific application requirements.
  });
```
