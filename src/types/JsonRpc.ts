export interface JsonRpc {
  jsonrpc: '2.0';
  method: 'eth_call';
  params: [
    {
      to: string;
      gas: string;
      gasPrice: string;
      value: string;
      data;
    },
  ];
  id: number;
}
