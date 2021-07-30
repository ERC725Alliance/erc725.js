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

const encodedDataJson = myERC725.encodeData({
  LSP3Profile: {
    json: { name: 'ERC725.js' },
    url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
});

/**
{
  LSP3Profile: {
    value: '0x6f357c6a1343f26fb5573d03919dfbde643a62c8d3bb388980b34950e42ba77487092f53696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
  }
}
*/

console.info('// encodeData(...) with one key');
console.log(encodedDataOne);
console.info('// encodeData(...) with many keys');
console.log(encodedDataMany);
console.info('// encodeData(...) hashing JSON directly');
console.log(encodedDataJson);
