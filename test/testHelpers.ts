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
 * @file test/testHelpers.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */

import { encodeArrayKey } from '../src/lib/utils';

/**
 * Takes the schema object and builds a full dataset as per expected from provider.
 */
export function generateAllRawData(schema, isArrayMode: boolean) {
  const results: { key: string; value: string }[] = [];
  for (let index = 0; index < schema.length; index++) {
    const element = schema[index];
    // if is array push data
    if (element.keyType === 'Array') {
      const correctReturnRawData = isArrayMode
        ? element.returnRawDataArray
        : element.returnRawData;

      correctReturnRawData.forEach((e, i) => {
        // we assume always first element in the array in returnData array is the length
        if (i === 0) {
          results.push({
            key: element.key,
            value: e,
          });
        } else {
          // This is array length key/value pair
          results.push({
            key: encodeArrayKey(element.key, i - 1),
            value: e,
          });
        }
      });
    } else {
      results.push({
        key: element.key,
        value: isArrayMode ? element.returnRawDataArray : element.returnRawData,
      });
    }
  }

  return results;
}

/**
 * Takes the schema object and builds a full dataset as per expected from provider.
 */
export function generateAllData(schema) {
  const results: any[] = [];
  for (let index = 0; index < schema.length; index++) {
    const element = schema[index];

    // if is a 'nested' array, need to flatten it, and add {key,value} elements
    if (element.keyType === 'Array') {
      element.returnGraphData.forEach((e, i) => {
        if (i === 0) {
          // We need the new key, and to 'flatten the array as per expected from chain data
          if (e) {
            results.push({
              key: element.key,
              value: e.toLowerCase(), // force address to lowercase
            }); // we subtract one from length because this has the extra array length key in the array
          }
        } else {
          // This is array length key/value pair
          results.push({
            key: encodeArrayKey(element.key, i - 1),
            value: e ? e.toLowerCase() : e, // force address to lowercase
          });
        }
      }); // end .forEach()
    } else {
      results.push({
        key: element.key,
        value: element.returnGraphData,
      });
    }
  }

  return results;
}

/**
 * Takes the test schema/cases and builds full expected results.
 * Removes dynamic keys.
 */
export function generateAllResults(schemas) {
  return schemas
    .filter((schema) => !schema.dynamicKeyParts)
    .map((schema) => {
      return {
        name: schema.name,
        key: schema.key,
        value: schema.expectedResult,
      };
    });
}
