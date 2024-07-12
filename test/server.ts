import { http } from 'msw';
import { setupServer } from 'msw/node';

const CONTENT_TYPE = 'Content-Type';
export const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

const handlers = [
  http.get(
    `${IPFS_GATEWAY}/QmbErKh3FjsAR6YjsTjHZNm6McDp6aRt82Ftcv9AJJvZbd`,
    async () => {
      return new Response(
        `{"LSP3Profile":{"profileImage":"ipfs://QmYo8yg4zzmdu26NSvtsoKeU5oVR6h2ohmoa2Cx5i91mPf","backgroundImage":"ipfs://QmZF5pxDJcB8eVvCd74rsXBFXhWL3S1XR5tty2cy1a58Ew","description":"Beautiful clothing that doesn't cost the Earth. A sustainable designer based in London Patrick works with brand partners to refocus on systemic change centred around creative education. "}}`,
        { headers: { [CONTENT_TYPE]: 'application/json' } },
      );
    },
  ),
];

setupServer(...handlers);
