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

`customer.tags contains 'dealer-approved'` ist die einzige Bedingung, die Preis und Kaufmöglichkeit freischaltet (`theme/snippets/price.liquid`, `theme/snippets/buy-buttons.liquid`, seit 2026-08-30 auch `theme/snippets/card-product.liquid` für die Quick-Add-Buttons auf Kollektionskacheln). Ohne diesen Tag: "Log in for dealer price" / "Anmelden für Händlerpreis" statt Preis, kein Warenkorb-/Quick-Add-Button irgendwo im Theme.

## Mindestbestellwert

Shopify Function `extensions/minimum-order-value/` – blockiert Checkout serverseitig unter 350 € netto (`cart.cost.subtotalAmount`). Aktiv als Checkout-Regel "Mindestbestellwert 350€ netto" im Store. Ändern: Konstante `MIN_ORDER_NET` in `src/cart_validations_generate_run.ts`, dann `shopify app deploy`.

## Zahlungsarten

Nativ als "Manual Payment Methods" im Store konfiguriert:
- **Bank Deposit** = Vorkasse (Zahlungsanweisung enthält aktuell einen **Platzhalter** für die echte Bankverbindung – vor Go-Live ausfüllen!)
- **Rechnung** = custom payment method

Beide aktuell für *jeden* freigegebenen Händler sichtbar (MVP-Annahme laut Prompt zulässig). Individuelle Zahlungsbedingungen pro Kunde (Zahlungsziel, Kreditlimit aus JTL) sind noch nicht abgebildet.

## Was noch fehlt (nicht Teil dieser Session)

- Auftragsübertragung Shopify → JTL: prüfen, wie der bestehende Connector das bereits handhabt (`CustomerOrder` unterstützt `pull`), bevor etwas Eigenes gebaut wird.
- Rechnungs-PDF-Zugriff im Kundenkonto.
- Reorder-Funktion, Quick Order / Mengenmatrix.
- Adressänderungen zurück nach JTL.
