# Usage

## Standard Integration

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
      metaPixelId: "000000000000000",
      tikTokPixelId: "",
      linkedInPartnerId: ""
    }
});
</script>
```

## Language

Built-in languages:

```txt
de
en
```

Set the language explicitly for production sites:

```js
KoenigConsent.init({
  projectId: "client-name",
  lang: "de",
  fallbackLang: "en"
});
```

The kit also understands common aliases such as `de-DE`, `deutsch`, `german`, `en-US`, and `en-GB`.

Override copy per project with `translations`:

```js
KoenigConsent.init({
  projectId: "client-name",
  lang: "de",
  fallbackLang: "en",
  translations: {
    de: {
      bannerTitle: "Datenschutz-Einstellungen",
      rejectAll: "Nur notwendige"
    }
  }
});
```

## Branding

Each website can set its own brand color:

```html
<link rel="stylesheet" href="/assets/vendor/koenig-consent/koenig-consent.min.css">
<style>
  :root {
    --kt-consent-accent: #0f6bff;
    --kt-consent-accent-text: #ffffff;
    --kt-consent-radius: 8px;
  }
</style>
```

Use the client brand primary color for `--kt-consent-accent`. Keep `--kt-consent-accent-text` white unless contrast is poor.

## Categories

| Category | Default | Use For |
| --- | --- | --- |
| `necessary` | Always active | Core website functionality, consent storage, form handling |
| `security` | Always active | Bot protection, spam protection, abuse prevention |
| `preferences` | Off until consent | Language, display, remembered settings |
| `analytics` | Off until consent | GA4, Plausible with cookies, Hotjar-style analytics |
| `marketing` | Off until consent | Meta Pixel, Google Ads, TikTok Pixel, LinkedIn Insight |
| `external_media` | Off until consent | Google Maps, YouTube, Vimeo, social embeds |

## Footer Settings Link

```html
<span data-kt-consent-settings-link></span>
```

Manual button:

```html
<button type="button" onclick="KoenigConsent.showSettings()">Cookie-Einstellungen</button>
```

## External Media

```html
<iframe
  title="Google Maps"
  loading="lazy"
  data-kt-consent-category="external_media"
  data-kt-consent-src="https://www.google.com/maps?q=D%C3%BCsseldorf&output=embed">
</iframe>
```

## API

```js
KoenigConsent.init(config)
KoenigConsent.showSettings()
KoenigConsent.acceptAll()
KoenigConsent.rejectAll()
KoenigConsent.updateConsent({ analytics: true, marketing: false })
KoenigConsent.hasConsent("marketing")
KoenigConsent.getConsent()
KoenigConsent.scanPage()
KoenigConsent.reset()
```

Listen for consent changes:

```js
document.addEventListener("koenigtech:consent", function (event) {
  console.log(event.detail);
});
```

## Scanner

Run this before launch in a fresh/private browser session:

```js
KoenigConsent.scanPage()
```

The scanner reports common vendors, the likely consent category, and whether a detected embed is controlled by `data-kt-consent-src`.

You can also log a scan automatically while developing:

```js
KoenigConsent.init({
  projectId: "client-name",
  scanOnInit: true
});
```

Limit: this is a lightweight DOM scanner, not a legal-grade crawler. It cannot detect scripts injected after user actions unless you run it again after that action.

## Pre-launch Checklist

- No GA4, Ads, Meta, TikTok, LinkedIn, Hotjar, Maps, YouTube, or chat widget loads before consent.
- Reject all works and does not load optional vendors.
- Customize has no pre-enabled optional categories.
- Footer has a cookie settings link.
- Google Fonts are self-hosted.
- Google Maps and YouTube use placeholders.
- Privacy/cookie policy lists every active vendor.
- Consent version is set per project.
- Re-test after adding any new third-party script.
- Run `KoenigConsent.scanPage()` before launch and review every finding.
