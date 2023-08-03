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
    along with @erc725/erc725.js.  If not, see <http://www.gnu.org/licenses/>.
*/

// https://docs.lukso.tech/standards/standard-detection

/**
 * @file detector.ts
 * @author Hugo Masclet <@Hugoo>
 * @author Felix Hildebrandt <@fhildeb>
 * @date 2022
 */

import { LSP6_DEFAULT_PERMISSIONS } from '../constants/constants';

import {
  AddressProviderOptions,
  INTERFACE_IDS_0_10_2,
} from '../constants/interfaces';

/**
 * Check if a smart contract address
 * supports a certain interface.
 *
 * @param {string} interfaceId  Interface ID or supported interface name.
 * @param options Object with address and RPC URL.
 * @returns {Promise<boolean>} if interface is supported.
 */
export const supportsInterface = async (
  interfaceIdOrName: string,
  options: AddressProviderOptions,
): Promise<boolean> => {
  let plainInterfaceId: string;
  if (INTERFACE_IDS_0_10_2[interfaceIdOrName]) {
    plainInterfaceId = INTERFACE_IDS_0_10_2[interfaceIdOrName];
  } else {
    plainInterfaceId = interfaceIdOrName;
  }

  try {
    return await options.provider.supportsInterface(
      options.address,
      plainInterfaceId,
    );
  } catch (error) {
    throw new Error(`Error checking the interface: ${error}`);
  }
};

/**
 * @notice Check if the given string is a valid 32-byte hex string.
 * @param str The string to be checked.
 * @return A boolean value indicating whether the string is a valid 32-byte hex string.
 */
function isValid32ByteHexString(str: string): boolean {
  return (
    str.startsWith('0x') &&
    str.length === 66 &&
    str
      .slice(2)
      .split('')
      .every((char) => '0123456789abcdefABCDEF'.includes(char))
  );
}

/**
 * @notice Map a permission to its corresponding bytes32 representation.
 * @param permission The permission string to be mapped.
 * @return The bytes32 representation of the permission.
 * @dev Throws an error if the input is not a known permission name or a valid 32-byte hex string.
 */
function mapPermission(permission: string): string {
  if (
    !LSP6_DEFAULT_PERMISSIONS[permission] &&
    !isValid32ByteHexString(permission)
  ) {
    throw new Error(
      'Invalid permission string. It must be a valid 32-byte hex string or a known permission name.',
    );
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
  grantedPermissions: string,
): boolean => {
  // Validate the grantedPermissions string
  if (!isValid32ByteHexString(grantedPermissions)) {
    throw new Error(
      'Invalid grantedPermissions string. It must be a valid 32-byte hex string.',
    );
  }

  // Convert requiredPermissions to an array if it's a single string
  const requiredPermissionArray: string[] = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  // Map the literal permissions to their bytes32 representation
  const mappedPermissionArray: string[] =
    requiredPermissionArray.map(mapPermission);

  // Perform the AND operation check for each required permission
  return mappedPermissionArray.every((requiredPermission: string) => {
    const requiredPermissionBigInt = BigInt(requiredPermission);
    const grantedPermissionsBigInt = BigInt(grantedPermissions);

    return (
      (requiredPermissionBigInt & grantedPermissionsBigInt) ===
      requiredPermissionBigInt
    );
  });
};
