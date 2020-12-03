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


    // eslint-disable-next-line class-methods-use-this
    getOwner() { throw new Error('We\'re sorry, getOwner() method not yet supported in graph provider type.') }

    async getData(id, keys) {

        if (!keys || Array.isArray(keys)) {

            // TODO: support array of keys
            throw new Error('Incorrect parameter \'keys\' in getData()', keys)

        }
        // Get the value for the specific single key
        const query = queries.getDataByKey(id, keys)
        const result = await this.provider.query({ query })
        // Single out the first result as expected
        const ret = result.data[Object.keys(result.data)[0]][0]
            && result.data[Object.keys(result.data)[0]][0].value
        return (!ret || ret === '0x') ? null : ret // Reemove 0x values

    }

    async getAllData(id) {

        const query = queries.getAllData(id)
        const result = await this.provider.query({ query })
        // Return the data query array
        const ret = result.data[Object.keys(result.data)[0]]
        // we need to remove 0x values
        return ret.filter(e => e && e.value !== '0x')

    }

}
