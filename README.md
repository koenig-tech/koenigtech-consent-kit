# KoenigTech Consent Kit

Reusable cookie and tracking consent for simple KoenigTech/client websites.

This kit is for custom-coded brochure sites, local business sites, landing pages, and lead-generation websites. It is a compliance aid, not legal advice. Each project still needs a correct privacy/cookie policy and a real check that optional services are not loaded before consent.

## Recommended GitHub Repo Name

Use:

```txt
koenigtech-consent-kit
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
  docs/
    PRIVACY-POLICY-TEMPLATE.md
    RELEASES.md
    USAGE.md
  examples/
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
  koenig-consent.css
  koenig-consent.js
```

Add this before optional tracking scripts:

```html
<link rel="stylesheet" href="/assets/vendor/koenig-consent/koenig-consent.css">

<script src="/assets/vendor/koenig-consent/koenig-consent.js"></script>
<script>
  KoenigConsent.init({
    projectId: "client-name",
    version: "2026-06-01",
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

## Brand Color Per Website

Set CSS variables before or after the consent CSS:

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

## Update Strategy

Use GitHub as the source of truth, but do not load from `main` in production.

Best default:

1. Tag releases, for example `v1.0.0`.
2. Copy `dist/` files from that release into each client project.
3. Update clients one by one after testing.

For CDN use, only use pinned versions:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/koenigtech/koenigtech-consent-kit@v1.0.0/dist/koenig-consent.css">
<script src="https://cdn.jsdelivr.net/gh/koenigtech/koenigtech-consent-kit@v1.0.0/dist/koenig-consent.js"></script>
```

Never use `@main` on client websites.

## Commands

Check JavaScript syntax:

```bash
npm run check
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
