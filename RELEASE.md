# Release Process

Releases are published to NPM when `develop` is merged into `main` AND when the merged code contains a version bump in the `package.json`.

## Create and publish a new release:

### Bump version

You can manually trigger the [Bump version](https://github.com/ERC725Alliance/erc725.js/actions/workflows/bump-version.yml) workflow from the `develop` branch.

To bump locally:

1. Checkout to a new release branch from `develop`.
2. Bump version with [standard-version](https://github.com/conventional-changelog/standard-version). To create pre-release or specific versions, see below.

```bash
npm run release
```

3. Push the changes to origin, **WITH TAGS**.

```bash
git push --follow-tags origin
```

4. Open a PR from your release branch to `develop` and merge it.

### Release

- Merge `develop` into `main` through a PR.
- The CI will create a GitHub release and publish to NPM.

If it fails, you can manually trigger the workflow from the [Actions](https://github.com/ERC725Alliance/erc725.js/actions/workflows/release.yml) tab.

## Specific Version Increases

To ignore the automatic version increase in favour of a custom version use the `--release-as` flag with the argument `major`, `minor` or `patch` or a specific version number:

```bash
npm run release -- --release-as minor
# Or
npm run release -- --release-as 1.1.0
```

## Prerelease versions

To create a pre-release run:

```bash
npm run release -- --prerelease
```

If the lastest version is 1.0.0, the pre-release command will change the version to: `1.0.1-0`

To name the pre-release, set the name by adding `--prerelease <name>`

```bash
npm run release -- --prerelease alpha
```

If the latest version is 1.0.0 this will change the version to: `1.0.1-alpha.0`
