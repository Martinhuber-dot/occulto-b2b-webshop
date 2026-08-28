# JTL ↔ Shopify Sync

Stand: 2026-08-28.

## Der Connector

Der bereits vor diesem Projekt installierte App "**JTL ERP-Connector**" (Shopify-Store: Settings → Apps) ist der offizielle JTL-Connector für Shopify. Endpoint: `https://ri1udz-iw.sfc.jtl-connector.de/jtlconnector` (Zugangsdaten in `integration/.env`, gitignored).

**Wichtig: JTL-Wawi ist der aktive Teilnehmer.** JTL-Wawi ruft periodisch diesen Endpoint auf (push/pull), nicht umgekehrt. Es gibt keine Methode, mit der Shopify/unsere App "jetzt synchronisieren" an JTL-Wawi schicken kann.

## Request-Format (JSON-RPC-Variante)

Die Payload muss als **form-urlencoded Feld `jtlrpc`** gesendet werden, nicht als roher `application/json`-Body:

```bash
curl -X POST "$JTL_CONNECTOR_URL" \
  --data-urlencode "jtlrpc={\"method\":\"core.connector.auth\",\"jtlrpc\":\"2.0\",\"id\":\"1\",\"params\":{\"token\":\"...\"}}" \
  --data-urlencode "jtlauth=$SESSION_ID"   # nur nach erfolgter Auth nötig
```

Ablauf: `core.connector.auth` (liefert `sessionId`, gültig laut `lifetime` in Sekunden) → `jtlauth` bei allen weiteren Calls mitschicken.

## Unterstützte Entitäten (`core.connector.features`, Stand 28.08.2026)

| Entität | Pull | Push | Bemerkung |
|---|---|---|---|
| Customer | ✅ | ✅ | bidirektional |
| CustomerGroup | ❌ | ❌ | **nicht** als eigenes Objekt verwaltbar – Gruppenzuordnung muss ein Feld am Customer sein |
| CustomerOrder | ✅ | ❌ | nur Shopify → JTL |
| CustomerOrderPaymentInfo | ❌ | ❌ | Zahlungsinfos laufen **nicht** über diesen Connector |
| Product / ProductPrice / ProductPriceItem | ✅ | ✅ | JTL kann Preise nach Shopify pushen |
| ProductStockLevel | ❌ | ✅ | nur JTL → Shopify |
| StatusChange | ❌ | ✅ | Bestell-/Versandstatus JTL → Shopify |
| DeliveryNote / DeliveryNoteItem | ❌ | ✅ | Tracking-Infos |
| Category | ✅ | ✅ | bildet Shopify Collections ab |
| Warehouse | ❌ | ❌ | kein Mehrlagerbetrieb über diesen Connector |

`disable_statistics: true` (Feature-Flag) — `*.statistic`-Aufrufe liefern einen bedeutungslosen Fixwert, **nicht** die echte Anzahl. Für echte Zahlen die jeweilige Shopify Admin API abfragen (z. B. `productsCount`).

## Bekannte Limitierung: Sync ist Queue-basiert

`product.pull` etc. liefert nur, was JTL-Wawi seit dem letzten Zyklus aktiv zum Push vorgemerkt hat – **keinen vollständigen historischen Katalog**. Um die reale Struktur zu sehen (z. B. wie "08_Einzelhandel" in JTL organisiert ist), muss jemand direkt in JTL-Wawi nachsehen bzw. dort einen (Re-)Sync anstoßen.

## Realer Datenpunkt (28.08.2026)

Ein Produkt ist aktuell synchronisiert: "Occulto Tennissocks SUMMER", Varianten Style (`001`–`012`) × Größe (`35-38`/`39-42`/`43-46`), SKU-Muster `<JTL-Artikelnr>-<Style>-<Größe>`. `totalInventory` war `-354` (negativ) – vor Verlass auf den JTL-Bestandssync als Datenqualitätsproblem prüfen.

## Referenz-Client

Format und Methodennamen wurden gegen die offizielle PHP-Referenzimplementierung geprüft: [`jtl-software/connector-client`](https://github.com/jtl-software/connector-client) (`ConnectorClient.php`), [`jtl-software/connector-core`](https://github.com/jtl-software/connector-core) (`RpcMethod.php`).
