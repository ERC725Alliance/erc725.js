// This file will handle querying the graphql sever
// in accordance with implementation of datastore in subgraph definition
// This also assumes the model associated with stored data follows either that as stored in 
// on chain smart contract storage, or as defined in the official gql subgraph definition
import { ApolloClient, InMemoryCache, createHttpLink, gql, NormalizedCacheObject } from '@apollo/client';

// TODO: Handle passing of 'provider' to set uri from main class
const apolloClient = new ApolloClient({
  uri: "http://localhost:8000/subgraphs/name/robertdavid010/test-subgraph-4",
  cache: new InMemoryCache(),
  fetchOptions: {
    mode: 'no-cors'
  }
})

async function getEntity (entityId) {
  // Get the core ERC725 model list of data keys
  const ERC725_QUERY = gql`
  {
    erc725(id:"${entityId}") {
      id
      dataStore
    }
  }
  `
  return await apolloClient.query({ query: ERC725_QUERY })
}

async function getDataByEntity (entityId) {
  // Get the ERC725 instance kv pairs
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{erc725id:"${entityId}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

async function getEntityDataByKey(entityId, keyHash) {
  // Get ERC725 instance data (kv pairs) filtered by key
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{erc725id:"${entityId}",key:"${keyHash}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

async function getDataByKey(keyHash) {
  // Get all data by key (multiple ERC725 instances possible)
  const ERC725_DATA_QUERY = gql`
  {
    erc725DataStores (where:{key:"${keyHash}"}) {
      erc725id
      key
      value
      id
    }
  }
  `
  return await apolloClient.query({ query: ERC725_DATA_QUERY }) 
}

export const ERC725Source = {
  getEntity,
  getDataByEntity,
  getEntityDataByKey,
  getDataByKey
}