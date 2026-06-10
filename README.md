# KoenigTech Consent Kit

Reusable cookie and tracking consent for simple KoenigTech/client websites.

This kit is for custom-coded brochure sites, local business sites, landing pages, and lead-generation websites. It is a compliance aid, not legal advice. Each project still needs a correct privacy/cookie policy and a real check that optional services are not loaded before consent.

## Recommended GitHub Repo Name

Use:

```txt
koenigtech-consent-kit
```

Repository:

```txt
https://github.com/koenig-tech/koenigtech-consent-kit
```

Good alternatives:

```txt
koenigtech-cookie-consent
koenigtech-privacy-consent
koenig-consent-kit
```

My recommendation is `koenigtech-consent-kit` because it is clear, company-owned, and not limited only to cookies. The kit also handles pixels, analytics, maps, and external media.

## Folder Structure

```txt
koenigtech-consent-kit/
  dist/
    koenig-consent.css
    koenig-consent.js
    koenig-consent.min.css
    koenig-consent.min.js
  docs/
    PRIVACY-POLICY-TEMPLATE.md
    RELEASES.md
    USAGE.md
  examples/
    cdn.html
    demo.html
  CHANGELOG.md
  LICENSE
  package.json
  README.md
```

## Use In A Website

Copy the `dist/` files into the client website:

```txt
assets/vendor/koenig-consent/
  koenig-consent.min.css
  koenig-consent.min.js
```

Add this before optional tracking scripts:

```html
<link rel="stylesheet" href="/assets/vendor/koenig-consent/koenig-consent.min.css">

<script src="/assets/vendor/koenig-consent/koenig-consent.min.js"></script>
<script>
  KoenigConsent.init({
    projectId: "client-name",
    version: "2026-06-09",
    lang: "de",
    fallbackLang: "en",
    privacyUrl: "/datenschutz.html",
    imprintUrl: "/impressum.html",
    services: {
      googleConsentMode: true,
      ga4Id: "G-XXXXXXXXXX",
      googleAdsId: "AW-XXXXXXXXXX",
      metaPixelId: "000000000000000"
    }
  });
</script>
```

Add a footer settings link:

```html
<span data-kt-consent-settings-link></span>
```

## Language Support

The kit includes German and English text packs. It reads `document.documentElement.lang` by default, but production projects should set the language explicitly:

```js
KoenigConsent.init({
  projectId: "client-name",
  lang: "de",
  fallbackLang: "en"
});
```

Supported aliases include `de`, `de-DE`, `deutsch`, `german`, `en`, `en-US`, `en-GB`, and `english`.

Projects can override built-in copy or add another language through `translations`:

```js
KoenigConsent.init({
  projectId: "client-name",
  lang: "de",
  fallbackLang: "en",
  translations: {
    de: {
      bannerTitle: "Datenschutz-Einstellungen",
      acceptAll: "Alles akzeptieren"
    }
  }
});
```

## Brand Color Per Website

Set CSS variables after the consent CSS so the website brand color overrides the kit defaults:

```html
<style>
  :root {
    --kt-consent-accent: #157347;
    --kt-consent-accent-text: #ffffff;
    --kt-consent-radius: 8px;
  }
</style>
```

Available core variables:

```css
:root {
  --kt-consent-bg: #ffffff;
  --kt-consent-text: #15171a;
  --kt-consent-muted: #5f6670;
  --kt-consent-border: #d8dce2;
  --kt-consent-accent: #0f6bff;
  --kt-consent-accent-text: #ffffff;
  --kt-consent-radius: 8px;
}
```

## External Media

Do not put the real provider URL in `src`. Use `data-kt-consent-src`:

```html
<iframe
  title="Google Maps"
  loading="lazy"
  data-kt-consent-category="external_media"
  data-kt-consent-src="https://www.google.com/maps?q=D%C3%BCsseldorf&output=embed">
</iframe>
```

## Scanner

The kit includes a lightweight scanner for KoenigTech pre-launch checks. It detects common vendors such as GA4, Google Ads, GTM, Meta Pixel, TikTok, LinkedIn, Hotjar, HubSpot, Google Maps, YouTube, Vimeo, Google Fonts, Calendly, and Setmore.

Run it in the browser console:

```js
KoenigConsent.scanPage()
```

Or enable it during development:

```js
KoenigConsent.init({
  projectId: "client-name",
  scanOnInit: true
});
```

The scanner is not a full legal CMP crawler. It helps find obvious scripts, links, iframes, and embeds that should be reviewed before launch.

## Update Strategy

Use GitHub as the source of truth, but do not load from `main` in production.

Best default:

1. Tag releases, for example `v1.0.0`.
2. Copy `dist/` files from that release into each client project.
3. Update clients one by one after testing.

For CDN use, only use pinned versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/koenig-tech/koenigtech-consent-kit@v1.3.0/dist/koenig-consent.min.css">
<script src="https://cdn.jsdelivr.net/gh/koenig-tech/koenigtech-consent-kit@v1.3.0/dist/koenig-consent.min.js"></script>
```

Never use `@main` on client websites.

See the ready-to-copy CDN example:

```txt
examples/cdn.html
```

If jsDelivr has a temporary edge issue, keep the pinned version and retry after a few minutes. Do not switch production sites to `@main`.

## WordPress Plugin

For WordPress sites, use the installable plugin wrapper:

```txt
wordpress-plugin/build/koenigtech-consent-wordpress.zip
```

Build it with:

```bash
npm run build
npm run package:wordpress
```

The plugin adds:

```txt
Settings > KoenigTech Consent
```

It can load the bundled consent kit, set German/English language options, configure legal URLs and tracking IDs, and check GitHub Releases for updates.

WordPress plugin updates require a GitHub release asset named:

```txt
koenigtech-consent-wordpress.zip
```

When a newer release exists, WordPress shows an available plugin update. If automatic plugin updates are enabled in WordPress, the plugin can update from GitHub automatically.

## Commands

Check JavaScript syntax:

```bash
npm run check
```

Build minified production files:

```bash
npm run build
```

Build the WordPress plugin zip:

```bash
npm run package:wordpress
```

Run demo locally from the repo root:

```bash
npm run dev
```

Open:

```txt
http://127.0.0.1:8030/examples/demo.html
```

## When To Use A Paid CMP Instead

Use CookieYes, Cookiebot/Usercentrics, Complianz, iubenda, Didomi, or OneTrust if the client has ecommerce tracking, many vendors, programmatic ads, IAB TCF requirements, multiple markets, or needs formal consent scan reports.
