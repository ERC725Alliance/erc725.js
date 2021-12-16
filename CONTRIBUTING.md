# Contributing to erc725.js

## Commits and PRs

This project uses Conventional Commits to generate release notes and to determine versioning. Commit messages should adhere to this standard and be of the form:

```bash
git commit -m "feat: Add new feature x"
git commit -m "fix: Fix bug in feature x"
git commit -m "docs: Add documentation for feature x"
git commit -m "test: Add test suite for feature x"
```

Further details on `conventional commits` can be found here: https://www.conventionalcommits.org/en/v1.0.0/

## Building

```shell script
npm run build
```

This will build the library into `/build`

## Testing

```shell script
npm test
```

Will build and then publish the package to npm.

## Release

To release and publish a new version, check [RELEASE](./RELEASE.md).
