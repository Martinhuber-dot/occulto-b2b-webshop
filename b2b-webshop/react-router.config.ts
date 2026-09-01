import type { Config } from "@react-router/dev/config";

// Shopify App Proxy forwards storefront form submissions server-to-server:
// the browser POSTs to the storefront domain (b2b.occulto.de), Shopify
// relays it to this app on its own domain (b2b-app.occulto.de) while
// preserving the original Origin header. React Router's built-in CSRF guard
// otherwise rejects that legitimate cross-origin action submission.
export default {
  allowedActionOrigins: ["b2b.occulto.de"],
} satisfies Config;
