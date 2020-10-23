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
 * @file index.js
 * @author Fabian Vogelsteller <fabian@lukso.network>, Robert McLeod <@robertdavid010>
 * @date 2020
 */

import { utils } from 'Web3'

// TODO: First initial steps
// 0. Get the basic library definitions from the ERC725 spec basics
// import some type of ERC735 library standard

// 1. Bring in the schema, addres, and provider

// 2. attach schema

// 3. Attach web3 provider

// NOTE: dont attach full web3 provider, just the provider object


export class ERC725 {
  constructor(schema, address, provider) {
    super(props)
    // we are adding the schema, the address and the provider(type?)
    // the schema will need to be attached to this class

    // Add more sophistiacted includes/checks
    this.currentProvider = props.provider
    this.contractAddress = props.address
  }

  get getData(key) {
    // this needs to know the keyname hash... technically we don't need the string name
    const keyName = utils.keccak256(string)
    // check the schema for the type of name?
  }
}
