export enum Method {
  GET_DATA = 'getData',
  DATA_COUNT = 'dataCount',
  ALL_DATA = 'allData',
  OWNER = 'owner',
}

export enum Encoding {
  BYTES = 'bytes',
  UINT256 = 'uint256',
  BYTES32_ARRAY = 'bytes32[]',
  ADDRESS = 'address',
}

export interface MethodData {
  sig: string;
  gas: string;
  gasPrice: string;
  value: string;
  returnEncoding: Encoding;
}
