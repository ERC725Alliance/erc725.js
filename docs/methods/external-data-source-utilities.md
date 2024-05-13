---
sidebar_position: 1
---

# External Data Source utilities (`VerifiableURI` and `JSONURI`)

## encodeDataSourceWithHash

```js
const myErc725 = new ERC725();
myErc725.encodeDataSourceWithHash(verification, dataSource);
```

OR

```js
ERC725.encodeDataSourceWithHash(verification, dataSource);
```

Encode a verifiableURI providing the hashing function of the json file (method), the hash of the json file (data) and the url where the json file is stored.

#### Parameters

| Name           | Type                          | Description                                                                                                              |
| :------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `verification` | `undefined` or `Verification` | Verification is an object containing the hashing function of the json file (method) and the hash of the json file (data) |
| `dataSource`   | `string`                      | The url where the json file is stored.                                                                                   |

<details>
    <summary>Types details</summary>

```js
interface Verification {
    method: SUPPORTED_VERIFICATION_METHODS | string;
    data: string;
    source?: string;
}

type SUPPORTED_VERIFICATION_METHODS =
    | SUPPORTED_VERIFICATION_METHOD_STRINGS
    | SUPPORTED_VERIFICATION_METHOD_HASHES;

enum SUPPORTED_VERIFICATION_METHOD_STRINGS {
    KECCAK256_UTF8 = 'keccak256(utf8)',
    KECCAK256_BYTES = 'keccak256(bytes)',
}

enum SUPPORTED_VERIFICATION_METHOD_HASHES {
    HASH_KECCAK256_UTF8 = '0x6f357c6a',
    HASH_KECCAK256_BYTES = '0x8019f9b1',
}
```

</details>

#### Returns

| Name            | Type   | Description       |
| :-------------- | :----- | :---------------- |
| `verifiableURI` | string | The verifiableURI |

#### Examples

<details>
    <summary>Encode a <code>VerifiableURI</code> providing the hashing function, the JSON hash and the uploaded URL</summary>

```javascript title="Encode a VerifiableURI providing the hashing function, the JSON hash and the uploaded URL"
const verifiableURI = myErc725.encodeDataSourceWithHash(
  {
    method: 'keccak256(utf8)',
    data: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
  },
  'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
);
/**
0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178
*/
```

</details>

## decodeDataSourceWithHash

```js
const myErc725 = new ERC725();
myErc725.decodeDataSourceWithHash(verifiableURI);
```

```js
ERC725.decodeDataSourceWithHash(verifiableURI);
```

Decode a verifiableURI into the hash function of the json file, the hash of the json file and the url where the json file is stored.

#### Parameters

| Name            | Type     | Description       |
| :-------------- | :------- | :---------------- |
| `verifiableURI` | `string` | The verifiableURI |

#### Returns

| Name                   | Type              | Description                                                                                                |
| :--------------------- | :---------------- | :--------------------------------------------------------------------------------------------------------- |
| `decodedVerifiableURI` | `URLDataWithHash` | Object containing the hash function, the hash of the JSON file and the link where the json file is stored. |

<details>
    <summary>Types details</summary>

```js
interface URLDataWithHash {
  verification: Verification;
  url: string
}

interface Verification {
method: SUPPORTED_VERIFICATION_METHODS | string;
data: string;
source?: string;
}

type SUPPORTED_VERIFICATION_METHODS =
| SUPPORTED_VERIFICATION_METHOD_STRINGS
| SUPPORTED_VERIFICATION_METHOD_HASHES;

enum SUPPORTED_VERIFICATION_METHOD_STRINGS {
KECCAK256_UTF8 = 'keccak256(utf8)',
KECCAK256_BYTES = 'keccak256(bytes)',
}

enum SUPPORTED_VERIFICATION_METHOD_HASHES {
HASH_KECCAK256_UTF8 = '0x6f357c6a',
HASH_KECCAK256_BYTES = '0x8019f9b1',
}

```

</details>

#### Examples

<details>
    <summary>Decode a <code>VerifiableURI</code></summary>

```javascript title="Decode a VerifiableURI"
const decodedVerifiableURI = myErc725.decodeDataSourceWithHash(
  '0x00006f357c6a0020820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
);
/**
verification: {
    data: '820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
    method: 'keccak256(utf8)',
  }
url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx'
*/
```

</details>

## getVerificationMethod

```js
const myErc725 = new ERC725();
myErc725.getVerificationMethod(nameOrSig);
```

```js
ERC725.getVerificationMethod(nameOrSig);
```

```js
import { getVerificationMethod } from '@erc725/erc725.js';
getVerificationMethod(nameOrSig);
```

Get the verification method definition, including the name, signature and related method.

method: (data: string | object | Uint8Array | null) => string;
name: SUPPORTED_VERIFICATION_METHOD_STRINGS;
sig: SUPPORTED_VERIFICATION_METHODS;

#### Parameters

| Name        | Type   | Description                                 |
| :---------- | :----- | :------------------------------------------ |
| `nameOrSig` | string | The 4 bytes hex of the verification method. |

#### Returns

| Name | Type   | Description                                                                             |
| :--- | :----- | :-------------------------------------------------------------------------------------- |
|      | object | An object containing the name, signature and method related to the verification method. |

### Example

