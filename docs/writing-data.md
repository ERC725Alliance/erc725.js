---
sidebar_label: Writing Data
sidebar_position: 4
---

# Writing Data

#### How to write data to the ERC725Account key-value store?

The `erc725.js` library cannot write or relay data to the blockchain. However, developers can use its utility methods to prepare data for writing to the blockchain. This section will provide an guide for using such functionality.

## Example Flow

1. Encode the data using the `encodeData` function.
2. Flatten the encoded data using the `flattenEncodedData` function.
3. Get a ABI (JSON Interface) of the desired contract, in order to reference it.
4. Iterate on `flattenedData` and call `setData` on the contract.

<details><summary>Extend instantiation of the contract</summary>
<br/>

<p>

```js title="Instantiation"
import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';

export const schemas = [
  {
    name: 'SupportedStandards:LSP3UniversalProfile',
    key: '0xeafec4d89fa9619884b60000abe425d64acd861a49b8ddf5c0b6962110481f38',
    keyType: 'Mapping',
    valueContent: '0xabe425d6',
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
    name: 'LSP12IssuedAssets[]',
    key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
    keyType: 'Array',
    valueContent: 'Address',
    valueType: 'address',
  },
];

const address = '0x0c03fba782b07bcf810deb3b7f0595024a444f4e';
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/',
};

const myERC725 = new ERC725(schemas, address, provider, config);
```

</p>
</details>

```js
// 1. Encode the data using the `encodeData` function.
const encodedData = myERC725.encodeData({
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
  'LSP12IssuedAssets[]': [
    '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
    '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
  ],
  LSP1UniversalReceiverDelegate: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
});

// 2. Flatten the encoded data using the `flattenEncodedData` function.
const dataToSaveOnChain = flattenEncodedData(encodedDataManyKeys);

// 3. Get an ABI (JSON Interface) of the desired contract, in order to reference it.
const erc725Contract = new web3.eth.Contract(
  [
    // NOTE: We are not loading the full contract ABI, only the function we need
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: '_key',
          type: 'bytes32',
        },
        {
          internalType: 'bytes',
          name: '_value',
          type: 'bytes',
        },
      ],
      name: 'setData',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  ERC725_ADDRESS, // replace this with the desired value
);

// 4. Iterate on `flattenedData` and call `setData` on the smart contract.
await Promise.all(
  dataToSaveOnChain.map(async ({ key, value }) => {
    return erc725Contract.methods.setData(key, value).send();
  }),
);
```
