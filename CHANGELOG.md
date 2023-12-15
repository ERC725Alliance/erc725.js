# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.22.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.3...v0.22.0) (2023-12-15)


### ⚠ BREAKING CHANGES

* update new LSP7/8 interface IDs ([#367](https://github.com/ERC725Alliance/erc725.js/issues/367))
* `JSONURL` and `AssetURL` are now deprecated and have been replaced by `VerifiableURI`. The decoding is backward compatible but if you try to encode `JSONURL` and `AssetURL` value, they will be encoded as [`VerifiableURI`](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#verifiableuri). ([9aa87e5](https://github.com/ERC725Alliance/erc725.js/commit/9aa87e5ccc0fb1caac1f3291387370b3a980324b))

### Bug Fixes

* Rename JSONURLDataToEncode ([808f1b3](https://github.com/ERC725Alliance/erc725.js/commit/808f1b362bd2275424cf93ac6333049cde90216e))

## [0.21.3](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.2...v0.21.3) (2023-11-29)


### Features

* add `encode/decodeValueType` as public callable methods ([#325](https://github.com/ERC725Alliance/erc725.js/issues/325)) ([a6fe7c8](https://github.com/ERC725Alliance/erc725.js/commit/a6fe7c8470688f573426b59fc2023a08da0cbd36))
* add more schemas available to parse via `getSchema` ([#351](https://github.com/ERC725Alliance/erc725.js/issues/351)) ([b882379](https://github.com/ERC725Alliance/erc725.js/commit/b8823796c5f99d89d56954c894dfb6964adc552a))
* add support for multi types in mappings ([#357](https://github.com/ERC725Alliance/erc725.js/issues/357)) ([ba92903](https://github.com/ERC725Alliance/erc725.js/commit/ba9290326efad0aab3855ad3f0ed2722180980ed))
* add support to encode / decode any `uint8` to `uint256` types ([#355](https://github.com/ERC725Alliance/erc725.js/issues/355)) ([417a4e8](https://github.com/ERC725Alliance/erc725.js/commit/417a4e8ff2c74f3f9e35d0018a4973c97c6ac997))
* allow to encode LSP2 Array length only ([#326](https://github.com/ERC725Alliance/erc725.js/issues/326)) ([3a6be55](https://github.com/ERC725Alliance/erc725.js/commit/3a6be551d889904b7d95e2630ab637f2a31feb50))


### Bug Fixes

* update lsp6 schema ([75c4044](https://github.com/ERC725Alliance/erc725.js/commit/75c40444e407d93076cc1e49ad706cc0055f383b))

## [0.21.2](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.1...v0.21.2) (2023-11-07)


### Bug Fixes

* Add for unknown verification method to allow for null verification data in LSP2 ([f205818](https://github.com/ERC725Alliance/erc725.js/commit/f205818af348471bde8f88af2008497b8c13e258))
* Add more fixes per PR comments ([e7302e4](https://github.com/ERC725Alliance/erc725.js/commit/e7302e4504408e2f4f6304badd2024bfe05fcf47))
* Change to verification object ([ddd2ab2](https://github.com/ERC725Alliance/erc725.js/commit/ddd2ab23d1c5181745827f338d9abaea48c772f7))
* More renames _FUNCTIONS to _METHODS ([1a96be1](https://github.com/ERC725Alliance/erc725.js/commit/1a96be1dd15942d2a844bc26b9ab73e053e3b766))
* Move @types/jest and jest ([852918c](https://github.com/ERC725Alliance/erc725.js/commit/852918c72228b3839ba60730dadef66837008f5a))

## [0.21.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.21.0...v0.21.1) (2023-11-06)


### Bug Fixes

* incorrect hex for `LSP8MetadataTokenURI` ([0500a75](https://github.com/ERC725Alliance/erc725.js/commit/0500a752e3117c5c7e9df8cfed22cb5d6fee20c5))

## [0.21.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.20.1...v0.21.0) (2023-11-02)


### ⚠ BREAKING CHANGES

* update lsp3/lsp4 verificationData

### Features

* new gas parameter ([82e3833](https://github.com/ERC725Alliance/erc725.js/commit/82e383345a712619b5c6a1030b124d2625115fc1))


### Code Refactoring

* update lsp3/lsp4 verificationData ([9640d9f](https://github.com/ERC725Alliance/erc725.js/commit/9640d9fbf88c7cf694b9e82cc3a711350334b097))

## [0.20.1](https://github.com/ERC725Alliance/erc725.js/compare/v0.20.0...v0.20.1) (2023-10-30)


### Bug Fixes

* incorrect permission value for `EXECUTE_RELAY_CALL` ([55b8f5e](https://github.com/ERC725Alliance/erc725.js/commit/55b8f5e64c29c5a85d872f605667c88c1546f6b3))

## [0.20.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.19.0...v0.20.0) (2023-10-18)


### Features

* add permission `EXECUTE_RELAY_CALL` ([6db8835](https://github.com/ERC725Alliance/erc725.js/commit/6db8835ccd9d1082d9e8184bb2f14972760bea69))

## [0.19.0](https://github.com/ERC725Alliance/erc725.js/compare/v0.18.0...v0.19.0) (2023-10-05)


### ⚠ BREAKING CHANGES

* change LSP3 to SupportedStandards:LSP3Profile ([#307](https://github.com/ERC725Alliance/erc725.js/issues/307))
* new encoding for static value types (not arrays `[]`) ([#288](https://github.com/ERC725Alliance/erc725.js/issues/288))
* change `ArrayLength` value from `uint256` to `uint128` ([#287](https://github.com/ERC725Alliance/erc725.js/issues/287))

### Features

* add checkPermissions function ([17d2258](https://github.com/ERC725Alliance/erc725.js/commit/17d225843c236951ef1515a0ff91095b5ef27cd3))
* add schemas for LSP8 + LSP17 ([#311](https://github.com/ERC725Alliance/erc725.js/issues/311)) ([1e8dbf7](https://github.com/ERC725Alliance/erc725.js/commit/1e8dbf765c6c5e250539b402e9bd5a395966a8c2))


### Bug Fixes

* decode any uint256 as number not string ([#289](https://github.com/ERC725Alliance/erc725.js/issues/289)) ([37203f1](https://github.com/ERC725Alliance/erc725.js/commit/37203f14d313a0caff75724dc74175c741c1b540))
* dependencies & example ([#302](https://github.com/ERC725Alliance/erc725.js/issues/302)) ([9979e89](https://github.com/ERC725Alliance/erc725.js/commit/9979e89e438cd9f7cc586d7dc271de969f13b125))
* incorrect value in schema for array length in `...Map` ([#310](https://github.com/ERC725Alliance/erc725.js/issues/310)) ([0d28b13](https://github.com/ERC725Alliance/erc725.js/commit/0d28b1317dc085078090a8babacf4db517d91a87))
* Remove hardcoded require ([5279278](https://github.com/ERC725Alliance/erc725.js/commit/527927812b1a05b13f8dc6b14aecaa6d24e98d61))
* variable naming ([44b4785](https://github.com/ERC725Alliance/erc725.js/commit/44b47851ed63b817edc21c63655d67bac13a7e7f))


### Code Refactoring

* change `ArrayLength` value from `uint256` to `uint128` ([#287](https://github.com/ERC725Alliance/erc725.js/issues/287)) ([c95ee8a](https://github.com/ERC725Alliance/erc725.js/commit/c95ee8a53bf25bcf47777054af27cae1fbad8b2f))
* change LSP3 to SupportedStandards:LSP3Profile ([#307](https://github.com/ERC725Alliance/erc725.js/issues/307)) ([73f3481](https://github.com/ERC725Alliance/erc725.js/commit/73f34818fe152c3ab5299177adc0eddfed6886c5))
* new encoding for static value types (not arrays `[]`) ([#288](https://github.com/ERC725Alliance/erc725.js/issues/288)) ([f0b04da](https://github.com/ERC725Alliance/erc725.js/commit/f0b04daa57a281c537a8f28594439573188f0dce))

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
