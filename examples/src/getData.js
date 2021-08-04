// https://stackoverflow.com/questions/60059121/nodejs-es6-imports-cannot-find-module#comment106219502_60059121
// eslint-disable-next-line import/extensions
import { getInstance } from './instantiation.js';

const myERC725 = getInstance();

const dataOneKey = myERC725.getData('LSP3Profile');
const dataManyKeys = myERC725.getData([
  'LSP3Profile',
  'LSP1UniversalReceiverDelegate',
]);

(async function logs() {
  console.log('/*--------------------------------------------/*');
  console.log('/* getData - one key                          /*');
  console.log('/*--------------------------------------------/*');
  console.log(await dataOneKey);
  console.log('/*--------------------------------------------/*');
  console.log('/* getData - many keys                        /*');
  console.log('/*--------------------------------------------/*');
  console.log(await dataManyKeys);
})();
