/*!
 * KoenigTech Consent Kit
 * Reusable consent manager for simple EU/UK-style websites.
 */
(function () {
  "use strict";

  var DEFAULT_VERSION = "2026-06-09";
  var CONSENT_EVENT = "koenigtech:consent";
  var STORAGE_PREFIX = "koenigtech_consent_";
  var FALLBACK_LANG = "en";
  var loadedScripts = {};

  var TEXT = {
    en: {
      bannerTitle: "Cookies",
      bannerText:
        "We use cookies and external services. You can accept, reject, or choose your settings.",
      settingsText:
        "We use necessary technologies to run this website. With your consent, we also use analytics, marketing, preferences, and external media services.",
      acceptAll: "Accept all",
      rejectAll: "Reject all",
      customize: "Customize",
      save: "Save settings",
      close: "Close",
      alwaysOn: "Always active",
      settingsTitle: "Privacy preferences",
      privacyPolicy: "Privacy policy",
      imprint: "Legal notice",
      reopen: "Cookie settings",
      placeholderTitle: "External content is blocked",
      placeholderText:
        "This content is loaded from an external provider. You can load it by allowing external media.",
      placeholderButton: "Load content",
      categories: {
        necessary: {
          title: "Necessary",
          description:
            "Required for core website functions such as page navigation, security, consent storage, and form handling."
        },
        security: {
          title: "Security",
          description:
            "Protects forms and services from spam, misuse, and automated abuse. Load only where it is required."
        },
        preferences: {
          title: "Preferences",
          description:
            "Stores choices such as language, layout, or display settings."
        },
        analytics: {
          title: "Analytics",
          description:
            "Helps us understand website usage so we can improve pages, content, and performance."
        },
        marketing: {
          title: "Marketing",
          description:
            "Used for advertising, conversion measurement, remarketing, and personalized campaigns."
        },
        external_media: {
          title: "External media",
          description:
            "Loads content from providers such as Google Maps, YouTube, Vimeo, or social media embeds."
        }
      }
    },
    de: {
      bannerTitle: "Cookies",
      bannerText:
        "Wir nutzen Cookies und externe Dienste. Sie können akzeptieren, ablehnen oder Ihre Auswahl anpassen.",
      settingsText:
        "Wir nutzen notwendige Technologien, damit diese Website funktioniert. Mit Ihrer Einwilligung nutzen wir auch Analyse, Marketing, Präferenzen und externe Medien.",
      acceptAll: "Alle akzeptieren",
      rejectAll: "Alle ablehnen",
      customize: "Anpassen",
      save: "Einstellungen speichern",
      close: "Schließen",
      alwaysOn: "Immer aktiv",
      settingsTitle: "Privatsphäre-Einstellungen",
      privacyPolicy: "Datenschutzerklärung",
      imprint: "Impressum",
      reopen: "Cookie-Einstellungen",
      placeholderTitle: "Externer Inhalt ist blockiert",
      placeholderText:
        "Dieser Inhalt wird von einem externen Anbieter geladen. Sie können ihn laden, indem Sie externe Medien erlauben.",
      placeholderButton: "Inhalt laden",
      categories: {
        necessary: {
          title: "Notwendig",
          description:
            "Erforderlich für zentrale Website-Funktionen wie Navigation, Sicherheit, Einwilligungsspeicherung und Formulare."
        },
        security: {
          title: "Sicherheit",
          description:
            "Schützt Formulare und Dienste vor Spam, Missbrauch und automatisierten Zugriffen. Nur dort laden, wo es erforderlich ist."
        },
        preferences: {
          title: "Präferenzen",
          description:
            "Speichert Einstellungen wie Sprache, Layout oder Anzeigeoptionen."
        },
        analytics: {
          title: "Analyse",
          description:
            "Hilft uns zu verstehen, wie die Website genutzt wird, damit wir Seiten, Inhalte und Performance verbessern können."
        },
        marketing: {
          title: "Marketing",
          description:
            "Wird für Werbung, Conversion-Messung, Remarketing und personalisierte Kampagnen genutzt."
        },
        external_media: {
          title: "Externe Medien",
          description:
            "Lädt Inhalte von Anbietern wie Google Maps, YouTube, Vimeo oder Social-Media-Einbettungen."
        }
      }
    }
  };

  var LANGUAGE_ALIASES = {
    de: "de",
    "de-de": "de",
    "de-at": "de",
    "de-ch": "de",
    deutsch: "de",
    german: "de",
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    english: "en"
  };

  var DEFAULT_CATEGORIES = [
    { id: "necessary", required: true },
    { id: "security", required: true },
    { id: "preferences", required: false },
    { id: "analytics", required: false },
    { id: "marketing", required: false },
    { id: "external_media", required: false }
  ];

  var state = {
    config: null,
    consent: null,
    banner: null,
    modal: null,
    initialized: false
  };

  function init(userConfig) {
    state.config = mergeConfig(userConfig || {});
    state.consent = readConsent();
    state.initialized = true;

    initGoogleConsentDefault();
    applyConsent();
    setupPlaceholders();

    if (state.config.scanOnInit) {
      scanPage();
    }

    if (!isValidConsent(state.consent)) {
      showBanner();
    }

    if (state.config.showFloatingSettings && isValidConsent(state.consent)) {
      renderFloatingSettings();
    }

    document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: getConsent() }));
  }

  function mergeConfig(userConfig) {
    var translations = userConfig.translations || {};
    var fallbackLang = normalizeLanguage(userConfig.fallbackLang || FALLBACK_LANG, translations, FALLBACK_LANG);
    var lang = normalizeLanguage(userConfig.lang || document.documentElement.lang || fallbackLang, translations, fallbackLang);

    var config = {
      version: userConfig.version || DEFAULT_VERSION,
      storageKey: userConfig.storageKey || STORAGE_PREFIX + (userConfig.projectId || "default"),
      consentMaxAgeDays: userConfig.consentMaxAgeDays || 180,
      lang: lang,
      fallbackLang: fallbackLang,
      privacyUrl: userConfig.privacyUrl || "/datenschutz.html",
      imprintUrl: userConfig.imprintUrl || "/impressum.html",
      proofEndpoint: userConfig.proofEndpoint || "",
      showFloatingSettings: userConfig.showFloatingSettings !== false,
      categories: userConfig.categories || DEFAULT_CATEGORIES,
      services: userConfig.services || {},
      callbacks: userConfig.callbacks || {}
    };

    var fallbackText = deepMerge(TEXT[fallbackLang] || TEXT[FALLBACK_LANG], translations[fallbackLang] || {});
    var langText = deepMerge(TEXT[lang] || {}, translations[lang] || {});
    config.text = deepMerge(deepMerge(fallbackText, langText), userConfig.text || {});
    return config;
  }

  function normalizeLanguage(value, translations, fallback) {
    var raw = String(value || fallback || FALLBACK_LANG).toLowerCase();
    var normalized = LANGUAGE_ALIASES[raw] || LANGUAGE_ALIASES[raw.split("-")[0]] || raw.split("-")[0];

    if (TEXT[normalized] || (translations && translations[normalized])) {
      return normalized;
    }

    return fallback || FALLBACK_LANG;
  }

  function deepMerge(base, override) {
    var out = {};
    Object.keys(base || {}).forEach(function (key) {
      if (base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
        out[key] = deepMerge(base[key], (override || {})[key] || {});
      } else {
        out[key] = (override || {}).hasOwnProperty(key) ? override[key] : base[key];
      }
    });
    Object.keys(override || {}).forEach(function (key) {
      if (!out.hasOwnProperty(key)) out[key] = override[key];
    });
    return out;
  }

  function getCategoryIds() {
    return state.config.categories.map(function (category) {
      return category.id;
    });
  }

  function isRequiredCategory(categoryId) {
    var category = state.config.categories.find(function (item) {
      return item.id === categoryId;
    });
    return !!(category && category.required);
  }

  function makeConsent(values, source) {
    var categories = {};
    getCategoryIds().forEach(function (id) {
      categories[id] = isRequiredCategory(id) || !!values[id];
    });

    return {
      version: state.config.version,
      categories: categories,
      savedAt: new Date().toISOString(),
      source: source || "banner",
      language: state.config.lang,
      userAgent: navigator.userAgent
    };
  }

  function isValidConsent(consent) {
    if (!consent || consent.version !== state.config.version || !consent.savedAt) return false;

    var saved = new Date(consent.savedAt).getTime();
    var ageMs = Date.now() - saved;
    var maxAgeMs = state.config.consentMaxAgeDays * 24 * 60 * 60 * 1000;

    return ageMs >= 0 && ageMs <= maxAgeMs;
  }

  function readConsent() {
    if (!state.config) return null;

    try {
      return JSON.parse(localStorage.getItem(state.config.storageKey));
    } catch (error) {
      return readCookieConsent();
    }
  }

  function saveConsent(consent) {
    state.consent = consent;

    try {
      localStorage.setItem(state.config.storageKey, JSON.stringify(consent));
    } catch (error) {
      writeCookieConsent(consent);
    }

    sendConsentProof(consent);
    hideBanner();
    hideModal();
    renderFloatingSettings();
    applyConsent();
    setupPlaceholders();

    if (typeof state.config.callbacks.onChange === "function") {
      state.config.callbacks.onChange(consent);
    }

    document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: getConsent() }));
  }

  function readCookieConsent() {
    var encoded = document.cookie
      .split("; ")
      .find(function (item) {
        return item.indexOf(state.config.storageKey + "=") === 0;
      });

    if (!encoded) return null;

    try {
      return JSON.parse(decodeURIComponent(encoded.split("=").slice(1).join("=")));
    } catch (error) {
      return null;
    }
  }

  function writeCookieConsent(consent) {
    var maxAge = state.config.consentMaxAgeDays * 24 * 60 * 60;
    document.cookie =
      state.config.storageKey +
      "=" +
      encodeURIComponent(JSON.stringify(consent)) +
      "; max-age=" +
      maxAge +
      "; path=/; SameSite=Lax";
  }

  function sendConsentProof(consent) {
    if (!state.config.proofEndpoint || !navigator.sendBeacon) return;

    var payload = JSON.stringify({
      version: consent.version,
      categories: consent.categories,
      savedAt: consent.savedAt,
      source: consent.source,
      language: consent.language,
      page: location.href
    });

    navigator.sendBeacon(
      state.config.proofEndpoint,
      new Blob([payload], { type: "application/json" })
    );
  }

  function hasConsent(categoryId) {
    return !!(
      state.consent &&
      isValidConsent(state.consent) &&
      state.consent.categories &&
      state.consent.categories[categoryId]
    );
  }

  function getConsent() {
    return isValidConsent(state.consent) ? JSON.parse(JSON.stringify(state.consent)) : null;
  }

  function acceptAll(source) {
    var values = {};
    getCategoryIds().forEach(function (id) {
      values[id] = true;
    });
    saveConsent(makeConsent(values, source || "accept_all"));
  }

  function rejectAll(source) {
    saveConsent(makeConsent({}, source || "reject_all"));
  }

  function updateConsent(values, source) {
    saveConsent(makeConsent(values || {}, source || "settings"));
  }

  function resetConsent() {
    try {
      localStorage.removeItem(state.config.storageKey);
    } catch (error) {
      document.cookie = state.config.storageKey + "=; max-age=0; path=/; SameSite=Lax";
    }

    state.consent = null;
    showBanner();
    document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
  }

  function initGoogleConsentDefault() {
    var services = state.config.services;
    if (!services.googleConsentMode && !services.ga4Id && !services.googleAdsId && !services.gtmId) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500
    });
  }

  function updateGoogleConsent() {
    if (!window.gtag) return;

    window.gtag("consent", "update", {
      analytics_storage: hasConsent("analytics") ? "granted" : "denied",
      ad_storage: hasConsent("marketing") ? "granted" : "denied",
      ad_user_data: hasConsent("marketing") ? "granted" : "denied",
      ad_personalization: hasConsent("marketing") ? "granted" : "denied",
      functionality_storage: hasConsent("preferences") ? "granted" : "denied",
      security_storage: "granted"
    });
  }

  function applyConsent() {
    if (!state.config) return;

    var services = state.config.services;
    updateGoogleConsent();

    if (services.loadGtmBeforeConsent && services.gtmId) {
      loadGtm(services.gtmId);
    }

    if (hasConsent("analytics")) {
      if (services.ga4Id) loadGa4(services.ga4Id);
      if (services.plausibleDomain) loadPlausible(services.plausibleDomain);
    }

    if (hasConsent("analytics") || hasConsent("marketing")) {
      if (!services.loadGtmBeforeConsent && services.gtmId) loadGtm(services.gtmId);
    }

    if (hasConsent("marketing")) {
      if (services.googleAdsId) loadGoogleAds(services.googleAdsId);
      if (services.metaPixelId) loadMetaPixel(services.metaPixelId);
      if (services.tikTokPixelId) loadTikTokPixel(services.tikTokPixelId);
      if (services.linkedInPartnerId) loadLinkedInInsight(services.linkedInPartnerId);
    }
  }

  function loadScript(src, id, attrs) {
    var scriptId = id || src;
    if (loadedScripts[scriptId] || document.querySelector('script[data-kt-script="' + scriptId + '"]')) {
      return;
    }

    loadedScripts[scriptId] = true;

    var script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.setAttribute("data-kt-script", scriptId);

    Object.keys(attrs || {}).forEach(function (key) {
      script.setAttribute(key, attrs[key]);
    });

    document.head.appendChild(script);
  }

  function loadGa4(id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id), "ga4");
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  function loadGoogleAds(id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id), "google_ads");
    window.gtag("config", id);
  }

  function loadGtm(id) {
    if (loadedScripts.gtm) return;
    loadedScripts.gtm = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id), "gtm");
  }

  function loadPlausible(domain) {
    loadScript("https://plausible.io/js/script.js", "plausible", {
      "data-domain": domain
    });
  }

  function loadMetaPixel(pixelId) {
    if (window.fbq) {
      window.fbq("track", "PageView");
      return;
    }

    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];

    loadScript("https://connect.facebook.net/en_US/fbevents.js", "meta_pixel");
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }

  function loadTikTokPixel(pixelId) {
    if (window.ttq) {
      window.ttq.page();
      return;
    }

    window.TiktokAnalyticsObject = "ttq";
    var ttq = (window.ttq = window.ttq || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie"
    ];
    ttq.setAndDefer = function (target, method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i += 1) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.load = function (id) {
      loadScript("https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + encodeURIComponent(id), "tiktok_pixel");
    };
    ttq.load(pixelId);
    ttq.page();
  }

  function loadLinkedInInsight(partnerId) {
    window._linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    if (window._linkedin_data_partner_ids.indexOf(partnerId) === -1) {
      window._linkedin_data_partner_ids.push(partnerId);
    }
    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js", "linkedin_insight");
  }

  function setupPlaceholders() {
    var nodes = document.querySelectorAll("[data-kt-consent-src]");

    nodes.forEach(function (node) {
      var category = node.getAttribute("data-kt-consent-category") || "external_media";
      var src = node.getAttribute("data-kt-consent-src");

      if (hasConsent(category)) {
        activateExternalNode(node, src);
      } else {
        renderPlaceholder(node, category);
      }
    });
  }

  function activateExternalNode(node, src) {
    if (!src || node.getAttribute("src") === src) return;

    node.setAttribute("src", src);
    node.removeAttribute("aria-hidden");
    node.classList.remove("kt-consent-hidden");

    var placeholder = node.parentNode && node.parentNode.querySelector("[data-kt-consent-placeholder]");
    if (placeholder) placeholder.remove();
  }

  function renderPlaceholder(node, category) {
    if (!node.parentNode || node.parentNode.querySelector("[data-kt-consent-placeholder]")) return;

    node.removeAttribute("src");
    node.setAttribute("aria-hidden", "true");
    node.classList.add("kt-consent-hidden");

    var placeholder = document.createElement("div");
    placeholder.className = "kt-consent-placeholder";
    placeholder.setAttribute("data-kt-consent-placeholder", category);
    placeholder.innerHTML =
      '<div class="kt-consent-placeholder__inner">' +
      '<p><strong>' +
      escapeHtml(state.config.text.placeholderTitle) +
      "</strong></p>" +
      "<p>" +
      escapeHtml(state.config.text.placeholderText) +
      "</p>" +
      '<button class="kt-consent-button kt-consent-button--primary" type="button">' +
      escapeHtml(state.config.text.placeholderButton) +
      "</button>" +
      "</div>";

    placeholder.querySelector("button").addEventListener("click", function () {
      var next = {};
      getCategoryIds().forEach(function (id) {
        next[id] = hasConsent(id);
      });
      next[category] = true;
      saveConsent(makeConsent(next, "placeholder"));
    });

    node.parentNode.insertBefore(placeholder, node);
  }

  function showBanner() {
    if (state.banner) {
      state.banner.classList.remove("kt-consent-hidden");
      return;
    }

    var banner = document.createElement("div");
    banner.className = "kt-consent-banner";
    banner.setAttribute("aria-label", state.config.text.bannerTitle);
    banner.innerHTML =
      '<div class="kt-consent-banner__inner">' +
      '<h2 class="kt-consent-title">' +
      escapeHtml(state.config.text.bannerTitle) +
      "</h2>" +
      '<p class="kt-consent-text">' +
      escapeHtml(state.config.text.bannerText) +
      "</p>" +
      '<div class="kt-consent-actions">' +
      '<button class="kt-consent-button kt-consent-button--primary" data-kt-action="accept" type="button">' +
      escapeHtml(state.config.text.acceptAll) +
      "</button>" +
      '<button class="kt-consent-button" data-kt-action="reject" type="button">' +
      escapeHtml(state.config.text.rejectAll) +
      "</button>" +
      '<button class="kt-consent-button kt-consent-button--ghost" data-kt-action="settings" type="button">' +
      escapeHtml(state.config.text.customize) +
      "</button>" +
      "</div>" +
      '<div class="kt-consent-links">' +
      '<a class="kt-consent-link" href="' +
      escapeAttribute(state.config.privacyUrl) +
      '">' +
      escapeHtml(state.config.text.privacyPolicy) +
      "</a>" +
      '<a class="kt-consent-link" href="' +
      escapeAttribute(state.config.imprintUrl) +
      '">' +
      escapeHtml(state.config.text.imprint) +
      "</a>" +
      "</div>" +
      "</div>";

    banner.querySelector('[data-kt-action="accept"]').addEventListener("click", function () {
      acceptAll("banner_accept_all");
    });
    banner.querySelector('[data-kt-action="reject"]').addEventListener("click", function () {
      rejectAll("banner_reject_all");
    });
    banner.querySelector('[data-kt-action="settings"]').addEventListener("click", showSettings);

    state.banner = banner;
    document.body.appendChild(banner);
  }

  function hideBanner() {
    if (state.banner) state.banner.classList.add("kt-consent-hidden");
  }

  function showSettings() {
    if (state.modal) state.modal.remove();

    var modal = document.createElement("div");
    modal.className = "kt-consent-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "kt-consent-settings-title");
    modal.innerHTML =
      '<div class="kt-consent-dialog" tabindex="-1">' +
      '<div class="kt-consent-dialog__header">' +
      '<h2 class="kt-consent-title" id="kt-consent-settings-title">' +
      escapeHtml(state.config.text.settingsTitle) +
      "</h2>" +
      '<p class="kt-consent-text">' +
      escapeHtml(state.config.text.settingsText || state.config.text.bannerText) +
      "</p>" +
      "</div>" +
      '<div class="kt-consent-dialog__body">' +
      renderCategoryControls() +
      "</div>" +
      '<div class="kt-consent-dialog__footer">' +
      '<button class="kt-consent-button" data-kt-action="reject" type="button">' +
      escapeHtml(state.config.text.rejectAll) +
      "</button>" +
      '<button class="kt-consent-button" data-kt-action="close" type="button">' +
      escapeHtml(state.config.text.close) +
      "</button>" +
      '<button class="kt-consent-button kt-consent-button--primary" data-kt-action="save" type="button">' +
      escapeHtml(state.config.text.save) +
      "</button>" +
      '<button class="kt-consent-button kt-consent-button--primary" data-kt-action="accept" type="button">' +
      escapeHtml(state.config.text.acceptAll) +
      "</button>" +
      "</div>" +
      "</div>";

    modal.querySelector('[data-kt-action="reject"]').addEventListener("click", function () {
      rejectAll("settings_reject_all");
    });
    modal.querySelector('[data-kt-action="close"]').addEventListener("click", function () {
      saveRevocationsBeforeClose(modal);
    });
    modal.querySelector('[data-kt-action="accept"]').addEventListener("click", function () {
      acceptAll("settings_accept_all");
    });
    modal.querySelector('[data-kt-action="save"]').addEventListener("click", function () {
      updateConsent(collectModalValues(modal), "settings_save");
    });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) saveRevocationsBeforeClose(modal);
    });

    state.modal = modal;
    document.body.appendChild(modal);

    var dialog = modal.querySelector(".kt-consent-dialog");
    if (dialog) dialog.focus();
  }

  function collectModalValues(modal) {
    var values = {};
    modal.querySelectorAll("[data-kt-category-input]").forEach(function (input) {
      values[input.value] = input.checked;
    });
    return values;
  }

  function saveRevocationsBeforeClose(modal) {
    var values = {};
    var hasRevocation = false;

    modal.querySelectorAll("[data-kt-category-input]").forEach(function (input) {
      var categoryId = input.value;
      var current = hasConsent(categoryId);

      values[categoryId] = current;
      if (current && !input.checked && !isRequiredCategory(categoryId)) {
        values[categoryId] = false;
        hasRevocation = true;
      }
    });

    if (hasRevocation) {
      updateConsent(values, "settings_close_revocation");
      return;
    }

    hideModal();
  }

  function hideModal() {
    if (state.modal) {
      state.modal.remove();
      state.modal = null;
    }
  }

  function renderCategoryControls() {
    return state.config.categories
      .map(function (category) {
        var copy = state.config.text.categories[category.id] || {
          title: category.id,
          description: ""
        };
        var checked = category.required || hasConsent(category.id);
        var disabled = category.required ? " disabled" : "";
        var alwaysOn = category.required
          ? '<p><strong>' + escapeHtml(state.config.text.alwaysOn) + "</strong></p>"
          : "";

        return (
          '<div class="kt-consent-category">' +
          "<div>" +
          "<h3>" +
          escapeHtml(copy.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(copy.description) +
          "</p>" +
          alwaysOn +
          "</div>" +
          '<label class="kt-consent-toggle" aria-label="' +
          escapeAttribute(copy.title) +
          '">' +
          '<input data-kt-category-input type="checkbox" value="' +
          escapeAttribute(category.id) +
          '"' +
          (checked ? " checked" : "") +
          disabled +
          ">" +
          "<span></span>" +
          "</label>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderFloatingSettings() {
    if (!state.config.showFloatingSettings || document.querySelector("[data-kt-consent-reopen]")) return;

    var button = document.createElement("button");
    button.className = "kt-consent-reopen";
    button.type = "button";
    button.setAttribute("data-kt-consent-reopen", "");
    button.textContent = state.config.text.reopen;
    button.addEventListener("click", showSettings);

    var host = document.querySelector("[data-kt-consent-settings-link]");
    if (host) {
      host.appendChild(button);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  var SCAN_PATTERNS = [
    { vendor: "Google Analytics", category: "analytics", pattern: /googletagmanager\.com\/gtag\/js|google-analytics\.com|analytics\.google\.com/i },
    { vendor: "Google Tag Manager", category: "analytics/marketing", pattern: /googletagmanager\.com\/gtm\.js|GTM-/i },
    { vendor: "Google Ads", category: "marketing", pattern: /googleadservices\.com|doubleclick\.net|googletagmanager\.com\/gtag\/js\?id=AW-/i },
    { vendor: "Meta Pixel", category: "marketing", pattern: /connect\.facebook\.net|facebook\.com\/tr|fbq/i },
    { vendor: "TikTok Pixel", category: "marketing", pattern: /analytics\.tiktok\.com|tiktok\.com\/i18n\/pixel/i },
    { vendor: "LinkedIn Insight", category: "marketing", pattern: /snap\.licdn\.com|linkedin\.com\/px/i },
    { vendor: "Hotjar", category: "analytics", pattern: /hotjar\.com|static\.hotjar\.com/i },
    { vendor: "HubSpot", category: "analytics/marketing", pattern: /hubspot\.com|hs-scripts\.com|js\.hsforms\.net/i },
    { vendor: "Google Maps", category: "external_media", pattern: /google\.com\/maps|googleapis\.com\/maps|maps\.google/i },
    { vendor: "YouTube", category: "external_media", pattern: /youtube\.com\/embed|youtube-nocookie\.com/i },
    { vendor: "Vimeo", category: "external_media", pattern: /player\.vimeo\.com/i },
    { vendor: "Google Fonts", category: "preferences/external_request", pattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/i },
    { vendor: "Calendly", category: "external_media", pattern: /calendly\.com|assets\.calendly\.com/i },
    { vendor: "Setmore", category: "external_link_or_media", pattern: /setmore\.com/i }
  ];

  function scanPage(options) {
    var opts = options || {};
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("script[src], iframe[src], iframe[data-kt-consent-src], link[href], img[src], source[src]")
    );
    var findings = [];

    nodes.forEach(function (node) {
      var url =
        node.getAttribute("src") ||
        node.getAttribute("href") ||
        node.getAttribute("data-kt-consent-src") ||
        "";
      if (!url) return;

      SCAN_PATTERNS.forEach(function (item) {
        if (!item.pattern.test(url)) return;

        var blockedByConsent = !!node.getAttribute("data-kt-consent-src");
        var activeUrl = !!node.getAttribute("src") || !!node.getAttribute("href");
        var needsConsent =
          /analytics|marketing|external_media|external_request/.test(item.category) &&
          !blockedByConsent;

        findings.push({
          vendor: item.vendor,
          category: item.category,
          tag: node.tagName.toLowerCase(),
          url: url,
          blockedByConsent: blockedByConsent,
          activeBeforeConsentRisk: activeUrl && needsConsent,
          recommendation: blockedByConsent
            ? "Controlled by KoenigConsent."
            : "Review this service and block it behind the matching consent category if it is not strictly necessary."
        });
      });
    });

    var unique = [];
    var seen = {};
    findings.forEach(function (finding) {
      var key = finding.vendor + "|" + finding.tag + "|" + finding.url;
      if (seen[key]) return;
      seen[key] = true;
      unique.push(finding);
    });

    if (opts.log !== false && window.console) {
      console.group("KoenigConsent scan");
      if (console.table) console.table(unique);
      else console.log(unique);
      console.groupEnd();
    }

    return unique;
  }

  window.KoenigConsent = {
    init: init,
    acceptAll: acceptAll,
    rejectAll: rejectAll,
    showSettings: showSettings,
    updateConsent: updateConsent,
    reset: resetConsent,
    getConsent: getConsent,
    hasConsent: hasConsent,
    applyConsent: applyConsent,
    scanPage: scanPage
  };
})();
