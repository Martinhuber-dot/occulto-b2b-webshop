# Architektur – Occulto B2B Shop

Stand: 2026-08-28. Siehe [master-prompt.md](./master-prompt.md) für die vollständige Spezifikation.

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

## Aktueller Stand (2026-08-28)

**Fertig und live/getestet:**
- Markets: Deutschland (primär), Österreich, Schweiz
- Customer Accounts (neue, E-Mail+Code-basierte) provisioniert
- Kundenmetafelder für Registrierungsdaten (12 Felder, Namespace `app--416332316673`)
- Händler-Registrierungsformular (Theme) + App-Proxy-Backend-Route
- Admin-Freigabeseite mit nativen B2B-Company-Mutationen (Company/Location anlegen, Kontakt zuweisen, native Willkommens-E-Mail)
- Preis-/Kaufsperre für nicht freigeschaltete Besucher (Theme-Ebene), live geprüft
- Mindestbestellwert 350 € netto als Shopify Function, **live aktiv**, automatisiert getestet
- Zahlungsarten Rechnung + Vorkasse, nativ konfiguriert (Vorkasse-IBAN noch als Platzhalter zu befüllen)
- "Händler werden" im Hauptmenü verlinkt

**Blockiert / offen:**
- **App-Hosting**: `b2b-webshop` läuft nirgends dauerhaft. Registrierungs- und Freigabe-Route sind fertig programmiert (Typecheck+Lint sauber), aber noch nie live durchgeklickt worden. `shopify app dev` lässt sich aus dieser Automatisierung heraus nicht offen halten (braucht echtes interaktives Terminal) und Dev-Store-OAuth ist aus Sicherheitsgründen anders (nur über Partner-Dashboard-Install, kein abgreifbarer Code). → **Nutzer muss `npm run dev` in `b2b-webshop/` selbst starten**, um lokal gegen den Dev-Store `occulto-b2b-dev.myshopify.com` zu testen.
- **JTL-Produktimport**: nur 1 Testprodukt aktuell synchronisiert ("Occulto Tennissocks SUMMER"). Der Connector ist eine Sync-Queue, kein Katalog-Browser – die Kategorie "08_Einzelhandel" muss der Nutzer direkt in JTL-Wawi prüfen/synchronisieren.
- Quick-Add-Buttons in den Kollektions-Kacheln sind (noch) nicht gegen die Preissperre abgesichert (bewusst zurückgestellt, siehe Code-Kommentare in `card-product.liquid`-Umgebung).

## Secrets / Environment

Siehe `b2b-webshop/.env` (gitignored): `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`, `SHOP`, `SHOP_CUSTOM_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN`. Aktuelle Scopes: siehe `[access_scopes]` in `b2b-webshop/shopify.app.toml` (wird laufend erweitert, je nach Phase).
