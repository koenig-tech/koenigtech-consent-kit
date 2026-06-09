# Changelog

## 1.3.0 - 2026-06-09

- Add the KoenigTech Consent WordPress plugin wrapper.
- Add WordPress settings for language, legal links, Google Consent Mode, GA4, Google Ads, GTM, and Meta Pixel.
- Add a GitHub Releases updater for WordPress plugin updates.
- Add a WordPress plugin packaging workflow.

## 1.2.0 - 2026-06-09

- Add explicit language normalization for German and English.
- Add `fallbackLang` support.
- Add `translations` support so projects can extend or override built-in language packs.
- Update the default consent version to `2026-06-09`.

## 1.1.1 - 2026-06-01

- Persist optional-category revocations when a user switches a saved consent category off and closes the settings modal.
- Keep new optional consent gated behind explicit save, accept-all, or placeholder load actions.

## 1.1.0 - 2026-06-01

- Add automatic production build for minified CSS and JavaScript assets.
- Add lightweight page scanner via `KoenigConsent.scanPage()`.
- Add optional `scanOnInit` development flag.
- Update GitHub Actions release workflow to upload and purge minified files.
- Expand usage documentation for production setup and scanner workflow.

## 1.0.1 - 2026-06-01

- Add GitHub Actions CI workflow.
- Add automatic GitHub Release workflow for version tags.
- Add release version check to prevent tag/package mismatch.

## 1.0.0 - 2026-06-01

- Initial KoenigTech consent kit.
- Supports necessary, security, preferences, analytics, marketing, and external media categories.
- Adds Google Consent Mode v2 defaults and updates.
- Adds GA4, Google Ads, GTM, Meta Pixel, TikTok Pixel, LinkedIn Insight, Plausible, and external media placeholders.
- Adds brand color customization through CSS variables.
