/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function */

import { ProviderTypes } from '../types/provider';

export abstract class ProviderWrapper {
  type?: ProviderTypes;
  provider: any;

  constructor(provider) {
    this.provider = provider;
  }

  abstract getAllData(address: string, keys: string[]): Promise<any>;
  abstract getData(address: string, keyHash: string): Promise<any>;
  abstract getOwner(address: string): Promise<any>;
}
