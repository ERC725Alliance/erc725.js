import assert from 'assert'

import { ProviderWrapper } from './providerWrapper'
import Web3 from 'web3'
import ERC725 from '..'

const erc725AccountAddress = '0x214be121bB52e6909c5158579b3458f8760f1b2f'
const defaultGas = 1_000_000

describe('ProviderWrapper', () => {
  describe('fail call', () => {
    it('should throw when provider is not defined', async () => {
      const web3 = new Web3('https://rpc.testnet.lukso.network')
      const ethSource = new ProviderWrapper(web3.currentProvider, defaultGas)

      try {
        await ethSource.callContract({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [],
        } as any)
        assert.fail('Expected error not thrown')
      } catch (error: any) {
        assert.deepStrictEqual(error.message, 'Sig not supported')
      }
    })
  })
  describe('#getOwner', () => {
    it('should return an address', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(null, {
            result:
              '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
          })
        },
      }
      const ethSource = new ProviderWrapper(mockProvider, defaultGas)

      const owner = await ethSource.getOwner(erc725AccountAddress)
      assert.deepStrictEqual(
        owner,
        '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4'
      )
    })

    it('should return an address', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(null, {
            result:
              '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
          })
        },
      }

      const erc725 = new ERC725([], erc725AccountAddress, mockProvider)
      const owner = await erc725.getOwner(erc725AccountAddress)
      assert.deepStrictEqual(
        owner,
        '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4'
      )

      const owner2 = await erc725.getOwner()
      assert.deepStrictEqual(
        owner2,
        '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4'
      )
    })

    it('should throw when promise was rejected', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(new Error('some error'))
        },
      }
      const ethSource = new ProviderWrapper(mockProvider, defaultGas)

      try {
        await ethSource.getOwner(erc725AccountAddress)
      } catch (error: any) {
        assert.deepStrictEqual(error.message, 'some error')
      }
    })

    it('should throw when promise returned error', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(null, {
            error: new Error('some error'),
          })
        },
      }
      const ethSource = new ProviderWrapper(mockProvider, defaultGas)

      try {
        await ethSource.getOwner(erc725AccountAddress)
      } catch (error: any) {
        // console.log(error);
        assert.deepStrictEqual(error.message, 'some error')
      }
    })
  })
})
