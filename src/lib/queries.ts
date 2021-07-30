// Queries for ERC725 subgraph
/* eslint-disable */
import { gql } from 'graphql-tag';

export const queries = {
  /**
   * Get data for single key from ERC725 instance
   */
  getDataByKey(address: string, key: string) {
    return gql`
    {
      findUniqueErc725(where: {address: "${address}"}){
        address
        ERC725DataStore(where: {key: {equals: "${key}"}}){
          key
          value
        }
      }
    }
    `;
  },

  /**
   * Get the ERC725 instance kv pairs
   */
  getAllData(address: string) {
    return gql`
    {
      findUniqueErc725(where: {address: "${address}"}){
        address
        ERC725DataStore{
          key
          value
        }
      }
    }
    `;
  },
};
