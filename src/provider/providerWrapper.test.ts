import assert from 'assert';

import { ProviderWrapper } from './providerWrapper';

const erc725AccountAddress = '0x214be121bB52e6909c5158579b3458f8760f1b2f';
const defaultGas = 2_000_000;

describe('ProviderWrapper', () => {
  describe('#getOwner', () => {
    it('should return an address', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(null, {
            result:
              '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
          });
        },
      };
      const ethSource = new ProviderWrapper(mockProvider, defaultGas);

      const owner = await ethSource.getOwner(erc725AccountAddress);
      assert.deepStrictEqual(
        owner,
        '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4',
      );
    });

    it('should throw when promise was rejected', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(new Error('some error'));
        },
      };
      const ethSource = new ProviderWrapper(mockProvider, defaultGas);

      try {
        await ethSource.getOwner(erc725AccountAddress);
      } catch (error: any) {
        assert.deepStrictEqual(error.message, 'some error');
      }
    });

    it('should throw when promise returned error', async () => {
      const mockProvider = {
        send: (_payload, cb) => {
          cb(null, {
            error: new Error('some error'),
          });
        },
      };
      const ethSource = new ProviderWrapper(mockProvider, defaultGas);

      try {
        await ethSource.getOwner(erc725AccountAddress);
      } catch (error: any) {
        assert.deepStrictEqual(error.message, 'some error');
      }
    });
  });
});
