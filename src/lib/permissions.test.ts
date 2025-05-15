import { expect } from 'chai';
import { checkPermissions } from './permissions';

describe('checkPermissions', () => {
  describe('test with single permission', () => {
    it('should throw an error when given an invalid permission string', async () => {
      const requiredPermissions = 'INVALIDPERMISSION';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        `Invalid permission string: ${requiredPermissions}. It must be a valid 32-byte hex string or a known permission name.`,
      );
    });

    it('should assume 0x is no permissions', async () => {
      const requiredPermissions = 'CHANGEOWNER';
      const grantedPermissions = '0x';
      expect(checkPermissions(requiredPermissions, grantedPermissions)).to.be
        .false;
    });

    it('should throw an error when given an invalid 32-byte hex string', async () => {
      const requiredPermissions = '0xinvalidhexstring';
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        `Invalid permission string: ${requiredPermissions}. It must be a valid 32-byte hex string or a known permission name.`,
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
        `Invalid permission string: ${requiredPermissions[1]}. It must be a valid 32-byte hex string or a known permission name.`,
      );
    });

    it('should throw an error when given an array containing an invalid 32-byte hex string', async () => {
      const requiredPermissions = ['CHANGEOWNER', '0xinvalidhexstring'];
      const grantedPermissions =
        '0x000000000000000000000000000000000000000000000000000000000000ff51';
      expect(() =>
        checkPermissions(requiredPermissions, grantedPermissions),
      ).to.throw(
        `Invalid permission string: ${requiredPermissions[1]}. It must be a valid 32-byte hex string or a known permission name.`,
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
