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
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { decodeMappingKey } from './decodeMappingKey';

describe('decodeDynamicKeyParts', () => {
  const records = [
    {
      key: {
        name: 'MyKeyName:<address>',
        encoded:
          '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
      },
      dynamicKeyParts: [
        {
          type: 'address',
          value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
        },
      ],
    },
    {
      key: {
        name: 'MyKeyName:<uint32>',
        encoded:
          '0x35e6950bc8d21a1699e5000000000000000000000000000000000000f342d33d',
      },
      dynamicKeyParts: [{ type: 'uint32', value: 4081242941 }],
    },
    {
      key: {
        name: 'MyKeyName:<bytes4>',
        encoded:
          '0x35e6950bc8d21a1699e5000000000000000000000000000000000000abcd1234',
      },
      dynamicKeyParts: [{ type: 'bytes4', value: 'abcd1234' }],
    },
    {
      key: {
        name: 'MyKeyName:<bytes32>',
        encoded:
          '0x35e6950bc8d21a1699e50000aaaabbbbccccddddeeeeffff1111222233334444',
      },
      dynamicKeyParts: [
        {
          type: 'bytes32',
          value: 'aaaabbbbccccddddeeeeffff1111222233334444',
        },
      ],
    },
    {
      key: {
        name: 'MyKeyName:<bool>',
        encoded:
          '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000001',
      },
      dynamicKeyParts: [{ type: 'bool', value: true }],
    },
    {
      key: {
        name: 'MyKeyName:<bool>',
        encoded:
          '0x35e6950bc8d21a1699e500000000000000000000000000000000000000000000',
      },
      dynamicKeyParts: [{ type: 'bool', value: false }],
    },
    {
      key: {
        name: 'MyKeyName:MyMapName:<address>',
        encoded:
          '0x35e6950bc8d275060e3c0000cafecafecafecafecafecafecafecafecafecafe',
      },
      dynamicKeyParts: [
        {
          type: 'address',
          value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
        },
      ],
    },
    {
      key: {
        name: 'MyKeyName:<bytes2>:<uint32>',
        encoded:
          '0x35e6950bc8d20000ffff000000000000000000000000000000000000f342d33d',
      },
      dynamicKeyParts: [
        { type: 'bytes2', value: 'ffff' },
        { type: 'uint32', value: 4081242941 },
      ],
    },
    {
      key: {
        name: 'MyKeyName:<address>:<address>',
        encoded:
          '0x35e6950bc8d2abcdef110000cafecafecafecafecafecafecafecafecafecafe',
      },
      dynamicKeyParts: [
        {
          type: 'address',
          value: '0x00000000000000000000000000000000AbCDeF11',
        },
        {
          type: 'address',
          value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
        },
      ],
    },
    {
      key: {
        name: 'MyKeyName:MyMapName:<bytes32>',
        encoded:
          '0x35e6950bc8d275060e3c0000aaaabbbbccccddddeeeeffff1111222233334444',
      },
      dynamicKeyParts: [
        {
          type: 'bytes32',
          value: 'aaaabbbbccccddddeeeeffff1111222233334444',
        },
      ],
    },
    {
      key: {
        name: 'MyKeyName:<bytes32>:<bool>',
        encoded:
          '0x35e6950bc8d2aaaabbbb00000000000000000000000000000000000000000001',
      },
      dynamicKeyParts: [
        { type: 'bytes32', value: 'aaaabbbb' },
        { type: 'bool', value: true },
      ],
    },
  ];

  it('decodes each dynamic key part', () => {
    records.forEach((record) => {
      const decodedDynamicKeyParts = decodeMappingKey(
        record.key.encoded,
        record.key.name,
      );
      expect(record.dynamicKeyParts.length).to.equal(
        decodedDynamicKeyParts.length,
      );
      record.dynamicKeyParts.forEach((keyPart, index) => {
        expect(keyPart.type).to.equal(decodedDynamicKeyParts[index].type);
        expect(keyPart.value).to.equal(decodedDynamicKeyParts[index].value);
      });
    });
  });

  it('decodes each dynamic key part when schema as a param', () => {
    const schema = {
      name: 'MyKeyName:<address>',
      key: '0x',
      keyType: 'Singleton',
      valueType: 'bytes',
      valueContent: 'JSONURL',
    };
    const decodedDynamicKeyParts = decodeMappingKey(
      '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
      schema.name,
    );
    expect(decodedDynamicKeyParts.length).to.equal(1);
    expect(decodedDynamicKeyParts[0].type).to.equal('address');
    expect(decodedDynamicKeyParts[0].value).to.equal(
      '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
    );
  });

  it("decodes properly if only hex key without '0x'", () => {
    const decodedDynamicKeyParts = decodeMappingKey(
      '35e6950bc8d21a1699e500000000000000000000000000000000000000000001',
      'MyKeyName:<bool>',
    );
    expect(decodedDynamicKeyParts[0].value).to.equal(true);
  });

  it('throws if not hex encoded key', () => {
    expect(() =>
      decodeMappingKey(
        '0x3234535343fXXWGWXWDSWDAEDFAEDr5434534grdgrdggrdgdrgdgrd098594334',
        'MyKeyName:<bool>',
      ),
    ).to.throw('Invalid encodedKey, must be a hexadecimal value');
  });

  it('throws if incorrect length key', () => {
    expect(() =>
      decodeMappingKey(
        '0x35e6950bc8d21a1699e50000000000000000000000000000000000000000000135e6',
        'MyKeyName:<bool>',
      ),
    ).to.throw(
      'Invalid encodedKey length, key must be 32 bytes long hexadecimal value',
    );
  });
});
