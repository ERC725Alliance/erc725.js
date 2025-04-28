// https://stackoverflow.com/questions/60059121/nodejs-es6-imports-cannot-find-module#comment106219502_60059121
// eslint-disable-next-line import/extensions
import { getInstance, profileJson } from './instantiation.js'

const myERC725 = getInstance()

const encodedDataOneKey = myERC725.encodeData({
  keyName: 'LSP3Profile',
  value: {
    json: profileJson, // check instantiation.js to see the actual JSON
    url: 'ipfs://QmQTqheBLZFnQUxu5RDs8tA9JtkxfZqMBcmGd9sukXxwRm',
  },
})
/**
{
  keys: [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
  ],
  values: [
    '0x6f357c6a2404a2866f05e53e141eb61382a045e53c2fc54831daca9d9e1e039a11f739e1697066733a2f2f516d5154716865424c5a466e5155787535524473387441394a746b78665a714d42636d47643973756b587877526d'
  ]
}
*/

const encodedDataOneKeyV2 = myERC725.encodeData({
  keyName: 'LSP3Profile',
  value: {
    verification: {
      method: 'keccak256(utf8)',
      data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    },
    url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
  },
})
/**
{
  keys: [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
  ],
  values: [
    '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178'
  ]
}
*/

const encodedDataManyKeys = myERC725.encodeData([
  {
    keyName: 'LSP3Profile',
    value: {
      verification: {
        method: 'keccak256(utf8)',
        data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
      },
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
    },
  },
  {
    keyName: 'LSP3IssuedAssets[]',
    value: [
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
    ],
  },
  {
    keyName: 'LSP1UniversalReceiverDelegate',
    value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
  },
])
/**
{
  keys: [
    '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
    '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
    '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47'
  ],
  values: [
    '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
    '0x0000000000000000000000000000000000000000000000000000000000000002',
    '0xd94353d9b005b3c0a9da169b768a31c57844e490',
    '0xdaea594e385fc724449e3118b2db7e86dfba1826',
    '0x1183790f29be3cdfd0a102862fea1a4a30b3adab'
  ]
}
*/

console.log('/*-----------------------------------------------------/*')
console.log('/* encodedData - one key (LSP3Profile) with JSON       /*')
console.log('/*-----------------------------------------------------/*')
console.log(encodedDataOneKey)
console.log('/*-----------------------------------------------------/*')
console.log('/* encodedData - one key (LSP3Profile) with hash       /*')
console.log('/*-----------------------------------------------------/*')
console.log(encodedDataOneKeyV2)
console.log('/*-----------------------------------------------------/*')
console.log('/* encodedData - many keys                             /*')
console.log('/*-----------------------------------------------------/*')
console.log(encodedDataManyKeys)
