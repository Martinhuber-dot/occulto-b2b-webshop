# B2B-Workflows

Stand: 2026-08-30. Bezug: [master-prompt.md](./master-prompt.md) Abschnitte 5–9, 18, 30–32.

## Händler-Registrierung → Freigabe

```
Interessent füllt "Händler werden" aus (Theme-Seite /pages/haendler-werden)
   │  POST → App-Proxy /apps/dealer/register
   ▼
customerCreate: Tag "dealer-pending", Metafelder (Firma/USt-ID/...), Status "pending"
   │  (Duplikat-Check per E-Mail zuerst – idempotent)
   ▼
Redirect → /pages/haendleranfrage-eingegangen ("Vielen Dank ...")
   │
   │  Occulto prüft intern (Shopify Admin → App → "Händleranfragen")
   ▼
Klick "Freigeben" (app/routes/app.dealers.tsx):
   1. companyCreate (Company + Location, USt-ID → taxRegistrationId)
   2. companyAssignCustomerAsContact (bestehenden Kunden verknüpfen, keinen neuen anlegen)
   3. companyContactAssignRoles (Bestellrecht am Standort)
   4. companyContactSendWelcomeEmail (Shopify-native Freigabe-Mail)
   5. customerUpdate: Tag → "dealer-approved", dealer_status-Metafeld → "approved"
   │
   ▼
JTL-Wawi holt den Kunden bei nächster eigener Sync-Runde (Customer: pull unterstützt)
```

**Wichtig:** Die JTL-Kundengruppe "Einzelhandel" wird über diesen Weg *nicht* automatisch gesetzt – `CustomerGroup` ist im JTL-Connector nicht als eigenes Objekt synchronisierbar (siehe [jtl-shopify-sync.md](./jtl-shopify-sync.md)). Das muss entweder in JTL-Wawi selbst beim Kundenimport passieren, oder über ein Feld am Customer, das JTL-Wawi auswertet – noch zu klären, sobald JTL-Wawi-Zugriff besteht.

## Zugriffsschutz

`customer.tags contains 'dealer-approved'` ist die einzige Bedingung, die Preis und Kaufmöglichkeit freischaltet (`theme/snippets/price.liquid`, `theme/snippets/buy-buttons.liquid`, seit 2026-08-30 auch `theme/snippets/card-product.liquid` für die Quick-Add-Buttons auf Kollektionskacheln, seit 2026-09-02 auch `theme/sections/quick-order-list.liquid` und `theme/sections/bulk-quick-order-list.liquid`). Ohne diesen Tag: "Log in for dealer price" / "Anmelden für Händlerpreis" statt Preis, kein Warenkorb-/Quick-Add-Button irgendwo im Theme.

**2026-09-02 gefundene und gefixte Lücke**: die beiden oben genannten Quick-Order-Sections hatten das Gate schlicht nicht — jeder anonyme Besucher konnte auf jeder Produktseite Nettopreise sehen und direkt in den Warenkorb legen (die Kollektionskarten selbst waren bereits korrekt gegated, aber die dahinterliegenden Section-Endpunkte, die per `?section_id=` nachgeladen werden, nicht). Wichtige Lektion: ein per Theme-UI gegateter Trigger-Button reicht nicht — der darunterliegende `?section_id=`-Endpunkt muss selbst prüfen, da er direkt aufrufbar ist.

## Schnellbestellung (produktübergreifend)

Neue Seite `/pages/schnellbestellung` (Section `theme/sections/catalog-order-list.liquid`, im Hauptmenü verlinkt) listet alle Produkte einer Collection (Default: `all`) mit allen Größenvarianten in einer Tabelle, damit ein Händler nicht jede Produktseite einzeln öffnen muss. Baut auf denselben Zeilen-Snippets wie die einzelne Produktseiten-Quick-Order-Liste auf, zeigt aber die Summe des gesamten Warenkorbs statt nur eines Produkts. Ebenfalls über `dealer-approved` gegated.

## Mindestbestellwert

