// https://stackoverflow.com/questions/60059121/nodejs-es6-imports-cannot-find-module#comment106219502_60059121
// eslint-disable-next-line import/extensions
import { getInstance } from './instantiation.js';

const myERC725 = getInstance();

const decodedDataOneKey = myERC725.decodeData([
  {
    keyName: 'LSP3Profile',
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
  },
]);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verificationFunction: 'keccak256(utf8)',
      verificationData: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
    }
  }
]
*/

const decodedDataManyKeys = myERC725.decodeData([
  {
    keyName: 'LSP3Profile',
    value:
      '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
  },
  {
    keyName: 'LSP3IssuedAssets[]',
    value: [
      {
        key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
        value:
          '0x0000000000000000000000000000000000000000000000000000000000000002',
      },
      {
        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000000',
        value: '0xd94353d9b005b3c0a9da169b768a31c57844e490',
      },
      {
        key: '0x3a47ab5bd3a594c3a8995f8fa58d087600000000000000000000000000000001',
        value: '0xdaea594e385fc724449e3118b2db7e86dfba1826',
      },
    ],
  },
]);
/**
[
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    value: {
      verificationFunction: 'keccak256(utf8)',
      verificationData: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
      url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
    }
  },
  {
    name: 'LSP3IssuedAssets[]',
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    value: [
      '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
      '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826'
    ]
  }
]
*/
console.log('/*--------------------------------------------/*');
console.log('/* decodeData - one key                       /*');
console.log('/*--------------------------------------------/*');
console.log(decodedDataOneKey);
console.log('/*--------------------------------------------/*');
console.log('/* decodeData - many keys                     /*');
console.log('/*--------------------------------------------/*');
console.log(decodedDataManyKeys);
