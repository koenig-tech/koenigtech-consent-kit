# KoenigTech Consent WordPress Plugin

Installable WordPress wrapper for the KoenigTech Consent Kit.

## Build

From the repository root:

```bash
npm run build
npm run package:wordpress
```

Output:

```txt
wordpress-plugin/build/koenigtech-consent-wordpress.zip
```

## Install

In WordPress:

1. Go to **Plugins > Add New > Upload Plugin**.
2. Upload `koenigtech-consent-wordpress.zip`.
3. Activate **KoenigTech Consent**.
4. Open **Settings > KoenigTech Consent**.

## Settings

Set these for each site:

```txt
Project ID
Consent Version
Language
Fallback Language
Privacy Policy URL
Legal Notice URL
Google Consent Mode
GA4 ID
Google Ads ID
Google Tag Manager ID
Meta Pixel ID
```

Use `de` for German sites and `en` for English sites.

## Updates

The plugin checks GitHub Releases from:

```txt
https://github.com/koenig-tech/koenigtech-consent-kit/releases
```

For WordPress updates to work, every release must include this asset:

```txt
koenigtech-consent-wordpress.zip
```

WordPress will then show an update when the GitHub release version is newer than the installed plugin version. Automatic plugin updates can be enabled from the WordPress plugins screen.

Do not load `main` directly on production WordPress sites.
