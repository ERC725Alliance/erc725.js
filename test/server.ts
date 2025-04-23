import { http } from 'msw';
import { setupServer } from 'msw/node';

const CONTENT_TYPE = 'Content-Type';
export const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

const url = new URL(
  '/ipfs/QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd',
  IPFS_GATEWAY,
).toString();
console.log('url', url);
const handlers = [
  http.get(url, async () => {
    console.log('Mocking IPFS response');
    return new Response(
      `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`,
      { headers: { [CONTENT_TYPE]: 'application/json' } },
    );
  }),
  http.post('https://rpc.testnet.lukso.network/', async ({ request }) => {
    const data: {
      params: Array<Record<string, string>>;
      method: string;
    } = (await request.json()) as {
      params: Array<Record<string, string>>;
      method: string;
    };
    console.log('Mocking Lukso response', data);
    switch (data.method) {
      case 'eth_call': {
        const sig = data.params[0]?.data.slice(0, 10);
        switch (sig) {
          case '0x01ffc9a7':
          case '0x1626ba7e':
            return Response.json({
              ...data,
              result: '0x1234',
            });
        }
        break;
      }
    }
    return Response.error();
  }),
  http.post('https://rpc.l14.lukso.network/', async ({ request }) => {
    const data: {
      params: Array<Record<string, string>>;
      method: string;
    } = (await request.json()) as {
      params: Array<Record<string, string>>;
      method: string;
    };
    console.log('Mocking Lukso response', data);
    switch (data.method) {
      case 'eth_call': {
        const sig = data.params[0]?.data.slice(0, 10);
        switch (sig) {
          case '0x01ffc9a7':
          case '0x1626ba7e':
            return Response.json({
              ...data,
              result: '0x1234',
            });
        }
        break;
      }
    }
    return Response.error();
  }),
];

setupServer(...handlers).listen();
