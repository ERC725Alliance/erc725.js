
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';
export default [
{
  path: '/',
  component: ComponentCreator('/','8be'),
  
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
]
},
{
  path: '*',
  component: ComponentCreator('*')
}
];
