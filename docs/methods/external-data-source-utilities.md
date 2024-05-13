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

## hashData

## isDataAuthentic
