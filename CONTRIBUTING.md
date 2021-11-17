# Contribute to erc725.js

## Building

```shell script
npm run build
```

## Testing

```sh
npm test
```

## Release

To release a new version and publsih it to NPM:

1. Checkout to a new branch: `release-*`
2. Run: `npm run release`
3. Push: `git push --follow-tags origin`
4. Merge PR
5. Create release from GitHub
6. The CI will publish to npm
