import { hexToNumber, leftPad, toHex } from 'web3-utils';
import {
  LSP6_ALL_PERMISSIONS,
  LSP6_DEFAULT_PERMISSIONS,
} from '../constants/constants';
import { Permissions } from '../types/Method';

export function encodePermissions(permissions: Permissions): string {
  const result = Object.keys(permissions).reduce((previous, key) => {
    return permissions[key]
      ? previous | Number(hexToNumber(LSP6_DEFAULT_PERMISSIONS[key]))
      : previous;
  }, 0);

  return leftPad(toHex(result), 64);
}

export function decodePermissions(permissionHex: string) {
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
  };

  const permissionsToTest = Object.keys(LSP6_DEFAULT_PERMISSIONS);
  if (permissionHex === LSP6_ALL_PERMISSIONS) {
    permissionsToTest.forEach((testPermission) => {
      result[testPermission] = true;
    });
    return result;
  }

  const passedPermissionDecimal = Number(hexToNumber(permissionHex));

  permissionsToTest.forEach((testPermission) => {
    const decimalTestPermission = Number(
      hexToNumber(LSP6_DEFAULT_PERMISSIONS[testPermission]),
    );
    const isPermissionIncluded =
      (passedPermissionDecimal & decimalTestPermission) ===
      decimalTestPermission;

    result[testPermission] = isPermissionIncluded;
  });

  return result;
}
