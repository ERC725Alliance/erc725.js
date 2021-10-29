export enum Method {
  GET_DATA_LEGACY = 'getDataLegacy', // For legacy ERC725 with interface id: 0x2bd57b73 NOTE: I had to add Legacy at the end so the map keys stays unique
  GET_DATA = 'getData', // For latest ERC725 with interface id: 0x5a988c0f
  DATA_COUNT = 'dataCount',
  ALL_DATA = 'allData',
  OWNER = 'owner',
  SUPPORTS_INTERFACE = 'supportsInterface',
}

export enum Encoding {
  BYTES = 'bytes',
  BOOL = 'bool',
  UINT256 = 'uint256',
  BYTES32_ARRAY = 'bytes32[]',
  BYTES_ARRAY = 'bytes[]',
  ADDRESS = 'address',
}

export interface MethodData {
  sig: string;
  gas: string;
  gasPrice: string;
  value: string;
  returnEncoding: Encoding;
}