```javascript title="Example of the method"
getVerificationMethod('0x6f357c6a');
/*
{
  method: [Function: keccak256Method],
  name: 'keccak256(utf8)',
  sig: '0x6f357c6a'
}
*/
```

## isDataAuthentic

```js
const myErc725 = new ERC725();
ERC725.isDataAuthentic(data, verificationOptions);
```

```js
ERC725.isDataAuthentic(data, verificationOptions);
```

```js
import { isDataAuthentic } from '@erc725/erc725.js';

isDataAuthentic(data, verificationOptions);
```

Hashes the `data` passed as parameter using the specified hashing functions (available under `method` in the `verificationOption` object) and compares the result with the provided hash.

:::info
This method will console an error if the hash provided as `data` and the expected hash obtained using the verification method do not match.
:::

#### Parameters

| Name                  | Type                     | Description                         |
| :-------------------- | :----------------------- | :---------------------------------- |
| `data`                | `string` or `Uint8Array` | The data to be hashed and verified. |
| `verificationOptions` | `Verification`           | An object as defined below          |

<details>
    <summary>Types details</summary>

```js
  KECCAK256_UTF8 = ,
  KECCAK256_BYTES = ,
  HASH_KECCAK256_UTF8 = ,
  HASH_KECCAK256_BYTES = ,

export interface Verification {
  data: string;
  method: 'keccak256(utf8)' | 'keccak256(bytes)' | '0x6f357c6a' | '0x8019f9b1' | string;
  source?: string;
}
```

</details>

#### Returns

| Name | Type      | Description                                                                                   |
| :--- | :-------- | :-------------------------------------------------------------------------------------------- |
|      | `boolean` | `true` if the data is authentic according to the verification method used, `false` otherwise. |

### Example

<details>
    <summary>JSON data to verify from <code>data.json</code></summary>

```json
[
  {
    "name": "LSP3Profile",
    "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    "value": {
      "LSP3Profile": {
        "name": "test",
        "description": "",
        "tags": ["profile"],
        "links": [],
        "profileImage": [
          {
            "width": 1024,
            "height": 709,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x6a0a28680d65b69f5696859be7e0fcebbbcf0df47f1f767926de35402c7d525c"
            },
            "url": "ipfs://QmVUYyft3j2JVrG4RzDe1Qx7K5gNtJGFhrExHQFeiRXz1C"
          },
          {
            "width": 640,
            "height": 443,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x7cd399f2a2552aa5cd21b1584a98db3efa39c701c311c38a60c680343cfa6d82"
            },
            "url": "ipfs://QmeU8FUZC9F1qMYmcWyBhfGqaf7g3kLzGb4xBpoCfyVLZW"
          },
          {
            "width": 320,
            "height": 221,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x272d2e57ae1710ac7c5e3d1c9f9d24f48954ad43d0e821f8bd041a4734e309a5"
            },
            "url": "ipfs://QmdViKPWYhZv7u86z7HBTgAkTAwEkNSRi1VkYEU8K5yUsH"
          },
          {
            "width": 180,
            "height": 124,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x1a464ff7e0eff05da98ed309a25195d8666b6211a5dfa2214865c3fd50ead810"
            },
            "url": "ipfs://QmXZUCW6MqCNfYJEFsi54Vkj6PRrUoiPjzTuA2mWtas3RJ"
          }
        ],
        "backgroundImage": [
          {
            "width": 1800,
            "height": 1012,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x3f6be73b35d348fb8f0b87a47d8c8b6b9db8858ee044cb13734cdfe5d28031d8"
            },
            "url": "ipfs://QmfLCPmL31f31RRB4R7yoTg3Hsk5PjrWyS3ZaaYyhRPT4n"
          },
          {
            "width": 1024,
            "height": 576,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0xcb57ed802bcd7dc4964395a609b3a0f557c5f46a602b28b058b9587bb77bb54f"
            },
            "url": "ipfs://QmPoPEaoGNVYhiMTwBWp6XzLPRXyuLjZWnuMobdCbfqsU9"
          },
          {
            "width": 640,
            "height": 360,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x57e8039288c3e1a7f891c839e03805984ab36524b710656f072492c1c8ebd967"
            },
            "url": "ipfs://QmU3pDA4eDNPMeARsJXxKaZsMC5MgFLgzGQccnydbU9WLV"
          },
          {
            "width": 320,
            "height": 180,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0x2bebf9baac33d719bbd3b481b1af468701409ad7578f84be04e8f7563d5a1509"
            },
            "url": "ipfs://QmcKtenPsRvrqZJQ1gLCdUFkex4i9DGp7RFvucb9nbkzsz"
          },
          {
            "width": 180,
            "height": 101,
            "verification": {
              "method": "keccak256(bytes)",
              "data": "0xe32154c03c892d7c41c91220b8757ec5b7847eb2dd91413f7238b0c25f55b475"
            },
            "url": "ipfs://QmU7ueJ467E9HRahaqQmSPhvkTkMhCLXRxV45P4kmMk6vm"
          }
        ]
      }
    }
  }
]
```

</details>

```typescript title="isDataAuthentic example"
import jsonData from './data.json';

isDataAuthentic(jsonData, {
  data: '0xdb864ed42104cee179785036cb4ff1183ebc57e5532ae766ad8533fa48acfbb3',
  method: 'keccak256(utf8)',
});
// true

isDataAuthentic(jsonData, {
  data: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  method: 'keccak256(utf8)',
});
// false
```
