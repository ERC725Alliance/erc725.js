# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.27.3](https://github.com/ERC725Alliance/erc725.js/compare/v0.27.2...v0.27.3) (2025-05-13)


### Bug Fixes

* [CompactBytesArray] type of arrays only work at the end of a tuple ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Add array support inside of tuples ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Add test case to cover https://github.com/ERC725Alliance/erc725.js/issues/499 ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Add testing using legacy RPC provider supporting send(payload, callback) in addition to supporting async send(payload). We don't currently use async send(method, params) at all. ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Allow external spec for fetch/convert ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Apply suggestions from review ([6847ac6](https://github.com/ERC725Alliance/erc725.js/commit/6847ac6042f7330d2ac14d6dea270fac9eb8575f))
* Capture final coverage for the last commit ([79b89a4](https://github.com/ERC725Alliance/erc725.js/commit/79b89a4c57e8c3e106ee407c850bbf158898044f))
* Change to version 20 and 22 of node. ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Cleanup old eslint and mov msw to be properly in devDeps. Also do some upgrades and npm audit checks. ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Disable codecov badge since we don't currently have it. ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Found some more testscripts missing and unexpected schema concat (provided needs to be first.) ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Improve some coverage ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Make all test scripts pass, use real msw, test ethers and viem. ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))
* Remove jest and @types/jest from package.json (not needed) ([e1426d8](https://github.com/ERC725Alliance/erc725.js/commit/e1426d8755805723e57052607926e3d336149fd0))
* Repair test script to remove build dependency ([b21997b](https://github.com/ERC725Alliance/erc725.js/commit/b21997be2bd07714ca208bbe40cf580028078124))
* Repair vulnerabilities ([e2b7415](https://github.com/ERC725Alliance/erc725.js/commit/e2b74153603cc9d01f94b27ed358590f088b86a1))

## [0.27.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.27.1...v0.27.2) (2024-10-23)


### Bug Fixes

* allow `number` in types for `dynamicKeyParts` ([225a0b4](https://github.com/ERC725Alliance/erc725.js/commit/225a0b47035d301098dc24d510d599216257593c))
* Compile temporary patch ([f5402b8](https://github.com/ERC725Alliance/erc725.js/commit/f5402b854f0b23de2867a172f1e21e56bba44070))
* Make explicitely sure that method === 0x0000000 is also ignored in isDataAuthentic ([a39b965](https://github.com/ERC725Alliance/erc725.js/commit/a39b965bea3bfb402cad0be7cdab2accc2ce521c))
* Repair patchIPFSUtlsIfApplication to only replace if the URL starts with ipfs:// ([27da039](https://github.com/ERC725Alliance/erc725.js/commit/27da039ca7055875e7bea5b129987f1da5b90376))

## [0.27.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.27.0...v0.27.1) (2024-07-12)


### Bug Fixes

* Normalize tests and add name as a constant in the schema. Add nonDynamicName to capture resolved schema names. ([95dabb2](https://github.com/ERC725Alliance/erc725.js/commit/95dabb22c3958b94014eed2b460a5e2dcce4684d))
* Repair and use dynamicName and dynamicKeyParts. ([2874516](https://github.com/ERC725Alliance/erc725.js/commit/2874516343fee7259367f84f19f071081be5f61f))
* Repair limitation ([b0ffa5b](https://github.com/ERC725Alliance/erc725.js/commit/b0ffa5b1051015268c552b53b4334e0795295e1d))
* Repair tests and 0x prefix for dynamic fields in some places. ([cef4e15](https://github.com/ERC725Alliance/erc725.js/commit/cef4e15587cb9dbc993606098851698fc77cd6b8))
* Some cleanup, remove global-agent, some new minor upgrades ([239c98c](https://github.com/ERC725Alliance/erc725.js/commit/239c98c35233ad1188b74e971d9b5f993273b092))

## [0.27.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.26.0...v0.27.0) (2024-05-29)


### Features

* allow to pass `number` directly in array when encoding tuples ([f6b4a9d](https://github.com/ERC725Alliance/erc725.js/commit/f6b4a9df803f1c63d53067ca3b67604219502cda))
* export `mapPermission` function and don't make it throw an error ([08e72d6](https://github.com/ERC725Alliance/erc725.js/commit/08e72d61f37d8e3d8b70b5b0bf7cb355687f3546))
* export function to get verification method ([f426a31](https://github.com/ERC725Alliance/erc725.js/commit/f426a31239f708775e5ab2829ccd0e206da43988))
* export method `isDataAuthentic` as static, single method or member of class ([0c7ba98](https://github.com/ERC725Alliance/erc725.js/commit/0c7ba987540e0684e803ca8d722aa4b0b5d04fde))
* return `dynamicKeyName` and `dynamicKeyPart` for `getSchema` with Array ([8b86092](https://github.com/ERC725Alliance/erc725.js/commit/8b860926f6a8e5a733c3d01321bf888a19b79f12))


### Bug Fixes

* allow to decode `0x` as `0` for keyType `Array` ([fde9f5d](https://github.com/ERC725Alliance/erc725.js/commit/fde9f5da07dfe87f1459266515b58bca58eacbcd))

## [0.26.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.25.0...v0.26.0) (2024-05-14)

### Features

- add `dynamicPart` in schema returned by `getSchema` ([12d34d2](https://github.com/ERC725Alliance/erc725.js/commit/12d34d2d8a80656ae9b4efeb1ec72bcf2426b6e5))
- add support for `bytesN` valueType from 1 to 32 ([1db6f2f](https://github.com/ERC725Alliance/erc725.js/commit/1db6f2faebaccdcc39455b4a3dbae05c6416271a))
- allow to use `decodeData` to decode Array length only ([5ddb12d](https://github.com/ERC725Alliance/erc725.js/commit/5ddb12d43ce399e166e159be9faf364f9647c705))
- export `getSchema` as a standalone function outside of class instance ([8558c71](https://github.com/ERC725Alliance/erc725.js/commit/8558c71b0cc077636db64506fc8407a8bc179c13))
- include also `dynamicKeyPart` in the schema return by `getSchema` ([30dda33](https://github.com/ERC725Alliance/erc725.js/commit/30dda3398d35a019b97790524834f12489607f2b))

### Bug Fixes

- encode `uintN` with correct padding and bytes length ([f8dc5ae](https://github.com/ERC725Alliance/erc725.js/commit/f8dc5ae9651ce953b2ff9808dfb3671126adace0))
- Ignore formatting in package.json inside of biome ([33a80dd](https://github.com/ERC725Alliance/erc725.js/commit/33a80dd5368028cb55ab68ea940c176790595806))
- valueContent from `bytes32` -&gt; `Bytes32` for `LSP8ReferenceContract` ([dffc421](https://github.com/ERC725Alliance/erc725.js/commit/dffc421bea06c659d30f47ecead0be1385072248))

## [0.25.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.24.2...v0.25.0) (2024-04-18)

### Features

- export methods for encoding/decoding dataSourceWithHash and valueContent ([b1e0ed9](https://github.com/ERC725Alliance/erc725.js/commit/b1e0ed98718acce90f1db6917728394ab8aeb4fa))

## [0.24.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.24.1...v0.24.2) (2024-04-11)

### Bug Fixes

- Apply suggestions. ([e9c3d81](https://github.com/ERC725Alliance/erc725.js/commit/e9c3d81875ef2861791753c1285defc096ddbdac))
- Minimize changes ([cc31b5f](https://github.com/ERC725Alliance/erc725.js/commit/cc31b5f8b185743a5e783a04a7a8b4b158268fda))
- Repair data: urls from not triggering the baseURI test. ([c26ab3e](https://github.com/ERC725Alliance/erc725.js/commit/c26ab3e51b1f027044df467ab4e2f0c6a00dff5d))

## [0.24.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.24.0...v0.24.1) (2024-04-03)

### Bug Fixes

- Add missing exports due to merge conflict. ([2e14cd5](https://github.com/ERC725Alliance/erc725.js/commit/2e14cd5b4a5a1f51222c1056bd4220be2a09a02d))

## [0.24.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.23.1...v0.24.0) (2024-04-02)

### Features

- add dynamic array encoding ([f0f495c](https://github.com/ERC725Alliance/erc725.js/commit/f0f495c69e8b4768468437cad24f1b77d53a379f))
- replace dynamic part with hex value when parsing schemas for `Mapping` keys ([a9fdb4d](https://github.com/ERC725Alliance/erc725.js/commit/a9fdb4daa69e2aac38aca2393f94e8fe83113656))

### Bug Fixes

- Patch full pretty printed with LF and TAB. ([315fa54](https://github.com/ERC725Alliance/erc725.js/commit/315fa547ab8f2d25db4f771d818afeec0d324bdf))

## [0.23.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.23.0...v0.23.1) (2024-02-23)

### Bug Fixes

- Add check for pretty printed and non-pretty printed versions of JSON ([aa68bf1](https://github.com/ERC725Alliance/erc725.js/commit/aa68bf132d2e4793b4da784c30ae8f306560da8c))
- Missing line ([d13be00](https://github.com/ERC725Alliance/erc725.js/commit/d13be00ba77be924f914cba1283e9c37250ec9bd))
- Re-do PR with minimal changes ([17458d6](https://github.com/ERC725Alliance/erc725.js/commit/17458d623f214f026307184357bcf7ff75fad7ed))
- Repair package-lock to be just as on main ([e793246](https://github.com/ERC725Alliance/erc725.js/commit/e793246e7e09bd80628f19499a5218ce70df8401))

## [0.23.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.22.0...v0.23.0) (2024-01-22)

### Features

- add permission related to 4337 ([e7fd19b](https://github.com/ERC725Alliance/erc725.js/commit/e7fd19bc27aa89fae410b9633ef5ccdf13f33f0e))
- allow to load typed schemas from `schemas/` folder ([c54a370](https://github.com/ERC725Alliance/erc725.js/commit/c54a370c1e4f8d71ba6bb7e62122b89069f521e6))

### Bug Fixes

- Add workaround to read (bytes4,URI), repair none vs unknown signature. ([204409d](https://github.com/ERC725Alliance/erc725.js/commit/204409df544825041a586865cfb6bb124288e48f))
- Additional PR repair ([2a18f2b](https://github.com/ERC725Alliance/erc725.js/commit/2a18f2bf1a24547e71cad6953f5144761aa2cc9a))
- BodyInit should be just string or buffer and not already Uint8Array ([08e0177](https://github.com/ERC725Alliance/erc725.js/commit/08e017778fa42ade5386b8d9e85255225a7f3195))
- Cleanup ([038d975](https://github.com/ERC725Alliance/erc725.js/commit/038d97584075c89f93f51227666074cf11973a29))
- Cleanup a bit with comments. ([3d6a5a6](https://github.com/ERC725Alliance/erc725.js/commit/3d6a5a65db5049b678d0d54149e9b11ea2479999))
- Cleanup and handle situation where one of many keys fails. Return null. ([cdf4583](https://github.com/ERC725Alliance/erc725.js/commit/cdf4583c159d8c8e52a832bfe5af6b650d8945fa))
- Cleanup error handler inside of getDataFromExternalSources ([fde2e0f](https://github.com/ERC725Alliance/erc725.js/commit/fde2e0f41df3ecee90a4dfd8248dd9c2a7a72965))
- Debug and repair test scripts. Implement detecting of JSON inside of Uint8Array ([74c0526](https://github.com/ERC725Alliance/erc725.js/commit/74c0526e3f544400ced78f02ff4fed64bd048bfa))
- Missing commit ([a3dd604](https://github.com/ERC725Alliance/erc725.js/commit/a3dd604964c9c9221ff421fe668faa8fd363101a))
- More fixes ([620b606](https://github.com/ERC725Alliance/erc725.js/commit/620b60632e50ca59abedae9935f8b75d188278e0))
- Remove .only call for testing. ([d5ef3c9](https://github.com/ERC725Alliance/erc725.js/commit/d5ef3c9965e2c5ad343f88a9c30a6281e9fa169b))
- Remove console debugging. ([e349d57](https://github.com/ERC725Alliance/erc725.js/commit/e349d5715c7779c1eeb8d6e08c3ae3bf17eedd9e))
- Remove unnecessary special case for 0x00000000 ([cd6152a](https://github.com/ERC725Alliance/erc725.js/commit/cd6152a88ca7a1c98184799b6fdc6982ff8a1cd6))
- Repair and enhance test scripts ([224eb9e](https://github.com/ERC725Alliance/erc725.js/commit/224eb9ecb1b16f373f2ad17ee9d3efab08dda53b))
- Repair as per PR review ([0a52452](https://github.com/ERC725Alliance/erc725.js/commit/0a5245230455324e9911e4e14992c50e6f645ba2))
- Repair console.log and expand types of URLs (ar://, ipfs://, https\?://, data:) ([5c8f228](https://github.com/ERC725Alliance/erc725.js/commit/5c8f2285d2d23c59ef9707a54e419b55d25e4136))
- Repair problems with IPFS, fetch and VerifiableURI ([44834b8](https://github.com/ERC725Alliance/erc725.js/commit/44834b8ed517e869ad99920b2853e30213a8d7b5))
- Repair to not throw errors when data is not authentica or not accessible withing getDataFromExternalSources. ([25756d0](https://github.com/ERC725Alliance/erc725.js/commit/25756d09cecfec5d13d6e4fb6ed842c4e3d77734))
- Repair tuples containing numeric types uintX/intX, add Number to output data type. ([01cceea](https://github.com/ERC725Alliance/erc725.js/commit/01cceeac03f719df6eb8be8c238aca4483e7a3e8))
- Simplify buffer to string conversion. ([0bd1349](https://github.com/ERC725Alliance/erc725.js/commit/0bd1349f863283cf16cc6808bef48990ec118361))
- Simplify creation of key to detect JSON. ([df2580d](https://github.com/ERC725Alliance/erc725.js/commit/df2580d9434dc386480f7eec2cd6e94a5b4ca7c1))
- Use a single keccak function since ethereumjs converts it to a Buffer no matter what. ([cdc6c0a](https://github.com/ERC725Alliance/erc725.js/commit/cdc6c0a0f749209352d620db6d60865a276e072c))

## [0.22.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.3...v0.22.0) (2023-12-15)

### ⚠ BREAKING CHANGES

- update new LSP7/8 interface IDs ([#367](https://github.com/ERC725Alliance/erc725.js/issues/367))
- `JSONURL` and `AssetURL` are now deprecated and have been replaced by `VerifiableURI`. The decoding is backward compatible but if you try to encode `JSONURL` and `AssetURL` value, they will be encoded as [`VerifiableURI`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#verifiableuri). ([9aa87e5](https://github.com/ERC725Alliance/erc725.js/commit/9aa87e5ccc0fb1caac1f3291387370b3a980324b))

### Bug Fixes

- Rename JSONURLDataToEncode ([808f1b3](https://github.com/ERC725Alliance/erc725.js/commit/808f1b362bd2275424cf93ac6333049cde90216e))

## [0.21.3](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.2...v0.21.3) (2023-11-29)

### Features

- add `encode/decodeValueType` as public callable methods ([#325](https://github.com/ERC725Alliance/erc725.js/issues/325)) ([a6fe7c8](https://github.com/ERC725Alliance/erc725.js/commit/a6fe7c8470688f573426b59fc2023a08da0cbd36))
- add more schemas available to parse via `getSchema` ([#351](https://github.com/ERC725Alliance/erc725.js/issues/351)) ([b882379](https://github.com/ERC725Alliance/erc725.js/commit/b8823796c5f99d89d56954c894dfb6964adc552a))
- add support for multi types in mappings ([#357](https://github.com/ERC725Alliance/erc725.js/issues/357)) ([ba92903](https://github.com/ERC725Alliance/erc725.js/commit/ba9290326efad0aab3855ad3f0ed2722180980ed))
- add support to encode / decode any `uint8` to `uint256` types ([#355](https://github.com/ERC725Alliance/erc725.js/issues/355)) ([417a4e8](https://github.com/ERC725Alliance/erc725.js/commit/417a4e8ff2c74f3f9e35d0018a4973c97c6ac997))
- allow to encode LSP2 Array length only ([#326](https://github.com/ERC725Alliance/erc725.js/issues/326)) ([3a6be55](https://github.com/ERC725Alliance/erc725.js/commit/3a6be551d889904b7d95e2630ab637f2a31feb50))

### Bug Fixes

- update lsp6 schema ([75c4044](https://github.com/ERC725Alliance/erc725.js/commit/75c40444e407d93076cc1e49ad706cc0055f383b))

## [0.21.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.1...v0.21.2) (2023-11-07)

### Bug Fixes

- Add for unknown verification method to allow for null verification data in LSP2 ([f205818](https://github.com/ERC725Alliance/erc725.js/commit/f205818af348471bde8f88af2008497b8c13e258))
- Add more fixes per PR comments ([e7302e4](https://github.com/ERC725Alliance/erc725.js/commit/e7302e4504408e2f4f6304badd2024bfe05fcf47))
- Change to verification object ([ddd2ab2](https://github.com/ERC725Alliance/erc725.js/commit/ddd2ab23d1c5181745827f338d9abaea48c772f7))
- More renames \_FUNCTIONS to \_METHODS ([1a96be1](https://github.com/ERC725Alliance/erc725.js/commit/1a96be1dd15942d2a844bc26b9ab73e053e3b766))
- Move @types/jest and jest ([852918c](https://github.com/ERC725Alliance/erc725.js/commit/852918c72228b3839ba60730dadef66837008f5a))

## [0.21.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.0...v0.21.1) (2023-11-06)

### Bug Fixes

- incorrect hex for `LSP8MetadataTokenURI` ([0500a75](https://github.com/ERC725Alliance/erc725.js/commit/0500a752e3117c5c7e9df8cfed22cb5d6fee20c5))

## [0.21.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.20.1...v0.21.0) (2023-11-02)

### ⚠ BREAKING CHANGES

- update lsp3/lsp4 verificationData

### Features

- new gas parameter ([82e3833](https://github.com/ERC725Alliance/erc725.js/commit/82e383345a712619b5c6a1030b124d2625115fc1))

### Code Refactoring

- update lsp3/lsp4 verificationData ([9640d9f](https://github.com/ERC725Alliance/erc725.js/commit/9640d9fbf88c7cf694b9e82cc3a711350334b097))

## [0.20.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.20.0...v0.20.1) (2023-10-30)

### Bug Fixes

- incorrect permission value for `EXECUTE_RELAY_CALL` ([55b8f5e](https://github.com/ERC725Alliance/erc725.js/commit/55b8f5e64c29c5a85d872f605667c88c1546f6b3))

## [0.20.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.19.0...v0.20.0) (2023-10-18)

### Features

- add permission `EXECUTE_RELAY_CALL` ([6db8835](https://github.com/ERC725Alliance/erc725.js/commit/6db8835ccd9d1082d9e8184bb2f14972760bea69))

## [0.19.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.18.0...v0.19.0) (2023-10-05)

### ⚠ BREAKING CHANGES

- change LSP3 to SupportedStandards:LSP3Profile ([#307](https://github.com/ERC725Alliance/erc725.js/issues/307))
- new encoding for static value types (not arrays `[]`) ([#288](https://github.com/ERC725Alliance/erc725.js/issues/288))
- change `ArrayLength` value from `uint256` to `uint128` ([#287](https://github.com/ERC725Alliance/erc725.js/issues/287))

### Features

- add checkPermissions function ([17d2258](https://github.com/ERC725Alliance/erc725.js/commit/17d225843c236951ef1515a0ff91095b5ef27cd3))
- add schemas for LSP8 + LSP17 ([#311](https://github.com/ERC725Alliance/erc725.js/issues/311)) ([1e8dbf7](https://github.com/ERC725Alliance/erc725.js/commit/1e8dbf765c6c5e250539b402e9bd5a395966a8c2))

### Bug Fixes

- decode any uint256 as number not string ([#289](https://github.com/ERC725Alliance/erc725.js/issues/289)) ([37203f1](https://github.com/ERC725Alliance/erc725.js/commit/37203f14d313a0caff75724dc74175c741c1b540))
- dependencies & example ([#302](https://github.com/ERC725Alliance/erc725.js/issues/302)) ([9979e89](https://github.com/ERC725Alliance/erc725.js/commit/9979e89e438cd9f7cc586d7dc271de969f13b125))
- incorrect value in schema for array length in `...Map` ([#310](https://github.com/ERC725Alliance/erc725.js/issues/310)) ([0d28b13](https://github.com/ERC725Alliance/erc725.js/commit/0d28b1317dc085078090a8babacf4db517d91a87))
- Remove hardcoded require ([5279278](https://github.com/ERC725Alliance/erc725.js/commit/527927812b1a05b13f8dc6b14aecaa6d24e98d61))
- variable naming ([44b4785](https://github.com/ERC725Alliance/erc725.js/commit/44b47851ed63b817edc21c63655d67bac13a7e7f))

### Code Refactoring

- change `ArrayLength` value from `uint256` to `uint128` ([#287](https://github.com/ERC725Alliance/erc725.js/issues/287)) ([c95ee8a](https://github.com/ERC725Alliance/erc725.js/commit/c95ee8a53bf25bcf47777054af27cae1fbad8b2f))
- change LSP3 to SupportedStandards:LSP3Profile ([#307](https://github.com/ERC725Alliance/erc725.js/issues/307)) ([73f3481](https://github.com/ERC725Alliance/erc725.js/commit/73f34818fe152c3ab5299177adc0eddfed6886c5))
- new encoding for static value types (not arrays `[]`) ([#288](https://github.com/ERC725Alliance/erc725.js/issues/288)) ([f0b04da](https://github.com/ERC725Alliance/erc725.js/commit/f0b04daa57a281c537a8f28594439573188f0dce))

## [0.18.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.17.2...v0.18.0) (2023-08-03)

### ⚠ BREAKING CHANGES

- new encoding for static value types (not arrays `[]`) (#288)
- change `ArrayLength` value from `uint256` to `uint128` (#287)

### Features

- add checkPermissions function ([17d2258](https://github.com/ERC725Alliance/erc725.js/commit/17d225843c236951ef1515a0ff91095b5ef27cd3))
- Add new feature "Decode Mapping Key" ([8c1f1fc](https://github.com/ERC725Alliance/erc725.js/commit/8c1f1fcfb15fa43d1d3934b0b15f09d47902bb41))

### Bug Fixes

- decode any uint256 as number not string ([#289](https://github.com/ERC725Alliance/erc725.js/issues/289)) ([37203f1](https://github.com/ERC725Alliance/erc725.js/commit/37203f14d313a0caff75724dc74175c741c1b540))
- variable naming ([44b4785](https://github.com/ERC725Alliance/erc725.js/commit/44b47851ed63b817edc21c63655d67bac13a7e7f))

### improvement

- change `ArrayLength` value from `uint256` to `uint128` ([#287](https://github.com/ERC725Alliance/erc725.js/issues/287)) ([c95ee8a](https://github.com/ERC725Alliance/erc725.js/commit/c95ee8a53bf25bcf47777054af27cae1fbad8b2f))
- new encoding for static value types (not arrays `[]`) ([#288](https://github.com/ERC725Alliance/erc725.js/issues/288)) ([f0b04da](https://github.com/ERC725Alliance/erc725.js/commit/f0b04daa57a281c537a8f28594439573188f0dce))

### [0.17.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.17.1...v0.17.2) (2023-03-14)

- removed ERC725JSONSchemaKeyType duplicate value ([060ee6c](https://github.com/ERC725Alliance/erc725.js/commit/060ee6ce23bda328f727140419de7590f48fc394))
- wrong web3 import ([337269e](https://github.com/ERC725Alliance/erc725.js/commit/337269eb22f82e6f44f9b8c9be4840fa6cd676ed))

### [0.17.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.17.0...v0.17.1) (2023-02-08)

### ⚠ BREAKING CHANGES

- update schemas (#274)

## [0.17.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.16.0...v0.17.0) (2023-02-07)

### ⚠ BREAKING CHANGES

- refactor: change permission `ADDPERMISSIONS` -> `ADDCONTROLLER` ([122efa9](https://github.com/ERC725Alliance/erc725.js/commit/122efa99b4858a97cd3b1d6f5c07d85983e03653))

### Features

- add encoding / decoding for `bytes[CompactBytesArray]` ([#261](https://github.com/ERC725Alliance/erc725.js/issues/261)) ([8d3e4e9](https://github.com/ERC725Alliance/erc725.js/commit/8d3e4e994957dbf1f54eef4572b072bc308c61bc))
- add decoding/encoding support for tuples of `CompactBytesArray` ([#264](https://github.com/ERC725Alliance/erc725.js/issues/264)) ([d9ce0f0](https://github.com/ERC725Alliance/erc725.js/commit/d9ce0f08b61a4a04ebc98c6b996513fb432768f6))
- add encoding/decoding for other types of `compactBytesArray` ([#262](https://github.com/ERC725Alliance/erc725.js/issues/262)) ([9268a32](https://github.com/ERC725Alliance/erc725.js/commit/9268a3205b54f81069e6217c827dff69d4166848))
- Add support for `bool` (valueType) and `Boolean` (valueContent) ([#266](https://github.com/ERC725Alliance/erc725.js/issues/266)) ([86d606e](https://github.com/ERC725Alliance/erc725.js/commit/86d606e677a69eebaaaeb9467c37e5f6303efb4a))

### Bug Fixes

- Encode key name should parse any number (hex or decimal) for uint type ([eb7385e](https://github.com/ERC725Alliance/erc725.js/commit/eb7385e6e97f6f069c4be5331f0c4547b79faab5))

## [0.16.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.15.0...v0.16.0) (2022-10-27)

### ⚠ BREAKING CHANGES

- It is now recommended to initialise the library with an RPC URL over the Web3 or Ethers provider, you can check the [erc725.js documentation](https://docs.lukso.tech/tools/erc725js/providers#rpc-url) to get more information.

### Features

- add [supportsInterface](https://docs.lukso.tech/tools/erc725js/classes/ERC725#supportsinterface) ([#243](https://github.com/ERC725Alliance/erc725.js/issues/243)) ([a2b0828](https://github.com/ERC725Alliance/erc725.js/commit/a2b08288e9aaede8a1a3307c1371672eb7b50969))
- make library compatible with RPC urls ([263de19](https://github.com/ERC725Alliance/erc725.js/commit/263de1983f08c9f31f0cc931e581fe8af52bd541))

### Bug Fixes

- change lsp7 interface id from `0xe33f65c3` to `0x5fcaac27` ([6aa6eb3](https://github.com/ERC725Alliance/erc725.js/commit/6aa6eb30d427609c89ebc1920fc9ecf03c0dd68b))
- update return type for `fetchData` ([#247](https://github.com/ERC725Alliance/erc725.js/issues/247)) ([7ffcd64](https://github.com/ERC725Alliance/erc725.js/commit/7ffcd64b2c0ee841b71472d0d6d869e4149db37d))

## [0.15.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.14.4...v0.15.0) (2022-09-14)

### ⚠ BREAKING CHANGES

- add LSP6 `ENCRYPT` permission in for encrypt/decrypt permissions methods. (#223)

### [0.14.4](https://github.com/ERC725Alliance/erc725.js/compare/v0.14.3...v0.14.4) (2022-07-25)

### Features

- expose dynamic parts to public encodeKeyName ([#213](https://github.com/ERC725Alliance/erc725.js/issues/213)) ([73f1265](https://github.com/ERC725Alliance/erc725.js/commit/73f126570eaf5f118c48859ee878608afc48a0aa))

### [0.14.3](https://github.com/ERC725Alliance/erc725.js/compare/v0.14.2...v0.14.3) (2022-07-07)

### Features

- add `BitArray` in valueContent encoding map ([3498502](https://github.com/ERC725Alliance/erc725.js/commit/3498502da0b531559e557fc4a9e6c2851b480807))

### Bug Fixes

- LSP4Creators[] valueType ([6ddbf47](https://github.com/ERC725Alliance/erc725.js/commit/6ddbf473039b17af562d56f1f12be5194a060477))

### [0.14.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.14.1...v0.14.2) (2022-06-24)

### Bug Fixes

- Update JsonRpc eth_call parameters ([470e846](https://github.com/ERC725Alliance/erc725.js/commit/470e8461e581f0763fe3fddc8f604cc55002f7a1))

### [0.14.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.14.0...v0.14.1) (2022-06-15)

Minor update to update the LSP-2 schemas.

## [0.14.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.13.0...v0.14.0) (2022-06-14)

### ⚠ BREAKING CHANGES

- fetchData as same output as decodeData
- getData as same output as decodeData
- add dynamic keys for getData
- use array for decodeData
- use array for encodeData

### Features

- add dynamic keys for getData ([7a46786](https://github.com/ERC725Alliance/erc725.js/commit/7a46786105d35ca0b33ce5158be98866f3fbfd71))
- add dynamicKeys for decodeData ([f386e15](https://github.com/ERC725Alliance/erc725.js/commit/f386e15396cbf6c2b842302f1c85b41a0798b684))
- add non array input on decodeData ([0774a86](https://github.com/ERC725Alliance/erc725.js/commit/0774a86d652e205814863d07319adef2266f634c))
- add support for hashed key for encodeData ([23323a0](https://github.com/ERC725Alliance/erc725.js/commit/23323a02a6bfb81be1eba24207fe353942367837))
- add BytesN value content ([#184](https://github.com/ERC725Alliance/erc725.js/issues/184)) ([7e073e4](https://github.com/ERC725Alliance/erc725.js/commit/7e073e4dfc7094aac55935fffc18ef14d16a24c8))
- add tuples support ([7f3d1a0](https://github.com/ERC725Alliance/erc725.js/commit/7f3d1a09c3e6058b76a5b3ceca8bc1f454e634ce))

### Bug Fixes

- encodeKeyName returns lowercase keys ([80566eb](https://github.com/ERC725Alliance/erc725.js/commit/80566eb2358db0ff90e42028ee5b1b5bca206b46))

### improvement

- fetchData as same output as decodeData ([59c3a87](https://github.com/ERC725Alliance/erc725.js/commit/59c3a879fefb2b9bfe46b9bea91ff6bd2a528df1))
- getData as same output as decodeData ([0f3b149](https://github.com/ERC725Alliance/erc725.js/commit/0f3b149f2280e6025a05e8e9ed306facfa63601a))
- use array for decodeData ([261d100](https://github.com/ERC725Alliance/erc725.js/commit/261d1007f4ff63abd9d794f4e64e5b408ce7c1a3))
- use array for encodeData ([a2e6cdd](https://github.com/ERC725Alliance/erc725.js/commit/a2e6cdd5cca778f9015c71a624cc3953e2e0fd29))

## [0.13.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.12.0...v0.13.0) (2022-06-02)

### ⚠ BREAKING CHANGES

- remove old LSP2 Key Types (Bytes20..)

### Features

- add dynamic keys for encodeKeyName ([#168](https://github.com/ERC725Alliance/erc725.js/issues/168)) ([fc614b0](https://github.com/ERC725Alliance/erc725.js/commit/fc614b0b92d3b5c7b86586f4be7e3200ea9680cf))

### improvement

- change fetchData output to non object ([1d4d570](https://github.com/ERC725Alliance/erc725.js/commit/1d4d57077a7766b3490477efb20f194fc4e00da4))
- remove old LSP2 Key Types (Bytes20..) ([1e1cd43](https://github.com/ERC725Alliance/erc725.js/commit/1e1cd43e7693db5f12200aef6e282fa14e655ec3))

## [0.12.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.11.1...v0.12.0) (2022-05-19)

### ⚠ BREAKING CHANGES

- change encodeData result structure

### improvement

- change encodeData result structure ([10da619](https://github.com/ERC725Alliance/erc725.js/commit/10da619bf3eee18f6a764e0c8af8c36d9caf8d59))

### [0.11.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.11.0...v0.11.1) (2022-04-06)

This version fix the npm pack error.

### Bug Fixes

- do not load wrong schemas ([66dc3e6](https://github.com/ERC725Alliance/erc725.js/commit/66dc3e648ad1a9aeabe66e5ae2aeb15cf3f74775))

## [0.11.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.10.0...v0.11.0) (2022-04-05)

### ⚠ BREAKING CHANGES

- the output of getData is not an object anymore, but the value directly if the input is a string.
- if fetchData is called with a string, the output will be the value itself, not an object anymore.

### Features

- add schemas at the root and improve docs ([#121](https://github.com/ERC725Alliance/erc725.js/issues/121)) ([e37fb39](https://github.com/ERC725Alliance/erc725.js/commit/e37fb3926bcb682df00c632feb3b3a8b1700d2c0))
- change the output of getData for string input ([3592c1b](https://github.com/ERC725Alliance/erc725.js/commit/3592c1bb335e9a1bce824bc3ef8667e98ae9e87e))

## [0.10.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.9.2...v0.10.0) (2022-03-11)

### Features

- add isValidSignature ([6490751](https://github.com/ERC725Alliance/erc725.js/commit/6490751c009e435ac23eb98e6bfe64d271b85ba4))

## [0.9.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.9.1...v0.9.2) (2022-02-21)

### Features

- add LSP1 schema ([4f849da](https://github.com/ERC725Alliance/erc725.js/commit/4f849dac01116e6f019e04fea950b42d2271910b))

### Bug Fixes

- update ERC725Y JSON Schemas to latest LSPs specs ([#92](https://github.com/ERC725Alliance/erc725.js/issues/92)) ([3485baa](https://github.com/ERC725Alliance/erc725.js/commit/3485baa347cf9a194bd0c4ea2a1e8c61922b63b9))
- wait until a promise is resolved when using ethereum provider ([5efe641](https://github.com/ERC725Alliance/erc725.js/commit/5efe6414b6e4a4250d8c402baa887a269e6f83ef))

## [0.9.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.9.0...v0.9.1) (2022-02-01)

### Bug Fixes

- getSchema array ([#95](https://github.com/ERC725Alliance/erc725.js/issues/95)) ([8ce5ff1](https://github.com/ERC725Alliance/erc725.js/commit/8ce5ff1c81ece3534fd557d978bda4107dfd3809))

## [0.9.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.8.0...v0.9.0) (2022-01-06)

### ⚠ BREAKING CHANGES

- GraphQL / Apollo has been removed

### Features

- add encodeKeyName method ([#86](https://github.com/ERC725Alliance/erc725.js/issues/86)) ([7cf43ba](https://github.com/ERC725Alliance/erc725.js/commit/7cf43babbf461a05636d31941237adf94a3d364d))
- add getSchema ([#85](https://github.com/ERC725Alliance/erc725.js/issues/85)) ([7f677d0](https://github.com/ERC725Alliance/erc725.js/commit/7f677d0b6b08061773a151d2e91a21156ca59f3a))
- LSP6 Permissions encoding methods ([#84](https://github.com/ERC725Alliance/erc725.js/issues/84)) ([2e1031a](https://github.com/ERC725Alliance/erc725.js/commit/2e1031a047f19b2fc98104b7df58eecb1424b67f))

### Bug Fixes

- empty JSON url return null instead of crash ([#61](https://github.com/ERC725Alliance/erc725.js/issues/61)) ([2d1e417](https://github.com/ERC725Alliance/erc725.js/commit/2d1e417facbc9b2c5b1f4fae62d46b498f3f7603))

- remove GraphQL support ([#83](https://github.com/ERC725Alliance/erc725.js/issues/83)) ([a0a5e93](https://github.com/ERC725Alliance/erc725.js/commit/a0a5e93bff3e4a5cc759c7b8662f7df523fa484f))

## [0.8.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.6.2-beta.4...v0.8.0) (2021-11-22)

### ⚠ BREAKING CHANGES

- remove deprecated elementValueType / elementValueContent keys (#45)

### Features

- add support for new getData([]) ([#48](https://github.com/ERC725Alliance/erc725.js/issues/48)) ([6cbb1e7](https://github.com/ERC725Alliance/erc725.js/commit/6cbb1e76e3df8b862ee35e436aaddea24f86e2ea))
- remove deprecated elementValueType / elementValueContent keys ([#45](https://github.com/ERC725Alliance/erc725.js/issues/45)) ([a326cd6](https://github.com/ERC725Alliance/erc725.js/commit/a326cd6560a8a9de6c68db61c919c07f4f71e3d5))

### Bug Fixes

- handling of missing keys ([#58](https://github.com/ERC725Alliance/erc725.js/issues/58)) ([9431f85](https://github.com/ERC725Alliance/erc725.js/commit/9431f85dd62785305f5b32ca6c4a4e9e3c9b788d))
- wrong return type for fetchData ([#54](https://github.com/ERC725Alliance/erc725.js/issues/54)) ([0ce147a](https://github.com/ERC725Alliance/erc725.js/commit/0ce147ac0774a3ec0b404896da02b923bbfbd09c))

## [0.7.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.6.2-beta.4...v0.7.0) (2021-11-02)

### ⚠ BREAKING CHANGES

- remove deprecated elementValueType / elementValueContent keys (#45)

### Features

- add support for new getData([]) ([#48](https://github.com/ERC725Alliance/erc725.js/issues/48)) ([6cbb1e7](https://github.com/ERC725Alliance/erc725.js/commit/6cbb1e76e3df8b862ee35e436aaddea24f86e2ea))
- remove deprecated elementValueType / elementValueContent keys ([#45](https://github.com/ERC725Alliance/erc725.js/issues/45)) ([a326cd6](https://github.com/ERC725Alliance/erc725.js/commit/a326cd6560a8a9de6c68db61c919c07f4f71e3d5))

### [0.6.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.6.0...v0.6.1) (2021-08-13)

### Docs

- **docs:** Update missed occurrences of "erc725.js"

### [0.6.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.5.7...v0.6.0) (2021-08-13)

### Feature

- **API:** Adjusted API to be more consistent
  - https://github.com/ERC725Alliance/erc725.js/issues/30
  - https://github.com/ERC725Alliance/erc725.js/pull/31

### Bug Fixes

- **mocha:** increase timeout time ([b7ce1a0](https://github.com/ERC725Alliance/erc725.js/commit/b7ce1a07711b8251f4447d613c4c5a522b5e263f))

### [0.5.7](https://github.com/ERC725Alliance/erc725.js/compare/v0.2.0...v0.5.7) (2021-07-30)

### Bug Fixes

- **publish:** ensure clean build folder ([973e09b](https://github.com/ERC725Alliance/erc725.js/commit/973e09b936277c254fdc9c15d4d5d89fc4dc05ed))
