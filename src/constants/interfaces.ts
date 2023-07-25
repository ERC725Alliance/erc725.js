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

// from @lukso/lsp-smart-contracts v0.10.2, erc725.js should stay independent
export const INTERFACE_IDS_0_10_2 = {
  ERC1271: '0x1626ba7e',
  ERC725X: '0x7545acac',
  ERC725Y: '0x629aa694',
  LSP0ERC725Account: '0x3e89ad98',
  LSP1UniversalReceiver: '0x6bb56a14',
  LSP6KeyManager: '0x38bb3cdb',
  LSP7DigitalAsset: '0xda1f85e4',
  LSP8IdentifiableDigitalAsset: '0x622e7a01',
  LSP9Vault: '0x28af17e6',
  LSP14Ownable2Step: '0x94be5999',
  LSP17Extendable: '0xa918fa6b',
  LSP17Extension: '0xcee78b40',
  LSP20CallVerification: '0x1a0eb6a5',
  LSP20CallVerifier: '0x480c0ec2',
};

export interface AddressProviderOptions {
  address: string;
  provider: any;
}
