// https://stackoverflow.com/questions/60059121/nodejs-es6-imports-cannot-find-module#comment106219502_60059121
// eslint-disable-next-line import/extensions
import { getInstance } from './instantiation.js';

const myERC725 = getInstance();

const dataOneKey = await myERC725.getData('LSP3Profile');
/*
{
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
    url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
  }
}
*/
const dataManyKeys = await myERC725.getData([
  'LSP3Profile',
  'LSP1UniversalReceiverDelegate',
]);
/*
{
  LSP3Profile: {
    hashFunction: 'keccak256(utf8)',
    hash: '0xd96ff7776660095f661d16010c4349aa7478a9129ce0670f771596a6ff2d864a',
    url: 'ipfs://QmbTmcbp8ZW23vkQrqkasMFqNg2z1iP4e3BCUMz9PKDsSV'
  },
  LSP1UniversalReceiverDelegate: '0x50A02EF693fF6961A7F9178d1e53CC8BbE1DaD68'
}
*/

console.log('/*--------------------------------------------/*');
console.log('/* getData - one key                          /*');
console.log('/*--------------------------------------------/*');
console.log(dataOneKey);
console.log('/*--------------------------------------------/*');
console.log('/* getData - many keys                        /*');
console.log('/*--------------------------------------------/*');
console.log(dataManyKeys);
