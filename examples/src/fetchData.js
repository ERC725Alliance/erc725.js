// https://stackoverflow.com/questions/60059121/nodejs-es6-imports-cannot-find-module#comment106219502_60059121
// eslint-disable-next-line import/extensions
import { getInstance } from './instantiation.js';

const myERC725 = getInstance();

const dataOneKey = await myERC725.fetchData('LSP3Profile');
/*
{
  LSP3Profile: {
    LSP3Profile: {
      name: 'patrick-mcdowell',
      links: [Array],
      description: "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
      profileImage: [Array],
      backgroundImage: [Array],
      tags: [Array]
    }
  }
}
*/
const dataManyKeys = await myERC725.fetchData([
  'LSP3Profile',
  'LSP1UniversalReceiverDelegate',
]);
/*
{
  LSP3Profile: {
    LSP3Profile: {
      name: 'patrick-mcdowell',
      links: [Array],
      description: "Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. ",
      profileImage: [Array],
      backgroundImage: [Array],
      tags: [Array]
    }
  },
  LSP1UniversalReceiverDelegate: '0x50A02EF693fF6961A7F9178d1e53CC8BbE1DaD68'
}
*/

console.log('/*--------------------------------------------/*');
console.log('/* fetchData - one key                        /*');
console.log('/*--------------------------------------------/*');
console.log(dataOneKey);
console.log('/*--------------------------------------------/*');
console.log('/* fetchData - many keys                      /*');
console.log('/*--------------------------------------------/*');
console.log(dataManyKeys);
