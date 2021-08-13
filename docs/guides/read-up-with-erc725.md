---
sidebar_label: Fetch Universal Profile data
---

# Fetch a Universal Profile contract's data with @erc725/erc725.js

How to easily fetch the data of a Universal Profile smart contract, based on ERC725Y with [@erc725/erc725.js](https://www.npmjs.com/package/@erc725/erc725.js) ?

If you browse the profiles on [Universal Profile](https://universalprofile.cloud), you can see they all have similar characteristics. They have a profile name, a profile picture, a background image, etc.
Where is this information defined and stored? How to easily access this data?

The purpose of this guide is to walk you through the standards of the LUKSO ecosystem and to show you how to use @erc725/erc725.js package.

## Standards

<img src={require('./images/standards-schema.jpg').default} alt="Standards schema" width="100%" height="auto" />

Before jumping into the code, we need to understand which standards are relevant for this use case, how they are linked, and how we can use them.

### ERC725Y

[ERC725Y](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md#erc725y) allows a smart contract to _hold arbitrary data through a generic key/value store_ through the following functions:

```solidity
function getData(bytes32 key) external view returns(bytes value)
function setData(bytes32 _key, bytes memory _value) external
```

Without surprise, the [Universal Profile contract](https://github.com/lukso-network/universalprofile-smart-contracts/blob/main/contracts/LSP3Account.sol) implements the ERC725Y standard.

Let's take a look at this Universal Profile smart contract: `0x23a86EF830708204646abFE631cA1a60d04c4FbE`.

The raw ERC725Y values of the contract can also be read on a [blockchain explorer](https://blockscout.com/lukso/l14/address/0x23a86EF830708204646abFE631cA1a60d04c4FbE/read-contract) and the "parsed/decoded values" can be seen on [universalprofile.cloud](https://universalprofile.cloud/0x23a86EF830708204646abFE631cA1a60d04c4FbE).

<img src={require('./images/read-lsp3-contract-blockscout.png').default} alt="ReadContractBlockScout" width="100%" height="auto" />

You can see this contract holds a couple of `dataKeys` in the `allDataKeys` array (`byte32`).

```solidity
[0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6,
0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47,
0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5,
0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5]
```

What does it mean? How to read and use these keys? Let's try to understand and to read these keys.

### LSP-2 ERC725Y JSON Schema

This key/value store can hold a lot of data, in a lot of ways, to make things easier to process, the [LSP-2 ERC725Y JSON Schema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md) describes how a set of ERC725Y key values can be described. You can see there are a lot of types.

Now that we know how these key/values can be described with a convenient ERC725Y JSON Schema, let's check the ERC725Y JSON Schema of a LSP-3 Universal Profile.

### LSP-3 Universal Profile

The key/value used in this ERC725Y compatible smart contract are following the [LSP-3 Universal Profile](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md) standard, so we will probably get hints on the standard page.
The keys are defined under the [Keys](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md#keys) section.

As expected, we can find all the keys of our contract, along with their JSON Schema. It will help use decode the data.

Here are the information regarding the first key:

```json
{
  "name": "SupportedStandards:ERC725Account",
  "key": "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6",
  "keyType": "Mapping",
  "valueContent": "0xafdeb5d6",
  "valueType": "bytes"
}
```

Let's read this key's value with Web3.js:

```js
import Web3 from 'web3';

const web3 = new Web3('https://rpc.l14.lukso.network');

const erc725ContractAddress = '0x23a86EF830708204646abFE631cA1a60d04c4FbE';

const LSP4DigitalCertificateContract = new web3.eth.Contract(
  [
    // NOTE: We are not loading the full contract ABI, only the function we need
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: '_key',
          type: 'bytes32',
        },
      ],
      name: 'getData',
      outputs: [
        {
          internalType: 'bytes',
          name: '_value',
          type: 'bytes',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
  erc725ContractAddress,
);

const key =
  '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6';

const value = await LSP4DigitalCertificateContract.methods.getData(key).call();

console.log(value);

// > 0xafdeb5d6
```

As you can see, it is relatively easy to read the values. For the example above, the value type is `Mapping`, we don't need to decode anything. However, if we want to read the value of this key:

```json
{
  "name": "LSP3Profile",
  "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
  "keyType": "Singleton",
  "valueContent": "JSONURL",
  "valueType": "bytes"
}
```

You could get something like this: `0x6f357c6af7a5b24b3c5374ab4e21d3fd250e105b4b242a12cfff1cdc83b6bd3251d027cb697066733a2f2f516d584462617639734c4b58715158656a4b42374664624133454e70794476413136564439715256436d4d773943`.

For this key, the `valueContent` type is `JSONURL`, we need to decode it. You can do it manually, with the help of the [LSP-2 ERC725Y JSON Schema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl).
Or you can use `@erc725/erc725.js` to fetch/decode the data automatically 🪄📜

## Fetching/decoding data with @erc725/erc725.js

As you may have noticed, the key/values of a LSP-2 ERC725Y JSON Schema is very flexible and decoding the values can be a bit tedious. This is where `@erc725/erc725.js` comes to the rescue ⛑️.

With `@erc725/erc725.js`, you only need to give a JSON Schema and a contract address to automatically read the decoded data of the contract. Let's try:

1.  Install @erc725/erc725.js: `npm i @erc725/erc725.js`
2.  Copy the ERC725Y JSON Schema. It can be found under the [Implementation](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md#implementation) section
3.  Read the data

```ts
import ERC725 from 'erc725.js';
import Web3 from 'web3';

const LSP3Schema = [
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

const erc725ContractAddress = '0x23a86EF830708204646abFE631cA1a60d04c4FbE';
const provider = new Web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network',
);
const myERC725 = new ERC725(LSP3Schema, erc725ContractAddress, provider);

const profileData = await myERC725.fetchData('LSP3Profile');

console.log(profileData);
```

```js title="output"
{
  LSP3Profile: {
    LSP3Profile: {
      name: 'hugo',
      description: 'Everything tech @ LUKSO 👾',
      links: [ [Object] ],
      profileImage: [ [Object], [Object], [Object], [Object], [Object] ],
      backgroundImage: [ [Object], [Object], [Object], [Object], [Object] ]
    }
  }
}
```

Better than the raw value: `0x6f357c6af7a5b24b3c5374ab4e21d3fd250e105b4b242a12cfff1cdc83b6bd3251d027cb697066733a2f2f516d584462617639734c4b58715158656a4b42374664624133454e70794476413136564439715256436d4d773943`, right?

The package provides more helper functions to interact with ERC725Y smart contracts. You can explore the documentation and the [technical reference](../technical-reference/classes/ERC725) of the package to find more examples.
