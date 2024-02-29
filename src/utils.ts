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

/**
 * @file index.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @date 2020
 */

// Types
export type {
  ERC725JSONSchemaKeyType,
  ERC725JSONSchemaValueContent,
  ERC725JSONSchemaValueType,
  ERC725JSONSchema,
} from './types/ERC725JSONSchema';

export { ERC725Config, KeyValuePair, ProviderTypes } from './types';
export { encodeData, encodeArrayKey } from './lib/utils';
export { decodeData } from './lib/decodeData';
export { encodeKeyName } from './lib/encodeKeyName';
export { decodeMappingKey } from './lib/decodeMappingKey';
export { decodeValueType, decodeValueContent } from './lib/encoder';
export { getDataFromExternalSources } from './lib/getDataFromExternalSources';
export { decodePermissions, encodePermissions } from './lib/permissions';
