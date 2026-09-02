# B2B Shop Roadmap – Weg zum "perfekten" Shop

Stand: 2026-08-31. Ziel: b2b.occulto.de von "funktioniert" zu "äußerst ansprechend, kein 0815-Shop" bringen.
Diese Liste ist der Tracking-Ort für den Fortschritt — bei jeder Session hier abhaken/aktualisieren.

## Tier 1 – Blocker (verhindern aktiv den Verkauf)

**Tier 1 vollständig abgeschlossen (090226).** Weiter geht's mit Tier 2.

- [x] Sofortmaßnahme (083126): 42 Produkte ohne Bild (nicht 46, exakte Prüfung per API) auf Status "Entwurf" gesetzt → keine Platzhalter-Boxen mehr im Shop sichtbar (58 aktive Produkte bleiben, alle mit Bild)
  - [ ] Langfristig: echte Fotos für die Produkte mit echtem Lagerbestand beschaffen und wieder aktivieren — Priorität: MOMO 001+002, GUSTO 002+003 (je 41 Stück), Kind Fußball + Schulkind 001 (je 24), SUMMER 010 (17), NALA 001 (6)
  - [ ] Business-Entscheidung nötig: Rest hat 0 oder negativen Bestand (RIO 012–024, SUMMER 011–012, BUNNY 001–006, GUSTO 001+004, ROBIN 002+003, DREAMER 001–003, Schulkind 002+003, NALA 002, OSWALD 001+002, Rudi 001+002, GERLINDE, CLAUS) — dauerhaft einstellen oder nachproduzieren?
- [x] Adventskalender-Kachel auf Startseite (083126): Kachel führte ins Leere (beide Produkte 0 Bestand + kein Bild, jetzt Entwurf) — Kachel entfernt statt mit Bild kaschiert, Sortiment-Grid jetzt sauber 3-spaltig (Tennissocken/Sneaker/Kinder). Wieder aktivieren sobald Saisonware für Weihnachten bestückt + fotografiert ist.
- [x] Mindestbestellwert (083126): von 350€ auf 500€ netto angehoben (Martins Entscheidung) — Shopify Function `minimum-order-value` angepasst + getestet (3/3 Tests grün) + deployt als App-Version b2b-webshop-9, AGB-Text aktualisiert, Homepage-Kachel "Warum Occulto?" aktualisiert. Alles live verifiziert.
- [x] Keine Mengenstaffel-/Rabattpreise sichtbar (090226): Entscheidung mit Martin final abgestimmt — Rabatt nach **Bestellsumme (netto)**, nicht nach Stückzahl/Variante: **5% ab 2.500€, 10% ab 5.000€**. Umgesetzt als eigene Shopify Function `extensions/order-value-discount` (Order Discount API, `purchase.order-discount.run`, Rabatt auf `orderSubtotal`), 3/3 Tests grün, deployt (b2b-webshop-14) und als automatischer Store-Rabatt "Mengenrabatt nach Bestellsumme" **Active** gesetzt (`discountAutomaticAppCreate`). Dafür musste der App-Scope um `write_discounts` erweitert und im Admin neu re-konsentiert werden (Apps → b2b-webshop → "Update").
- [x] Kein sichtbarer Lagerbestand pro Größe auf Produktseite (090226): erledigt als Nebenprodukt der 5er-Gebinde-Regel (086126/090126) — die Quick-Order-List-Section sitzt bereits im Produkt-Template (`templates/product.json`) und zeigt jetzt pro Größenzeile ein Stock-Badge (auf Lager/knapp/ausverkauft mit genauer Menge, `snippets/quick-order-list-row-inventory.liquid`), gespeist vom `available_quantity`-Webhook-Mirror. Live seit b2b-webshop-12 (090226).

## Tier 2 – Fehlt für "einfache Bestellung" (Kernanspruch B2B)

