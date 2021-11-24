# Release Process

Releases are published to NPM when a [GitHub release](https://github.com/ERC725Alliance/erc725.js/releases/new) is created.

## Create and publish a new release:

1. Checkout to a new release branch.
2. Bump version with [standard-version](https://github.com/conventional-changelog/standard-version):

```bash
npm run release
```

3.  Then push the changes to origin, **with tags** and open a PR.

```bash
git push --follow-tags origin
```

4. Merge the PR to main.
5. Create a new [GitHub release](https://github.com/ERC725Alliance/erc725.js/releases/new) with the tag you just created.
6. The CI will build and publish to npm.

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
