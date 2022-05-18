import assert from 'assert';

import { EthereumProviderWrapper } from './ethereumProviderWrapper';

const erc725AccountAddress = '0x214be121bB52e6909c5158579b3458f8760f1b2f';

describe('EthereumProviderWrapper', () => {
  describe('#getOwner', () => {
    it('should return an address', async () => {
      const provider = {
        request: () =>
          new Promise((resolve) => {
            resolve(
              '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
            );
          }),
      };
      const ethSource = new EthereumProviderWrapper(provider);

      const ownerAddress = await ethSource.getOwner(erc725AccountAddress);
      assert.deepStrictEqual(
        ownerAddress,
        '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4',
      );
    });

    it('should throw when promise was rejected', async () => {
      const provider = {
        request: () =>
          // eslint-disable-next-line no-promise-executor-return
          new Promise((_resolve, reject) => reject(new Error('some error'))),
      };
      const ethSource = new EthereumProviderWrapper(provider);

      try {
        await ethSource.getOwner(erc725AccountAddress);
      } catch (error: any) {
        assert.deepStrictEqual(error.message, 'some error');
      }
    });

    it('should return a getData result', async () => {
      const ethResults = [
        '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6aa34e3d9c3d971121a8616f071b07d2f34fce1da803f7c7ce711e73a28520066f697066733a2f2f516d64745753567a5162555a383269695a4d59684d5657414766446b7732665a52486a634a526e424875617a543800000000000000',
      ];
      const mockProvider = {
        request: () => {
          return new Promise((resolve) => {
            resolve(ethResults.shift());
          });
        },
      };
      const ethSource = new EthereumProviderWrapper(mockProvider);

      const result = await ethSource.getData(
        '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
        '0x7cE38d75e4cC42f2e947DAcebaB8bb882bA6fC68',
      );
      assert.deepStrictEqual(
        result,
        '0x6f357c6aa34e3d9c3d971121a8616f071b07d2f34fce1da803f7c7ce711e73a28520066f697066733a2f2f516d64745753567a5162555a383269695a4d59684d5657414766446b7732665a52486a634a526e424875617a5438',
      );
    });
  });
});
