// Queries for ERC725 subgraph
/* eslint-disable */
import { gql } from '@apollo/client/core';

interface Options {
    offset?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

export const queries = {
    /**
     * Get data for single key from ERC725 instance
     */
    getDataByKey(address: string, key: string) {
        return gql`
    {
      erc725DataStores (where:{ERC725_address:"${address}",key:"${key}"}) {
        id
        ERC725_address
        key
        value
      }
    }
    `;
    },

    /**
     * Get the ERC725 instance kv pairs
     */
    getAllData(id: string) {
        return gql`
    {
      erc725DataStores (where:{ERC725_address:"${id}"}) {
        id
        ERC725_address
        key
        value
        id
      }
    }
    `;
    },

    /**
     * Get all data by key (multiple ERC725 instances possible)
     */
    getMultipleDataByKey(key: string, options: Options) {
        const opts = this._cleanOptions(options);

        return gql`
    {
      erc725DataStores (where:{key:"${key}",skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}}) {
        ERC725_address
        key
        value
        id
      }
    }
    `;
    },

    /**
     * Get all the data keys from an erc725 instance
     */
    getDataKeys(id: string) {
        return gql`
    {
      erc725(id:"${id}") {
        id
        # dataStore
      }
    }
    `;
    },

    /**
     * Get the keys from multiple ERC725 instances
     */
    getMultipleDataKeys(ids: string[], options: Options) {
        const opts = this._cleanOptions(options);

        let arrayStr = '';
        ids.forEach((e, i, a) => {
            arrayStr = arrayStr + '"' + e + '"';
            arrayStr = i + 1 < a.length ? arrayStr + ',' : arrayStr;
        });
        return gql`
    {
      erc725S(where:{id_in:[${arrayStr}]},skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
        id
        dataStores
      }
    }
    `;
    },

    /**
     * Get all keys from all instances
     */
    getAllDataKeys(options?: Options) {
        const opts = this._cleanOptions(options);
        return gql`
      {
        erc725S(skip:${opts.skip},first:${opts.first},orderBy:${opts.orderBy},orderDirection:${opts.orderDirection}) {
          id
          dataStores
        }
      }
    `;
    },

    /** NOTE: We are translating skip/first of GraphQL to offset/limit as per more normal conventions
     * Option types supported as keys in options object:
     *
     * @param {int} offset initial offest
     * @param {int} limit number or results to return
     * @param {string} orderBy field to order by
     * @param {enum} orderDirection direction to order by, either "asc" or "desc" as string
     */
    _cleanOptions(options?: Options) {
        const translatedOptions: {
            skip: number | null;
            first: number | null;
            orderBy: string | null;
            orderDirection: 'asc' | 'desc' | null;
        } = {
            skip: null,
            first: null,
            orderBy: null,
            orderDirection: null,
        };

        if (!options) {
            return translatedOptions;
        }

        if (options.offset) translatedOptions.skip = options.offset;
        if (options.limit) translatedOptions.first = options.limit;
        if (options.orderBy) translatedOptions.orderBy = options.orderBy;
        if (options.orderDirection)
            translatedOptions.orderDirection = options.orderDirection;

        return translatedOptions;
    },
};
