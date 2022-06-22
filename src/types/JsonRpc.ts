export interface JsonRpc {
  jsonrpc: '2.0';
  method: 'eth_call';
  params: [
    {
      to: string;
      gas: string;
      value: string;
      data;
    },
    'latest',
  ];
  id: number;
}

export interface JsonRpcEthereumProvider {
  to: string;
  gas: string;
  value: string;
  data;
}
