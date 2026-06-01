# Release Process

## Branching

Use `main` for stable released code.

For changes:

```bash
git switch -c feature/short-description
```

## Commit Style

Keep commits small and understandable:

```txt
feat: add consent settings modal
fix: prevent maps iframe before consent
docs: add release instructions
chore: bump version to 1.0.1
```

## Versioning

Use semantic versions:

```txt
1.0.0 initial stable release
1.0.1 bug fix, no integration change
1.1.0 new option or service support
2.0.0 breaking API or attribute change
```

Update both:

```txt
package.json
CHANGELOG.md
```

## Before A Release

Run:

```bash
npm run check
npm run build
RELEASE_TAG=v1.1.0 npm run check:release
npm run dev
```

Replace `v1.1.0` with the version being released. The GitHub Actions release workflow receives this value automatically from the pushed tag.


Then test:

- first banner appears
- reject all blocks optional scripts
- customize modal opens
- external media placeholder blocks iframe
- accept all loads configured services
- footer settings link reopens modal

## Create A Release

```bash
git add .
git commit -m "chore: release v1.1.0"
git push origin main
git tag v1.1.0
git push origin v1.1.0
```

Pushing the tag starts the GitHub Actions release workflow. The workflow:

- checks JavaScript syntax
- builds minified production files
- checks that `package.json` version matches the tag
- creates a GitHub Release
- attaches normal files, minified files, and a source archive
- purges jsDelivr cache for the tagged CDN files

## Updating Client Websites

Preferred method:

1. Download/copy `dist/koenig-consent.css` and `dist/koenig-consent.js` from the tagged release.
2. Replace the files in the client project.
3. Test reject, customize, accept, and external media.
4. Deploy.

Do not auto-update every client from `main`. Each client should stay pinned to a known version.
