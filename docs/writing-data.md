---
sidebar_position: 1.4
---

# Writing Data

This package is not capable of writing data to the blockchain, or relaying data do the blockchain. However it’s utility methods can be used to prepare data for writing to the blockchain. This will provide information that may provide guidance for doing so outside of this package.

## Example

<details><summary>CLICK ME</summary>
<p>

#### yes, even hidden code blocks!

```python
print("hello world!")
```

</p>
</details>

```js
import Web3 from 'web3';
import { ERC725 } from 'erc725.js';

export const schema = [
  {
    name: 'SupportedStandards:ERC725Account',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
    keyType: 'Mapping',
    valueContent: '0xafdeb5d6',
    valueType: 'bytes',
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address',
  },
  {
    name: 'LSP3IssuedAssets[]',
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    keyType: 'Array',
    valueContent: 'Number',
    valueType: 'uint256',
    elementValueContent: 'Address',
    elementValueType: 'address',
  },
];

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
};

const myERC725 = new ERC725(schema, address, provider, config);
const encodedData = myERC725.encodeData({
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
  'LSP3IssuedAssets[]': [
    '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
    '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
  ],
  LSP1UniversalReceiverDelegate: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
});

// Generate contract instance as per Web3 docs.
const setDataPromises = Object.entries(encodedData).map(
  async ([key, value]) => {
    return myContract.methods.setData(key, value).send();
  },
);

await Promise.all(setDataPromises);
```

```

```
