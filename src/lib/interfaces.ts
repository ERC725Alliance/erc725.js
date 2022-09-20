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
import { ERC725JSONSchema } from '../types/ERC725JSONSchema';

export const COMMON_ABIS = {
  supportsInterface: [
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: 'interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};

export enum LSPType {
  // LSPs which are contract interfaces
  LSP0ERC725Account = 'LSP0ERC725Account',
  LSP1UniversalReceiver = 'LSP1UniversalReceiver',
  LSP1UniversalReceiverDelegate = 'LSP1UniversalReceiverDelegate',
  LSP6KeyManager = 'LSP6KeyManager',
  LSP7DigitalAsset = 'LSP7DigitalAsset',
  LSP8IdentifiableDigitalAsset = 'LSP8IdentifiableDigitalAsset',
  LSP9Vault = 'LSP9Vault',

  // LSPs which are storage schemas
  LSP3UniversalProfile = 'LSP3UniversalProfile',
  LSP4DigitalAssetMetadata = 'LSP4DigitalAssetMetadata',
  LSP5ReceivedAssets = 'LSP5ReceivedAssets',
  LSP10ReceivedVaults = 'LSP10ReceivedVaults',
  LSP12IssuedAssets = 'LSP12IssuedAssets',

  // Default
  Unknown = 'Unknown',
}

// from @lukso/lsp-smart-contracts v0.7.0, erc725.js should stay independent
export const INTERFACE_IDS_0_7_0 = {
  ERC165: '0x01ffc9a7',
  ERC1271: '0x1626ba7e',
  ERC20: '0x36372b07',
  ERC223: '0x87d43052',
  ERC721: '0x80ac58cd',
  ERC721Metadata: '0x5b5e139f',
  ERC777: '0xe58e113c',
  ERC1155: '0xd9b67a26',
  ERC725X: '0x44c028fe',
  ERC725Y: '0x714df77c',
  LSP0ERC725Account: '0xeb6be62e',
  LSP1UniversalReceiver: '0x6bb56a14',
  LSP1UniversalReceiverDelegate: '0xa245bbda',
  LSP6KeyManager: '0xc403d48f',
  LSP7DigitalAsset: '0x5fcaac27',
  LSP8IdentifiableDigitalAsset: '0x49399145',
  LSP9Vault: '0xfd4d5c50',
  ClaimOwnership: '0xa375e9c6',
};

export interface LSPTypeOptions {
  interfaceId?: string; // EIP-165
  lsp2Schema?: ERC725JSONSchema | null;
}
