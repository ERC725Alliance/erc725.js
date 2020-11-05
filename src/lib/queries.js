// Queries for ERC725 subgraph
import { gql } from '@apollo/client';

export const queries = {

  getDataByKey (id, key) {
  // Get ERC725 instance data by single key
    return gql`
    {
      erc725DataStores (where:{erc725id:"${id}",key:"${key}"}) {
        erc725id
        key
        value
        id
      }
    }
    `
  },


  getAllData (id) {
    // Get the ERC725 instance kv pairs
    return gql`
    {
      erc725DataStores (where:{erc725id:"${id}"}) {
        erc725id
        key
        value
        id
      }
    }
    `
  },

  getMultipleDataByKey(key, options) {
    const opts = this._cleanOptions(options)
    // Get all data by key (multiple ERC725 instances possible)
    return gql`
    {
      erc725DataStores (where:{key:"${key}",skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}}) {
        erc725id
        key
        value
        id
      }
    }
    `
  },

  getDataKeys (id) {
    // Get all the data keys from an erc725 instance
    return gql`
    {
      erc725(id:"${id}") {
        id
        dataStore
      }
    }
    `
  },
  
  getMultipleDataKeys(ids, options) {
    const opts = this._cleanOptions(options)
    // Get the keys from multiple ERC725 instances
    let arrayStr = ""
    ids.forEach((e,i,a) => {
      arrayStr = arrayStr + "\"" + e + "\""
      arrayStr = i + 1 < a.length ? arrayStr + "," : arrayStr
    })
    return gql`
    {
      erc725S(where:{id_in:[${arrayStr}]},skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
        id
        dataStore
      }
    }
    `
  },
  
  
  getAllDataKeys(options) {
    // Get all keys from all instances
    const opts = this._cleanOptions(options)
    return gql`
      {
        erc725S(skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
          id
          dataStore
        }
      }
    `
  },

  _cleanOptions(options) {
    /** NOTE: We are translating skip/first fo GraphQL to offset/limit as per more normal conventions
    Option types supported as keys in options object:
    @param offset: @type int @description 'initial offest'
    @param limit: @type int @description 'number or results to return'
    @param orderBy: @type string @description 'field to order by'
    @param orderDirection: @type enum @description 'direction to order by, either "asc" or "desc" as string'
    */
    const opts = {}
    opts.skip = options && options.offset || null,
    opts.first = options && options.limit || null,
    opts.orderBy = options && options.orderBy || null,
    opts.orderDirection = options && options.orderDirection || null
    return opts
  }
  
}
