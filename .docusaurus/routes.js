
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';
export default [
{
  path: '/__docusaurus/debug',
  component: ComponentCreator('/__docusaurus/debug','3d6'),
  exact: true,
},
{
  path: '/__docusaurus/debug/config',
  component: ComponentCreator('/__docusaurus/debug/config','914'),
  exact: true,
},
{
  path: '/__docusaurus/debug/content',
  component: ComponentCreator('/__docusaurus/debug/content','c28'),
  exact: true,
},
{
  path: '/__docusaurus/debug/globalData',
  component: ComponentCreator('/__docusaurus/debug/globalData','3cf'),
  exact: true,
},
{
  path: '/__docusaurus/debug/metadata',
  component: ComponentCreator('/__docusaurus/debug/metadata','31b'),
  exact: true,
},
{
  path: '/__docusaurus/debug/registry',
  component: ComponentCreator('/__docusaurus/debug/registry','0da'),
  exact: true,
},
{
  path: '/__docusaurus/debug/routes',
  component: ComponentCreator('/__docusaurus/debug/routes','244'),
  exact: true,
},
{
  path: '/',
  component: ComponentCreator('/','e21'),
  
  routes: [
{
  path: '/erc725js',
  component: ComponentCreator('/erc725js','a7f'),
  exact: true,
},
{
  path: '/erc725js/classes/erc725',
  component: ComponentCreator('/erc725js/classes/erc725','c35'),
  exact: true,
},
{
  path: '/erc725js/interfaces/erc725config',
  component: ComponentCreator('/erc725js/interfaces/erc725config','8bd'),
  exact: true,
},
{
  path: '/erc725js/interfaces/erc725schema',
  component: ComponentCreator('/erc725js/interfaces/erc725schema','f6f'),
  exact: true,
},
]
},
{
  path: '*',
  component: ComponentCreator('*')
}
];
