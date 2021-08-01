import assert from 'assert';
import {} from 'web3-utils';
// eslint-disable-next-line import/no-extraneous-dependencies

import Web3Source from './web3Source';

describe('Web3Source', () => {
  it('#getOwner should return an address', async () => {
    const provider = {
      send: (_payload, cb) => {
        cb(null, {
          result:
            '0x000000000000000000000000a78e0e7c9b1b36f7e25c5ccdfdba005ec37eadf4',
        });
      },
    };
    const ethSource = new Web3Source(provider);

    const owner = await ethSource.getOwner(
      '0x214be121bB52e6909c5158579b3458f8760f1b2f',
    );
    assert.deepStrictEqual(owner, '0xA78E0E7C9b1B36F7E25C5CcDfdbA005Ec37eadf4');
  });

  it('#getOwner should throw when promise was rejected', async () => {
    const provider = {
      send: (_payload, cb) => {
        cb(new Error('some error'));
      },
    };
    const ethSource = new Web3Source(provider);

    try {
      await ethSource.getOwner('0x214be121bB52e6909c5158579b3458f8760f1b2f');
    } catch (error) {
      assert.deepStrictEqual(error.message, 'some error');
    }
  });

  it('#getOwner should throw when promise returned error', async () => {
    const provider = {
      send: (_payload, cb) => {
        cb(null, {
          error: new Error('some error'),
        });
      },
    };
    const ethSource = new Web3Source(provider);

    try {
      await ethSource.getOwner('0x214be121bB52e6909c5158579b3458f8760f1b2f');
    } catch (error) {
      assert.deepStrictEqual(error.message, 'some error');
    }
  });
});
