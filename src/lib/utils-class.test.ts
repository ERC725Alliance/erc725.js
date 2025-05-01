import assert from 'assert'

import type { ERC725JSONSchema } from '../types/ERC725JSONSchema'
import { mockSchema } from '../../test/mockSchema'
import ERC725, { supportsInterface } from '..'
import { INTERFACE_IDS_0_12_0 } from '../constants/interfaces'
import { expect } from 'chai'
import Web3 from 'web3'
import { responseStore } from '../../test/serverHelpers'
import { getInterfaceByName } from './detector'

const erc725Utils = new ERC725(mockSchema)
describe('utils (on ERC725 class)', () => {
  describe('encodeData', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'LSP12IssuedAssets[]',
        key: '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        keyType: 'Array',
        valueContent: 'Address',
        valueType: 'address',
      },
      {
        name: 'LSP1UniversalReceiverDelegate',
        key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        keyType: 'Singleton',
        valueType: 'address',
        valueContent: 'Address',
      },

      {
        name: 'LSP3Profile',
        key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        keyType: 'Singleton',
        valueType: 'bytes',
        valueContent: 'JSONURL',
      },
    ]

    const expectedResult = {
      keys: [
        '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
      ],
      values: ['0x1183790f29be3cdfd0a102862fea1a4a30b3adab'],
    }

    it('encodes data with named key - [array input]', () => {
      const encodedDataByNamedKey = erc725Utils.encodeData(
        [
          {
            keyName: 'LSP1UniversalReceiverDelegate',
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas
      )
      assert.deepStrictEqual(encodedDataByNamedKey, expectedResult)
    })

    it('encodes data with named key - [non array input]', () => {
      const encodedDataByNamedKey = erc725Utils.encodeData(
        {
          keyName: 'LSP1UniversalReceiverDelegate',
          value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
        },
        schemas
      )
      assert.deepStrictEqual(encodedDataByNamedKey, expectedResult)
    })

    it('encodes data with hashed key', () => {
      const hashedKey =
        '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47'

      const encodedDataByHashKey = erc725Utils.encodeData(
        [
          {
            keyName: hashedKey,
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas
      )
      assert.deepStrictEqual(encodedDataByHashKey, expectedResult)
    })

    it('encodes data with hashed key without 0x prefix', () => {
      const hashedKey =
        '0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47'

      const encodedDataByHashKeyWithout0xPrefix = erc725Utils.encodeData(
        [
          {
            keyName: hashedKey,
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas
      )

      assert.deepStrictEqual(
        encodedDataByHashKeyWithout0xPrefix,
        expectedResult
      )
    })

    it('encodes array', () => {
      const encodedDataWithMultipleKeys = erc725Utils.encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: ['0xa3e6F38477D45727F6e6f853Cdb479b0D60c0aC9'],
          },
        ],
        schemas
      )

      assert.deepStrictEqual(encodedDataWithMultipleKeys, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
        ],
        values: [
          '0x00000000000000000000000000000001',
          '0xa3e6f38477d45727f6e6f853cdb479b0d60c0ac9',
        ],
      })
    })

    it('encodes array', () => {
      const addressArray = [
        '0x6413255d24b8fbf81d2d65214c485c694cb3d4b4',
        '0xd6c68c2c94af899ce43ff1863693016a711ae7c7',
        '0x79b698f4bc3051f18b5f94046f09d70823a8fd44',
        '0x72bebf88546525a5888f188b390701bb0fd9b1a5',
        '0x882aca051979e32e787e8815d9880759f91e7124',
        '0x78827c8f8205072858a8cce39b8724d948327ba0',
        '0xe27cd9c132677cdce2e9efa43b040de35ceff069',
        '0x072616745957b45c8989e12b9563390fafac4ebe',
        '0xfd5a7c50c0cf665a772407af3f05522784589c44',
        '0x13de082cf8a499eee75b0681cfa0141a145f15d9',
        '0xe3610d0eb167fe7a7b7c25d0aee8874eb8b113ef',
      ]
      const encodedDataWithMultipleKeys = erc725Utils.encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: addressArray,
          },
        ],
        schemas
      )

      assert.deepStrictEqual(encodedDataWithMultipleKeys, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000002',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000003',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000004',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000005',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000006',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000007',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000008',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000009',
          '0x7c8c3416d6cda87cd42c71ea1843df280000000000000000000000000000000a',
        ],
        values: ['0x0000000000000000000000000000000b', ...addressArray],
      })
    })

    it('encodes array length only if giving a number', () => {
      const length = 5

      const encodedArrayLengthKey = erc725Utils.encodeData(
        [
          {
            keyName: 'LSP12IssuedAssets[]',
            value: length,
          },
        ],
        schemas
      )

      assert.deepStrictEqual(encodedArrayLengthKey, {
        keys: [
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
        ],
        values: ['0x00000000000000000000000000000005'],
      })
    })

    it('encodes multiple keys', () => {
      const encodedMultipleKeys = erc725Utils.encodeData(
        [
          {
            keyName: 'LSP3Profile',
            value: {
              verification: {
                method: 'keccak256(utf8)',
                data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
              },
              url: 'ipfs://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
            },
          },
          {
            keyName: 'LSP12IssuedAssets[]',
            value: [
              '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
              '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
            ],
          },
          {
            keyName: 'LSP1UniversalReceiverDelegate',
            value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
          },
        ],
        schemas
      )

      assert.deepStrictEqual(encodedMultipleKeys, {
        keys: [
          '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          '0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000000',
          '0x7c8c3416d6cda87cd42c71ea1843df2800000000000000000000000000000001',
          '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
        ],
        values: [
          '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361697066733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
          '0x00000000000000000000000000000002',
          '0xd94353d9b005b3c0a9da169b768a31c57844e490',
          '0xdaea594e385fc724449e3118b2db7e86dfba1826',
          '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
        ],
      })
    })

    it('encodes dynamic keys', () => {
      const address = '0x78c964cd805233eb39f2db152340079088809725'

      const encodedDynamicKeys = erc725Utils.encodeData(
        [
          {
            keyName: 'DynamicKey:<address>',
            dynamicKeyParts: [address],
            value: '0xc57390642767fc9adb0e4211fac735abe2edcfde',
          },
          {
            keyName: 'DynamicKey:<bytes4>:<string>',
            dynamicKeyParts: ['0x11223344', 'Summer'],
            value: '0x5bed9e061cea8b4be17d3b5ea85de62f483a40fd',
          },
        ],
        [
          {
            name: 'DynamicKey:<address>',
            key: '0x0fb367364e1852abc5f20000<address>',
            keyType: 'Mapping',
            valueType: 'bytes',
            valueContent: 'Address',
          },
          {
            name: 'DynamicKey:<bytes4>:<string>',
            key: '0xForDynamicKeysThisFieldIsIrrelevantAndWillBeOverwriten',
            keyType: 'Mapping',
            valueType: 'bytes',
            valueContent: 'Address',
          },
        ]
      )

      assert.deepStrictEqual(encodedDynamicKeys, {
        keys: [
          `0x0fb367364e1852abc5f20000${address.replace('0x', '')}`,
          '0x0fb367364e181122334400007746e4c8ba6f946d9f51a1c9e539fb62598962aa',
        ],
        values: [
          '0xc57390642767fc9adb0e4211fac735abe2edcfde',
          '0x5bed9e061cea8b4be17d3b5ea85de62f483a40fd',
        ],
      })
    })
  })

  describe('encodeData with custom array length and starting index', () => {
    const schemas: ERC725JSONSchema[] = [
      {
        name: 'AddressPermissions[]',
        key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
        keyType: 'Array',
        valueType: 'address',
        valueContent: 'Address',
      },
    ]

    it('should be able to specify the array length + starting index', () => {
      const encodedArraySection = erc725Utils.encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: [
              '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
              '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
            ],
            totalArrayLength: 23,
            startingIndex: 21,
          },
        ],
        schemas
      )

      // Expected result with custom startingIndex and totalArrayLength
      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000015', // 21
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000016', // 22
        ],
        values: [
          '0x00000000000000000000000000000017', // 23
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
          '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
        ],
      }

      assert.deepStrictEqual(
        encodedArraySection,
        expectedResult,
        'Encoding with custom starting index and array length should match the expected result.'
      )
    })

    it('should throw if startingIndex is negative', () => {
      const encodeDataWithNegativeStartingIndex = () => {
        erc725Utils.encodeData(
          [
            {
              keyName: 'AddressPermissions[]',
              value: ['0x983abc616f2442bab7a917e6bb8660df8b01f3bf'],
              totalArrayLength: 1,
              startingIndex: -1,
            },
          ],
          schemas
        )
      }

      assert.throws(
        encodeDataWithNegativeStartingIndex,
        /Invalid `startingIndex`/,
        'Should throw an error for negative startingIndex'
      )
    })

    it('should throw if totalArrayLength is smaller than elements in provided value array', () => {
      const encodeDataWithLowerTotalArrayLength = () => {
        erc725Utils.encodeData(
          [
            {
              keyName: 'AddressPermissions[]',
              value: [
                '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
                '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
              ],
              totalArrayLength: 1, // 2 elements
              startingIndex: 0,
            },
          ],
          schemas
        )
      }

      assert.throws(
        encodeDataWithLowerTotalArrayLength,
        /Invalid `totalArrayLength`/,
        'Should throw an error for totalArrayLength smaller than the number of provided elements'
      )
    })

    it('should start from 0 if startingIndex is not provided', () => {
      const result = erc725Utils.encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: ['0x983abc616f2442bab7a917e6bb8660df8b01f3bf'],
            totalArrayLength: 1,
          },
        ],
        schemas
      )

      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
        ],
        values: [
          '0x00000000000000000000000000000001',
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
        ],
      }

      assert.deepStrictEqual(
        result,
        expectedResult,
        'Should encode starting from index 0 if startingIndex is not provided'
      )
    })

    it('should use the number of elements in value field if totalArrayLength is not provided', () => {
      const result = erc725Utils.encodeData(
        [
          {
            keyName: 'AddressPermissions[]',
            value: [
              '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
              '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
            ],
            // Not specifying totalArrayLength, it should default to the number of elements in the value array
            startingIndex: 0,
          },
        ],
        schemas
      )

      const expectedResult = {
        keys: [
          '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000000',
          '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000001',
        ],
        values: [
          '0x00000000000000000000000000000002',
          '0x983abc616f2442bab7a917e6bb8660df8b01f3bf',
          '0x56ecbc104136d00eb37aa0dce60e075f10292d81',
        ],
      }

      assert.deepStrictEqual(
        result,
        expectedResult,
        'should use the number of elements in value field if totalArrayLength is not provided'
      )
    })
  })

  describe('getSchema (using class api)', () => {
    it('should find key in schema used for instantiation', async () => {
      const schema: ERC725JSONSchema = {
        name: 'InstantiationSchema',
        key: '0xdbc90d23b2e4ff291c111a658864f9723a77b8c1f22b707e51a686413948206d',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      }

      const erc725 = new ERC725([schema])

      const foundSchema = erc725.getSchema(schema.key)

      assert.deepStrictEqual(foundSchema, schema)
    })
    it('should find key in schema provided as parameter', async () => {
      const schema: ERC725JSONSchema = {
        name: 'ParameterSchema',
        key: '0x777f55baf2e0c9f73d3bb456dfb8dbf6e609bf557969e3184c17ff925b3c402c',
        keyType: 'Singleton',
        valueContent: 'JSONURL',
        valueType: 'bytes',
      }

      const erc725 = new ERC725([])

      const foundSchema = erc725.getSchema(schema.key, [schema])

      assert.deepStrictEqual(foundSchema, schema)
    })
  })

  describe('encodeKeyName', () => {
    it('is available on instance and class', () => {
      assert.deepStrictEqual(
        erc725Utils.encodeKeyName('MyKeyName'),
        '0x35e6950bc8d21a1699e58328a3c4066df5803bb0b570d0150cb3819288e764b2'
      )
    })

    it('works for dynamic keys', () => {
      assert.deepStrictEqual(
        erc725Utils.encodeKeyName(
          'FavouriteFood:<address>',
          '0xa4FBbFe353124E6fa6Bb7f8e088a9269dF552EA2'
        ),
        '0x31145577efe228036af40000a4fbbfe353124e6fa6bb7f8e088a9269df552ea2'
      )
    })

    it('works for Array keys with index as `dynamicKeyParts', () => {
      assert.deepStrictEqual(
        erc725Utils.encodeKeyName('MusicPlaylist[]', 2),
        '0x03573598507fc76d82171baa336b7fd700000000000000000000000000000002'
      )
    })
  })

  describe('decodeMappingKey', () => {
    it('is available on instance and class', () => {
      assert.deepStrictEqual(
        erc725Utils.decodeMappingKey(
          '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
          'MyKeyName:<address>'
        ),
        [
          {
            type: 'address',
            value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
          },
        ]
      )
      assert.deepStrictEqual(
        erc725Utils.decodeMappingKey(
          erc725Utils.encodeKeyName('MyKeyName:<bytes16>', ['0x12345678']),
          'MyKeyName:<bytes16>'
        ),
        [
          {
            type: 'bytes16',
            value: '0x12345678000000000000000000000000',
          },
        ]
      )
      assert.deepStrictEqual(
        erc725Utils.decodeMappingKey(
          '0x35e6950bc8d21a1699e50000cafecafecafecafecafecafecafecafecafecafe',
          'MyKeyName:<address>'
        ),
        [
          {
            type: 'address',
            value: '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe',
          },
        ]
      )
      assert.throws(() => {
        erc725Utils.decodeMappingKey(
          erc725Utils.encodeKeyName('LSP8MetadataTokenURI:<string>', [
            'hello there',
          ]),
          // '0x1339e76a390b7b9ec9010000e753904c77f5a07e628eff190bbddad936aaffb2',
          // '0x6c2a998f88b72c27017768656c6c6f20776f726c640000000000000000000000',
          'LSP8MetadataTokenURI:<string>'
        )
      }, /String dynamic key parts cannot be decoded/)
    })
  })

  describe('supportsInterface', () => {
    const web3 = new Web3('https://rpc.testnet.lukso.network')

    it('it should return true if the contract supports the interface with name', async () => {
      const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
      const interfaceName = 'LSP0ERC725Account'
      const iid = getInterfaceByName(interfaceName)
      expect(iid).to.not.be.undefined

      responseStore.supportsInterfaces = [iid as `0x${string}`]

      const erc725Utils = new ERC725(
        mockSchema,
        contractAddress,
        web3.currentProvider
      )

      const doesSupportInterface =
        await erc725Utils.supportsInterface(interfaceName)

      expect(doesSupportInterface).to.be.true
    })

    it('it should return true if the contract supports the interface with name (global method)', async () => {
      const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
      const interfaceName = 'LSP0ERC725Account'
      const iid = getInterfaceByName(interfaceName)
      expect(iid).to.not.be.undefined

      responseStore.supportsInterfaces = [iid as `0x${string}`]

      const doesSupportInterface = await ERC725.supportsInterface(
        interfaceName,
        {
          address: contractAddress,
          rpcUrl: 'https://rpc.testnet.lukso.network',
        }
      )

      expect(doesSupportInterface).to.be.true
    })

    it('it should return true if the contract supports the interface with name (global method)', async () => {
      const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
      const interfaceName = 'LSP0ERC725Account'
      const iid = getInterfaceByName(interfaceName)
      expect(iid).to.not.be.undefined

      responseStore.supportsInterfaces = [iid as `0x${string}`]

      const doesSupportInterface = await supportsInterface(interfaceName, {
        address: contractAddress,
        rpcUrl: 'https://rpc.testnet.lukso.network',
      })

      expect(doesSupportInterface).to.be.true
    })

    it('it should return true if the contract supports the interface with name (global method gas)', async () => {
      const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
      const interfaceName = 'LSP0ERC725Account'
      const iid = getInterfaceByName(interfaceName)
      expect(iid).to.not.be.undefined

      responseStore.supportsInterfaces = [iid as `0x${string}`]

      const doesSupportInterface = await supportsInterface(interfaceName, {
        address: contractAddress,
        rpcUrl: 'https://rpc.testnet.lukso.network',
        gas: 100000,
      })

      expect(doesSupportInterface).to.be.true
    })

    it('it should return true if the contract supports the interface with interfaceId', async () => {
      const contractAddress = '0xcafecafecafecafecafecafecafecafecafecafe'
      const interfaceId = INTERFACE_IDS_0_12_0.LSP1UniversalReceiver

      responseStore.supportsInterfaces = [interfaceId as `0x${string}`]

      const erc725Utils = new ERC725(
        mockSchema,
        contractAddress,
        web3.currentProvider
      )

      const doesSupportInterface =
        await erc725Utils.supportsInterface(interfaceId)

      expect(doesSupportInterface).to.be.true
    })
  })
})
