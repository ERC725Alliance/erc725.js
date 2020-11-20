/*
    This file is part of ERC725.js.
    ERC725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    ERC725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file providers/subgraphProviderWrapper.js
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

/*
  This file will handle querying the graphql sever
  in accordance with implementation of datastore in subgraph definition
*/

import { queries } from '../lib/queries.js'

export default class GraphSource {
  constructor(provider) {
    this.provider = provider
  }

  async getData(id, keys) {
    if (Array.isArray(keys)) {
      // TODO: get by the keys for the address/id
    } else if (!keys){
      // TODO: get all the data for required fields for the address/id
    } else {
      // Return the value for the specific single key
      const query = queries.getDataByKey(id, keys)
      const result = await this.provider.query({ query: query }) //TODO: return the value only
      // Single out the first result as expected
      return result.data[Object.keys(result.data)[0]][0].value
    }

  }

  async getAllData(id, keys) {
    // TODO: Add support for multiple keys
    const query = queries.getAllData(id)
    const result = await this.provider.query({ query:query })
    // console.log('ACTUAL GRAPH \'getAllData\' RESULT')
    // console.log(result)
    // Return the data query array
    return result.data[Object.keys(result.data)[0]]
  }

}