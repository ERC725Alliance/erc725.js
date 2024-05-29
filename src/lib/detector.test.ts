/*
    This file is part of @erc725/erc725.js.
    @erc725/erc725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    @erc725/erc725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/detector.test.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Felix Hildebrandt <@fhildeb>
 * @date 2022
 */

/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import * as sinon from 'sinon';
import { INTERFACE_IDS_0_12_0 } from '../constants/interfaces';

import { internalSupportsInterface } from './detector';

describe('supportsInterface', () => {
  it('it should return true if the contract supports the interface with name', async () => {
    const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe';
    const interfaceName = 'LSP0ERC725Account';

    const providerStub = { supportsInterface: sinon.stub() };

    providerStub.supportsInterface
      .withArgs(contractAddress, INTERFACE_IDS_0_12_0[interfaceName])
      .returns(Promise.resolve(true));

    const doesSupportInterface = await internalSupportsInterface(
      interfaceName,
      {
        address: contractAddress,
        provider: providerStub,
      },
    );

    expect(doesSupportInterface).to.be.true;
  });

  it('it should return true if the contract supports the interface with interfaceId', async () => {
    const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe';
    const interfaceId = INTERFACE_IDS_0_12_0.LSP1UniversalReceiver;

    const providerStub = { supportsInterface: sinon.stub() };

    providerStub.supportsInterface
      .withArgs(contractAddress, interfaceId)
      .returns(Promise.resolve(true));

    const doesSupportInterface = await internalSupportsInterface(interfaceId, {
      address: contractAddress,
      provider: providerStub,
    });

    expect(doesSupportInterface).to.be.true;
  });
});
