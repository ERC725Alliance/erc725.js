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

// from @lukso/lsp-smart-contracts v0.7.0, erc725.js should stay independent
export const INTERFACE_IDS_0_7_0 = {
  ERC1271: '0x1626ba7e',
  ERC725X: '0x44c028fe',
  ERC725Y: '0x714df77c',
  LSP0ERC725Account: '0xeb6be62e',
  LSP1UniversalReceiver: '0x6bb56a14',
  LSP1UniversalReceiverDelegate: '0xa245bbda',
  LSP6KeyManager: '0xc403d48f',
  LSP7DigitalAsset: '0x5fcaac27',
  LSP8IdentifiableDigitalAsset: '0x49399145',
  LSP9Vault: '0xfd4d5c50',
};

export interface addressProviderOption {
  address: string;
  provider: any;
}