- [x] Kein produktübergreifender Sammel-Bestelltisch (090226): neue Seite "Schnellbestellung" (`/pages/schnellbestellung`, neue Section `sections/catalog-order-list.liquid`) listet alle Produkte der Collection "all" mit allen Größenvarianten in einer einzigen Tabelle, wiederverwendet dieselben Zeilen-/Cart-Bausteine wie die bestehende Produktseiten-Quick-Order-Liste. Live, im Hauptmenü verlinkt (nach "Produkte"). **Nebenbei entdeckt und mitgefixt**: die bestehende Quick-Order-Liste auf der einzelnen Produktseite (`sections/quick-order-list.liquid`) UND das Bulk-Add-Modal von den Kollektionskarten (`sections/bulk-quick-order-list.liquid`) hatten **gar kein** `dealer-approved`-Gate — jeder anonyme Besucher konnte dort Nettopreise sehen und in den Warenkorb legen. Beide jetzt mit demselben Gate wie `price.liquid`/`buy-buttons.liquid` abgesichert, live verifiziert (anonym sieht jetzt nur noch "Anmelden für Händlerpreis").
- [x] Kein CSV/Excel-Bulk-Upload für Bestellungen (090226): neue Upload-Sektion oben auf der "Schnellbestellung"-Seite (`sections/csv-order-upload.liquid` + `assets/csv-order.js`), Format "SKU;Menge" pro Zeile (Master-Prompt §27). Validierung (SKU existiert, Bestand, aktueller Preis) läuft über eine neue App-Proxy-Route `app/routes/csv-order.tsx`; das eigentliche Hinzufügen zum Warenkorb passiert clientseitig über die normale Storefront-Cart-API, damit der Kunden-Session-Warenkorb nie serverseitig angefasst wird. Zeigt SKU-nicht-gefunden/Bestand-überschritten/5er-Gebinde-Hinweis pro Zeile an, bevor bestätigt wird. Committet und gepusht (0578e53) — dogado deployt automatisch per Git-Hook; App-Server antwortet nach dem Push (200 auf `/`), aber ein echter End-to-End-Klicktest mit einem freigeschalteten Händler-Login steht noch aus (kein Testkonto in dieser Session verfügbar).
- [ ] Kein "letzte Bestellung wiederholen"/Reorder-Button
- [ ] Rechnung/Vorkasse ohne automatisierte Bonitätsprüfung (bremst schnelle Freigabe)

## Tier 3 – Fehlt für "äußerst ansprechend" / Markenerlebnis

- [x] Startseite ist noch Standard-Dawn/Trade-Theme-Baukasten-Layout, kein eigenes Design (090226): Hero von generischem `image-banner` (schmale Wide-Banner-Crop mit dunklem Overlay über einem grauen Einzelsocken-Foto) auf neue eigene Section `sections/hero-split.liquid` umgestellt — Zweispalten-Layout, links feste Markenfläche (scheme-5: Anthrazit/Gold) mit Überschrift/CTA, rechts großformatig ein echtes Occulto-Produktfoto (STEFFI-Pack, bunte Streifen, hohe Auflösung) statt KI-generiertem Bild (siehe "Bereits erledigt": KI-Bildgenerierung wurde für Markenbilder bereits verworfen). Rest der Startseite (Collections/Bestseller/Vorteile) unverändert, das war bereits akzeptabel gestaltet.
- [ ] Keine echte Markenerzählung (Über-uns, Herkunft, Qualität, Made in Germany?)
- [ ] Kein Social Proof (Handelspartner-Logos, Zahlen, Testimonials)
- [ ] Standard-Shopify-Transaktionsmails (Bestellbestätigung, Willkommen als Handelspartner) unbranded
- [ ] Kein Faceted Search/Filter bei 100 Einzelprodukten (Motiv-Kategorie, Größe, Anlass)

## Tier 4 – Offene Risiken

- [ ] AGB und Datenschutzerklärung sind Entwürfe, noch nicht anwaltlich geprüft
- [ ] Keine echte Performance-Messung (Lighthouse/PageSpeed) — hochskalierte Bilder evtl. Ladezeit verschlechtert
- [ ] Mobile-Ansicht nie wirklich verifiziert (Browser-Resize-Tool funktionierte nicht zuverlässig)

## Bereits erledigt (Referenz)

- [x] Warenkorb-Bug behoben (Minimum-Bestellwert-Funktion blockierte jeden Cart-Klick)
- [x] Händlerregistrierungs-Formular war nie live deployed — gefixt
- [x] Impressum + AGB-Entwurf + Datenschutzerklärung-Entwurf live gesetzt
- [x] 29 Bundle-Produkte in 100 Einzelprodukte gesplittet (nur Größe als Variante)
- [x] 54 Produktbilder aus echtem Lookbook-PDF extrahiert, zugeordnet und per KI (FSRCNN) 4x hochskaliert
- [x] Digitaler Katalog (Lookbook-PDF) als Download in Navigation verlinkt
- [x] Getestet: lokale KI-Bildgenerierung/-bearbeitung (SD-Turbo) für neue/lifestyle Produktbilder — ungeeignet, verfälscht Markentext, siehe Tier 3 Anmerkung: echte Fotografie bleibt einziger verlässlicher Weg zu Konkurrenz-Bildqualität
