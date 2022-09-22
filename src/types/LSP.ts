// https://docs.lukso.tech/standards/introduction

export enum LSPType {
  // LSPs which are contract interfaces
  LSP0ERC725Account = 'LSP0ERC725Account',
  LSP1UniversalReceiver = 'LSP1UniversalReceiver',
  LSP1UniversalReceiverDelegate = 'LSP1UniversalReceiverDelegate',
  LSP6KeyManager = 'LSP6KeyManager',
  LSP7DigitalAsset = 'LSP7DigitalAsset',
  LSP8IdentifiableDigitalAsset = 'LSP8IdentifiableDigitalAsset',
  LSP9Vault = 'LSP9Vault',

  // LSPs which are storage schemas
  LSP3UniversalProfile = 'LSP3UniversalProfile',
  LSP4DigitalAssetMetadata = 'LSP4DigitalAssetMetadata',

  /**
    NOTE: LSP5ReceivedAssets, LSP10ReceivedVaults, and LSP12IssuedAssets 
    are not included as an LSPType to check against an interface ID or 
    schema standard, as they are purely metadata standards, which should
    be performed individually.
  */
}
