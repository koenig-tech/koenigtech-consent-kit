# Usage

## Standard Integration

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
      metaPixelId: "000000000000000",
      tikTokPixelId: "",
      linkedInPartnerId: ""
    }
  });
</script>
```

## Branding

Each website can set its own brand color:

```css
:root {
  --kt-consent-accent: #0f6bff;
  --kt-consent-accent-text: #ffffff;
  --kt-consent-radius: 8px;
}
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
KoenigConsent.reset()
```

Listen for consent changes:

```js
document.addEventListener("koenigtech:consent", function (event) {
  console.log(event.detail);
});
```

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
