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

import { internalSupportsInterface, checkPermissions } from './detector';

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

describe('checkPermissions', () => {
  describe('test with single permission', () => {
    it('should throw an error when given an invalid permission string', async () => {
      const requiredPermissions = 'INVALIDPERMISSION';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        'Invalid permission string. It must be a valid 32-byte hex string or a known permission name.',
      );
    });

    it('should throw an error when given an invalid 32-byte hex string', async () => {
      const requiredPermissions = '0xinvalidhexstring';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        'Invalid permission string. It must be a valid 32-byte hex string or a known permission name.',
      );
    });

    it('should throw an error when given an invalid grantedPermission 32-byte hex string', async () => {
      const requiredPermissions = 'CHANGEOWNER';
      const grantedPermissions = '0xinvalidgrantedpermissionhexstring';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        'Invalid grantedPermissions string. It must be a valid 32-byte hex string.',
      );
    });

    it('should return true when single literal permission matches granted permissions', async () => {
      const requiredPermissions = 'CHANGEOWNER';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.true;
    });

    it('should return true when single bytes32 permission matches granted permissions', async () => {
      const requiredPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000001';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.true;
    });

    it('should return false when single bytes32 permission does not match granted permissions', async () => {
      const requiredPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000001';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000fff2';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });

    it('should return false when single literal permission does not match granted permissions', async () => {
      const requiredPermissions = 'CHANGEOWNER';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000fff2';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });
  });

  describe('test with multiple permissions', () => {
    it('should throw an error when given an array containing an invalid permission string', async () => {
      const requiredPermissions = ['CHANGEOWNER', 'INVALIDPERMISSION'];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        'Invalid permission string. It must be a valid 32-byte hex string or a known permission name.',
      );
    });

    it('should throw an error when given an array containing an invalid 32-byte hex string', async () => {
      const requiredPermissions = ['CHANGEOWNER', '0xinvalidhexstring'];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        'Invalid permission string. It must be a valid 32-byte hex string or a known permission name.',
      );
    });

    it('should return false when one of the literal permissions does not match granted permissions', async () => {
      const requiredPermissions = ['EDITPERMISSIONS', 'CALL'];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });

    it('should return false when one of the bytes32 permissions does not match granted permissions', async () => {
      const requiredPermissions = [
        '0x0000000000000000000000000000000000000000000000000000000000000004',
        '0x0000000000000000000000000000000000000000000000000000000000000800',
      ];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });

    it('should return true when all the mixed literal and bytes32 permissions match granted permissions', async () => {
      const requiredPermissions = [
        'EDITPERMISSIONS',
        '0x0000000000000000000000000000000000000000000000000000000000000800',
      ];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff54';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.true;
    });

    it('should return false when not all multiple literal permissions match granted permissions', async () => {
      const requiredPermissions = ['CHANGEOWNER', 'CALL'];
      const grantedPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000051';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });

    it('should return true when all multiple literal permissions match granted permissions', async () => {
      const requiredPermissions = ['CHANGEOWNER', 'CALL'];
      const grantedPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000801';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.true;
    });

    it('should return false when not all multiple bytes32 permissions match granted permissions', async () => {
      const requiredPermissions = [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000800',
      ];
      const grantedPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000051';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });

    it('should return false when not all mixed literal and bytes32 permissions match granted permissions', async () => {
      const requiredPermissions = [
        'CHANGEOWNER',
        '0x0000000000000000000000000000000000000000000000000000000000000800',
      ];
      const grantedPermissions =
        '0x0000000000000000000000000000000000000000000000000000000000000051';
      const result = checkPermissions(requiredPermissions, grantedPermissions);
      expect(result).to.be.false;
    });
  });
});
