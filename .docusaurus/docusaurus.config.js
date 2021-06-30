export default {
  "title": "erc725.js",
  "baseUrl": "/",
  "url": "http://docs.lukso.network",
  "plugins": [
    [
      "docusaurus-plugin-typedoc",
      {
        "entryPoints": [
          "./src/index.ts"
        ],
        "tsconfig": "./tsconfig.json"
      }
    ]
  ],
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "readme": "none",
        "docs": {
          "routeBasePath": "/",
          "editUrl": "https://github.com/lukso-network/docs-website/tree/main/"
        }
      }
    ]
  ],
  "baseUrlIssueBanner": true,
  "i18n": {
    "defaultLocale": "en",
    "locales": [
      "en"
    ],
    "localeConfigs": {}
  },
  "onBrokenLinks": "throw",
  "onBrokenMarkdownLinks": "warn",
  "onDuplicateRoutes": "warn",
  "customFields": {},
  "themes": [],
  "themeConfig": {
    "colorMode": {
      "defaultMode": "light",
      "disableSwitch": false,
      "respectPrefersColorScheme": false,
      "switchConfig": {
        "darkIcon": "🌜",
        "darkIconStyle": {},
        "lightIcon": "🌞",
        "lightIconStyle": {}
      }
    },
    "docs": {
      "versionPersistence": "localStorage"
    },
    "metadatas": [],
    "navbar": {
      "hideOnScroll": false,
      "items": []
    },
    "prism": {
      "additionalLanguages": []
    },
    "hideableSidebar": false
  },
  "titleDelimiter": "|",
  "noIndex": false
};