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

export enum LSPSchemaType {
  // LSPs which are storage schemas
  LSP3UniversalProfile = 'LSP3UniversalProfile',
  LSP4DigitalAssetMetadata = 'LSP4DigitalAssetMetadata',
  LSP9Vault = 'LSP9Vault',

  /**
        NOTE: LSP5ReceivedAssets, LSP10ReceivedVaults, and LSP12IssuedAssets 
        are not included as an LSPType to check against an interface ID or 
        schema standard, as they are purely metadata standards, which should
        be performed individually.
      */
}