Shopify Function `extensions/minimum-order-value/` – blockiert Checkout serverseitig unter 500 € netto (`cart.cost.subtotalAmount`, erhöht von 350 € am 2026-09-01). Aktiv als Checkout-Regel "Mindestbestellwert 500€ netto" im Store. Ändern: Konstante `MIN_ORDER_NET` in `src/cart_validations_generate_run.ts`, dann `shopify app deploy`.

## Gebinde-Regel (5er-Schritte)

Shopify Function `extensions/pack-quantity-rule/` – blockiert Checkout serverseitig, wenn eine Position nicht in 5er-Schritten bestellt wird, außer die Menge entspricht exakt dem noch verfügbaren Restbestand (Ausverkauf der letzten Stück erlaubt). Aktiv als Checkout-Regel "5er-Gebinde-Pflicht" im Store, deployt/aktiviert 2026-09-02.

Da Functions keinen Live-Zugriff auf Inventory haben, spiegelt ein Webhook (`app/routes/webhooks.inventory_levels.update.tsx`, Topic `inventory_levels/update`) den Lagerstand bei jeder Änderung in ein Variant-Metafield (`app--416332316673.available_quantity`), das die Function ausliest. Die Quick-Order-Liste im Theme zeigt denselben Bestand pro Größe als Badge an (`theme/snippets/quick-order-list-row-inventory.liquid`).

## Mengenrabatt nach Bestellsumme

Shopify Function `extensions/order-value-discount/` (Order Discount API) – automatischer Rabatt auf die gesamte Bestellsumme (netto), gestaffelt: **5% ab 2.500€, 10% ab 5.000€**. Aktiv als automatischer Store-Rabatt "Mengenrabatt nach Bestellsumme" (`discountAutomaticAppCreate`), erfordert den App-Scope `write_discounts`. Grund für Function statt native B2B-Preisliste: Shop läuft auf Shopify **Basic**-Plan, native B2B-Preislisten mit Mengenstaffeln sind Plus-exklusiv. Ändern: Array `TIERS` in `src/run.ts`, dann `shopify app deploy`.

## CSV-Bulk-Bestellung

Upload-Bereich oben auf `/pages/schnellbestellung` (`theme/sections/csv-order-upload.liquid` + `theme/assets/csv-order.js`), Format `SKU;Menge` pro Zeile (Master-Prompt §27). Validierung (SKU existiert, aktueller Preis, Bestand) läuft über die App-Proxy-Route `app/routes/csv-order.tsx` (`POST /apps/dealer/csv-order`), die per Admin-API-Suche `sku:'...'` alle Zeilen in einem Request auflöst. Das Hinzufügen zum Warenkorb passiert danach clientseitig über die normale Storefront `/cart/add.js` — die Route selbst fasst den Kunden-Warenkorb nie an. Zeigt "nicht gefunden" / "Bestand überschritten" / "5er-Gebinde"-Hinweise pro Zeile, bevor bestätigt wird (die finale, verbindliche Durchsetzung bleibt weiterhin bei den Checkout-Functions).

## Zahlungsarten

Nativ als "Manual Payment Methods" im Store konfiguriert:
- **Bank Deposit** = Vorkasse (echte IBAN seit 2026-09-02 hinterlegt: DE37 7115 0000 0020 1128 76 — Kontoinhaber/BIC/Bankname nicht separat angegeben, nur die vom Nutzer übermittelte IBAN)
- **Rechnung** = custom payment method

Beide aktuell für *jeden* freigegebenen Händler sichtbar (MVP-Annahme laut Prompt zulässig). Individuelle Zahlungsbedingungen pro Kunde (Zahlungsziel, Kreditlimit aus JTL) sind noch nicht abgebildet.

## Was noch fehlt (nicht Teil dieser Session)

- Auftragsübertragung Shopify → JTL: prüfen, wie der bestehende Connector das bereits handhabt (`CustomerOrder` unterstützt `pull`), bevor etwas Eigenes gebaut wird.
- Rechnungs-PDF-Zugriff im Kundenkonto.
- Reorder-Funktion, Quick Order / Mengenmatrix.
- Adressänderungen zurück nach JTL.
