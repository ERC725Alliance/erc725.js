import { Hex, hexToBigInt, isHex, pad, toHex } from 'viem';
import { LSP6_DEFAULT_PERMISSIONS } from '../constants/constants';
import type { Permissions } from '../types/Method';

export function encodePermissions(permissions: Permissions): Hex {
  let basePermissions = BigInt(0);

  // Process each permission to potentially switch off permissions included in ALL_PERMISSIONS
  // Deal with ALL_PERMISSIONS first IMPORTANT!
  const keys = Object.keys(permissions).filter(
    (key) => key !== 'ALL_PERMISSIONS',
  );
  keys.splice(0, 0, 'ALL_PERMISSIONS');
  // Do not use an for of loop here to not require the regenerator runtime
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const permissionValue = hexToBigInt(LSP6_DEFAULT_PERMISSIONS[key], {});
    if (key in permissions) {
      if (permissions[key]) {
        basePermissions |= permissionValue;
      } else {
        basePermissions &= ~permissionValue;
      }
    }
  }
  // Convert the final BigInt permission value back to a hex string, properly padded
  return pad(toHex(basePermissions), { size: 32 });
}

export function decodePermissions(permissionHex: Hex) {
  const result = {
    CHANGEOWNER: false,
    ADDCONTROLLER: false,
    EDITPERMISSIONS: false,
    ADDEXTENSIONS: false,
    CHANGEEXTENSIONS: false,
    ADDUNIVERSALRECEIVERDELEGATE: false,
    CHANGEUNIVERSALRECEIVERDELEGATE: false,
    REENTRANCY: false,
    SUPER_TRANSFERVALUE: false,
    TRANSFERVALUE: false,
    SUPER_CALL: false,
    CALL: false,
    SUPER_STATICCALL: false,
    STATICCALL: false,
    SUPER_DELEGATECALL: false,
    DELEGATECALL: false,
    DEPLOY: false,
    SUPER_SETDATA: false,
    SETDATA: false,
    ENCRYPT: false,
    DECRYPT: false,
    SIGN: false,
    EXECUTE_RELAY_CALL: false,
    ERC4337_PERMISSION: false,
    ALL_PERMISSIONS: false,
  };

  const permissionsToTest = Object.keys(LSP6_DEFAULT_PERMISSIONS);
  const passedPermissionDecimal =
    permissionHex === '0x' ? 0n : hexToBigInt(permissionHex);

  // Do not use an for of loop here to not require the regenerator runtime
  // Deal with ALL_PERMISSIONS the same way. So as long as all the bits in ALL_PERMISSIONS

  // are set the same way as in ALL_PERMISSIONS then this flag will return as true.
  // It does not mean some extra permissions are not included.
  for (let i = 0; i < permissionsToTest.length; i += 1) {
    const testPermission = permissionsToTest[i];
    const decimalTestPermission = hexToBigInt(
      LSP6_DEFAULT_PERMISSIONS[testPermission],
    );
    const isPermissionIncluded =
      (passedPermissionDecimal & decimalTestPermission) ===
      decimalTestPermission;

    result[testPermission] = isPermissionIncluded;
  }

  return result;
}

/**
 * @notice Map a permission to its corresponding bytes32 representation.
 * @param permission The permission string to be mapped.
 * @return The bytes32 representation of the permission.
 * @dev Return null if the input is not a known permission name or a valid 32-byte hex string.
 */
export function mapPermission(permission: string): string | null {
  if (
    !LSP6_DEFAULT_PERMISSIONS[permission] &&
    !isHex(permission, { strict: true })
  ) {
    return null;
  }
  return LSP6_DEFAULT_PERMISSIONS[permission] || permission;
}

/**
 * @notice Check if the required permissions are included in the granted permissions.
 * @param requiredPermissions An array of required permissions or a single required permission.
 * @param grantedPermissions The granted permissions as a 32-byte hex string.
 * @return A boolean value indicating whether the required permissions are included in the granted permissions.
 * @dev Throws an error if the grantedPermissions input is not a valid 32-byte hex string.
 */
export const checkPermissions = (
  requiredPermissions: string[] | string,
  _grantedPermissions: Hex,
): boolean => {
  let grantedPermissions = _grantedPermissions;
  if (grantedPermissions === '0x') {
    grantedPermissions = '0x0';
  }
  if (!isHex(grantedPermissions, { strict: true })) {
    // Validate the grantedPermissions string
    throw new Error(
      'Invalid grantedPermissions string. It must be a valid 32-byte hex string.',
    );
  }

  // Convert requiredPermissions to an array if it's a single string
  const requiredPermissionArray: string[] = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Map the literal permissions to their bytes32 representation
  const mappedPermissionArray: (string | null)[] =
    requiredPermissionArray.map(mapPermission);

  // Perform the AND operation check for each required permission
  return mappedPermissionArray.every(
    (requiredPermission: string | null, index: number) => {
      if (!requiredPermission) {
        throw new Error(
          `Invalid permission string: ${requiredPermissionArray[index]}. It must be a valid 32-byte hex string or a known permission name.`,
        );
      }
      const requiredPermissionBigInt = BigInt(requiredPermission);
      const grantedPermissionsBigInt = BigInt(grantedPermissions);
      return (
        (requiredPermissionBigInt & grantedPermissionsBigInt) ===
        requiredPermissionBigInt
      );
    },
  );
};
