import assert from 'assert';

import { EthereumProviderWrapper } from './ethereumProviderWrapper';

const erc725AccountAddress = '0x214be121bB52e6909c5158579b3458f8760f1b2f';

describe('EthereumProviderWrapper', () => {
  it('#getOwner should return an address', async () => {
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

  it('#getOwner should throw when promise was rejected', async () => {
    const provider = {
      request: () =>
        new Promise((_resolve, reject) => reject(new Error('some error'))),
    };
    const ethSource = new EthereumProviderWrapper(provider);

    try {
      await ethSource.getOwner(erc725AccountAddress);
    } catch (error) {
      assert.deepStrictEqual(error.message, 'some error');
    }
  });
});
