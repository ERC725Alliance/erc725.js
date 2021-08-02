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

const encodedDataOne = myERC725.encodeData({
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
});

/**
{
  LSP3Profile: {
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  },
}
*/

const encodedDataMany = myERC725.encodeData({
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

/**
{
  LSP3Profile: {
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
  },
  'LSP3IssuedAssets[]': {
    value: [[Object], [Object], [Object]],
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
  },
  LSP1UniversalReceiverDelegate: {
    value: '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
  },
}
*/
const json = {
  LSP3Profile: {
    name: 'frozeman',
    links: [
      { title: 'Twitter', url: 'https://twitter.com/feindura' },
      { title: 'lukso.network', url: 'https://lukso.network' },
    ],
    description: 'The inventor fo ERC725 and ERC20.....',
    profileImage: [
      {
        width: 1800,
        height: 1712,
        hashFunction: 'keccak256(bytes)',
        hash: '0xfbcfcbbc86d886e862419361c48251d778884a90429d36c8d002559cbcb52972',
        url: 'ipfs://QmNPh6hP5igFzPf4mPtKBa6Wttnmi3YNVMAptC7drzyeDB',
      },
      {
        width: 1024,
        height: 974,
        hashFunction: 'keccak256(bytes)',
        hash: '0xa9399df007997de92a820c6c2ec1cb2d3f5aa5fc1adf294157de563eba39bb6e',
        url: 'ipfs://QmW4wM4r9yWeY1gUCtt7c6v3ve7Fzdg8CKvTS96NU9Uiwr',
      },
      {
        width: 640,
        height: 609,
        hashFunction: 'keccak256(bytes)',
        hash: '0xb316a695125cb0566da252266cfc9d5750a740bbdffa86712bb17508e70e6a31',
        url: 'ipfs://QmXGELsqGidAHMwYRsEv6Z4emzMggtc5GXZYGFK7r6zFBg',
      },
      {
        width: 320,
        height: 304,
        hashFunction: 'keccak256(bytes)',
        hash: '0xd22a272ff5b257056cc302bcdcca1c0ea00bf912aef310eb3fa7556696b1e780',
        url: 'ipfs://QmRr2urTVi12VzYa5cSHDjJXACfapaeGZW2BuNmQ8rHjCG',
      },
      {
        width: 180,
        height: 171,
        hashFunction: 'keccak256(bytes)',
        hash: '0xf80d0c1492de5e148392b3a724739682e9b9564ef5fb97c06c1574bbb5e5f340',
        url: 'ipfs://QmVeFyhHtdXR34UZanqU2qSuBTfGtBraG7hhN5byjJNAY5',
      },
    ],
    backgroundImage: [
      {
        width: 1800,
        height: 1013,
        hashFunction: 'keccak256(bytes)',
        hash: '0x98fe032f81c43426fbcfb21c780c879667a08e2a65e8ae38027d4d61cdfe6f55',
        url: 'ipfs://QmPJESHbVkPtSaHntNVY5F6JDLW8v69M2d6khXEYGUMn7N',
      },
      {
        width: 1024,
        height: 576,
        hashFunction: 'keccak256(bytes)',
        hash: '0xfce1c7436a77a009a97e48e4e10c92e89fd95fe1556fc5c62ecef57cea51aa37',
        url: 'ipfs://QmZc9uMJxyUeUpuowJ7AD6MKoNTaWdVNcBj72iisRyM9Su',
      },
      {
        width: 640,
        height: 360,
        hashFunction: 'keccak256(bytes)',
        hash: '0x10a5cf2479992f1c555ad71e0a2866827f66fef6941a0c99f8d3b03e6b8b4009',
        url: 'ipfs://QmbP3eTmUx1UQ2eZ8hrDz8j98yP2CTmsJvfp72LZKnkKj1',
      },
    ],
    tags: ['public profile'],
  },
};

const encodedDataJson = myERC725.encodeData({
  LSP3Profile: {
    json,
    url: 'ifps://QmQTqheBLZFnQUxu5RDs8tA9JtkxfZqMBcmGd9sukXxwRm',
  },
});

/**
{
  LSP3Profile: {
    value: '0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1696670733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
  }
}
*/

// console.info('// encodeData(...) with one key');
// console.log(encodedDataOne);
// console.info('// encodeData(...) with many keys');
// console.log(encodedDataMany);
// console.info('// encodeData(...) hashing JSON directly');
// console.log(encodedDataJson);

const data = Object.entries(encodedDataMany).flatMap(([, value]) => {
  if (Array.isArray(value.value)) {
    return value.value;
  }

  return {
    key: value.key,
    value: value.value,
  };

  // return myContract.methods.setData(key, value).send();
});

console.log(data);
// await Promise.all(setDataPromises);
