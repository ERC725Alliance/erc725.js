
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
  component: ComponentCreator('/','6f5'),
  
  routes: [
{
  path: '/api',
  component: ComponentCreator('/api','f68'),
  exact: true,
},
{
  path: '/api/classes/erc725',
  component: ComponentCreator('/api/classes/erc725','ce7'),
  exact: true,
},
{
  path: '/api/interfaces/erc725config',
  component: ComponentCreator('/api/interfaces/erc725config','136'),
  exact: true,
},
{
  path: '/api/interfaces/erc725schema',
  component: ComponentCreator('/api/interfaces/erc725schema','0cb'),
  exact: true,
},
{
  path: '/api/modules',
  component: ComponentCreator('/api/modules','5c3'),
  exact: true,
},
]
},
{
  path: '*',
  component: ComponentCreator('*')
}
];
