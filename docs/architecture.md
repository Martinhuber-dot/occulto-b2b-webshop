# Architektur – Occulto B2B Shop

Stand: 2026-08-30 (Abend). Siehe [master-prompt.md](./master-prompt.md) für die vollständige Spezifikation.

## Beteiligte Systeme

```
JTL-Wawi (ERP, Single Source of Truth)
      │  JTL-Connector (JSON-RPC, bereits bestehend, App "JTL ERP-Connector")
      ▼
Shopify Store "B2B-Occulto" (ri1udz-iw.myshopify.com / b2b.occulto.de)
      │
      ├─ Theme "Trade" (Storefront, Repo: theme/)
      ├─ B2B Companies / Customer Accounts (nativ)
      ├─ Shopify Functions (Checkout-Validierung, läuft auf Shopify-Infra)
      └─ Custom App "b2b-webshop" (Repo: b2b-webshop/)
            ├─ App-Proxy-Route: Händlerregistrierung
            ├─ Admin-Seite: Händleranfragen-Freigabe
            └─ (noch nicht gehostet – siehe unten)
```

## Wer ist wofür zuständig?

| Bereich | Führendes System | Details |
|---|---|---|
| Artikel, Varianten, Bilder, Preise, Bestand | JTL-Wawi | über bestehenden JTL-Connector, push/pull je Entität (siehe [jtl-shopify-sync.md](./jtl-shopify-sync.md)) |
| Kundendaten (Firma, Adresse, Ansprechpartner) | Shopify (Erfassung) → JTL (pull) | Registrierung legt Shopify-Customer an, JTL-Wawi holt ihn per eigenem Sync-Zyklus |
| Kundenfreigabe / Company-Zuordnung | Shopify Admin (unsere App) | `app.dealers.tsx`, nutzt native B2B-Company-Mutationen |
| Mindestbestellwert | Shopify Function | `extensions/minimum-order-value/`, läuft serverlos auf Shopify |
| Zahlungsarten | Shopify nativ (Manual Payment Methods) | "Bank Deposit" (Vorkasse) + "Rechnung" (custom) |
| Theme / Storefront | Shopify Theme "Trade" | `theme/`, per Git versioniert |
| Zugriffsschutz (Preis/Kauf nur für freigeschaltete Händler) | Theme (Liquid) | `snippets/price.liquid`, `snippets/buy-buttons.liquid` |

## Grundprinzip

**Native Shopify-/JTL-Funktion vor Custom-Code.** Middleware (unsere App) existiert nur für das, was weder JTL-Connector noch native Shopify-Funktionen abdecken: die Registrierungs-/Freigabe-Logik und die Company-Verknüpfung.

## Aktueller Stand (2026-08-30)

**Fertig und live/getestet:**
- Markets: Deutschland (primär), Österreich, Schweiz
- Customer Accounts (neue, E-Mail+Code-basierte) provisioniert
- Kundenmetafelder für Registrierungsdaten (12 Felder, Namespace `app--416332316673`)
- Händler-Registrierungsformular (Theme) + App-Proxy-Backend-Route
- Admin-Freigabeseite mit nativen B2B-Company-Mutationen (Company/Location anlegen, Kontakt zuweisen, native Willkommens-E-Mail)
- Preis-/Kaufsperre für nicht freigeschaltete Besucher (Theme-Ebene), live geprüft — **inkl. Quick-Add-Buttons auf Kollektionskarten** (`card-product.liquid`), seit 2026-08-30 ebenfalls gegen `dealer-approved` abgesichert (vorher offene Lücke, jetzt geschlossen und live)
- Mindestbestellwert 350 € netto als Shopify Function, **live aktiv**, automatisiert getestet
- Zahlungsarten Rechnung + Vorkasse, nativ konfiguriert (Vorkasse-IBAN noch als Platzhalter zu befüllen)
- "Händler werden" im Hauptmenü verlinkt
- Deutsch als Sprache übersetzt und **veröffentlicht** (Shopify Translate & Adapt, Auto-Translate)
- **Frontend-Design an das bestehende B2C-Branding (www.occulto.de) angeglichen**: echtes Occulto-Logo (`docs/brand/occulto-logo.svg`, aus der Live-Seite extrahiert) als Theme-Logo hinterlegt, alle 5 Farbschemata auf die reale Occulto-Palette umgestellt (Schwarz/Weiß/Anthrazit `#1c1c1c`/`#2e2e2d`, Gold-Akzent `#f9ca4f` sparsam für Sale-Badge/CTA), Header auf helles Schema umgestellt (vorher dunkles Trade-Standardschema, worauf das schwarze Logo unlesbar war) — live auf dem Theme "Trade"
- **Typografie**: Überschrift- und Fließtext-Font von den Trade-Standardschriften (`dm_sans_n5`/`jost_n4`) auf `assistant_n4` umgestellt — einziger im Theme-Schema bereits gültiger Font-Handle, optisch näher am schlichten Helvetica/Arial-artigen Grotesk von occulto.de als die vorherigen Zierschriften

**Blockiert / offen (brauchen den Nutzer):**
- **App-Hosting**: `b2b-webshop` läuft nirgends dauerhaft. Registrierungs- und Freigabe-Route sind fertig programmiert (Typecheck+Lint sauber), aber noch nie live durchgeklickt worden. Einen Hosting-Anbieter einzurichten erfordert eine Account-Anlage bei einem Drittanbieter — das kann/darf diese Automatisierung nicht eigenständig tun. → **Nutzer muss `npm run dev` in `b2b-webshop/` selbst starten** (lokal gegen den Dev-Store `occulto-b2b-dev.myshopify.com`) oder einen Hosting-Anbieter selbst einrichten.
- **JTL-Produktimport**: nur 1 Testprodukt aktuell synchronisiert ("Occulto Tennissocks SUMMER"). Der Connector ist eine Sync-Queue, kein Katalog-Browser – die Kategorie "08_Einzelhandel" muss der Nutzer direkt in JTL-Wawi prüfen/synchronisieren.
- **Vorkasse-IBAN**: echte Bankverbindung von Occulto fehlt noch (Platzhalter in den Zahlungseinstellungen), kann nicht fabriziert werden.
- **Deutsch als Standardsprache des Shops** (nicht nur veröffentlicht, sondern als Default gesetzt) — client wollte laut Master-Prompt Deutsch als primäre Sprache; noch nicht umgesetzt, da das eine strukturellere Store-weite Einstellung ist (betrifft z. B. Standardsprache für Checkout/Notifications) und daher lieber mit dem Nutzer abgestimmt werden sollte statt blind umgeschaltet zu werden.

## Secrets / Environment

Siehe `b2b-webshop/.env` (gitignored): `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`, `SHOP`, `SHOP_CUSTOM_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`. Aktuelle Scopes: siehe `[access_scopes]` in `b2b-webshop/shopify.app.toml` (wird laufend erweitert, je nach Phase).
