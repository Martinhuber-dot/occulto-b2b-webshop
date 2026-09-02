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

- [x] Kein produktübergreifender Sammel-Bestelltisch (090226, **später wieder entfernt** 090226): ursprünglich als neue Seite "Schnellbestellung" mit voller Produkttabelle (`sections/catalog-order-list.liquid`) gebaut — Martin wollte diese Tabelle aber explizit nicht ("den Teil unter dem Datei-auswählen-Button brauchen wir nicht"), Seite ist jetzt reine CSV-Upload-Seite, siehe unten. `catalog-order-list.liquid` bleibt als ungenutzte Section-Datei im Theme (kein Schaden, evtl. später wiederverwendbar). **Nebenbei entdeckt und mitgefixt** (bleibt gültig): die Quick-Order-Liste auf der einzelnen Produktseite (`sections/quick-order-list.liquid`) UND das Bulk-Add-Modal von den Kollektionskarten (`sections/bulk-quick-order-list.liquid`) hatten **gar kein** `dealer-approved`-Gate — jeder anonyme Besucher konnte dort Nettopreise sehen und in den Warenkorb legen. Beide jetzt mit demselben Gate wie `price.liquid`/`buy-buttons.liquid` abgesichert, live verifiziert.
- [x] Kein CSV/Excel-Bulk-Upload für Bestellungen (090226, End-to-End getestet 090226): Seite umbenannt in **"Massenbestellung"** (`/pages/massenbestellung`, Nav-Link aktualisiert), zeigt nur noch die CSV-Upload-Sektion (`sections/csv-order-upload.liquid` + `assets/csv-order.js` + App-Proxy-Route `app/routes/csv-order.tsx`), Format "SKU;Menge" pro Zeile (Master-Prompt §27) — inkl. downloadbarer Vorlage (`assets/csv-order-template.csv`, Link "Vorlage herunterladen"). Mit echtem freigeschaltetem Testkonto (Martins eigener Account, manuell `dealer-approved` getaggt) live durchgeklickt — Preise, Quick-Order-Tabelle und CSV-Seite funktionieren. Zwei kleine Folgefehler dabei gefunden und gefixt: (1) der "Alle in den Warenkorb"-Button blieb trotz `hidden`-Attribut sichtbar (CSS-Spezifitätskonflikt mit `.button`), (2) Mengen-Eingabefelder erlaubten 1,2,3... statt in 5er-Schritten — siehe eigener Punkt unten.
- [x] Mengen-Eingabe sprang in 1er- statt 5er-Schritten (090226): `snippets/quantity-input.liquid` hartcodiert jetzt `step`/`min` auf 5 (Produktseite + Quick-Order-Liste), damit "+" immer 5, 10, 15, 20... zählt statt 1, 2, 3. **Wichtige Falle**: ein `variant.quantity_rule.min | default: 5`-Fallback funktioniert NICHT wie erwartet — jede Shopify-Variante hat implizit eine native `quantity_rule` von `{min: 1, increment: 1}`, auch ohne B2B-Preislisten-Katalog; das ist kein `nil`, also greift Liquids `default`-Filter nie. Die "richtige" native Lösung (`quantityRulesAdd` Mutation) braucht zwingend eine `priceListId` (B2B-Katalog), den dieser Store nicht hat — deshalb bewusst hart im Theme kodiert statt nativ gelöst, konsistent mit der `PACK_STEP = 5`-Konstante in der Checkout-Function.
- [ ] Kein "letzte Bestellung wiederholen"/Reorder-Button
- [ ] Rechnung/Vorkasse ohne automatisierte Bonitätsprüfung (bremst schnelle Freigabe)
- [ ] **Automatischer Rechnungs-Upload fehlt** (090226, zurückgestellt): Kunde soll die Rechnung im Konto sehen können, sobald die Ware verschickt wurde (Master-Prompt §36). Bestätigt: der bestehende JTL-Connector kann das nicht (kein "Rechnung senden"-Schalter im "Daten senden"-Bereich der Connector-Konfiguration, kein Invoice-Datentyp bekannt). Versandstatus-Updates kommen aber bereits JTL→Shopify an, der Trigger-Zeitpunkt ist also vorhanden. Für die eigentliche PDF-Übertragung bräuchte es eine kleine Middleware gegen die **separate JTL-Wawi REST-API** (nicht der Connector) — Einrichtung: JTL-Administrator → Anlegen → Wawi-API (Instanz), dann in JTL-Wawi eine Anwendung registrieren für Client-ID/Secret. Martin richtet das bei Gelegenheit ein und schickt Zugangsdaten + ggf. Swagger-Doku-Screenshot für den Rechnungs-Endpunkt.

## Tier 3 – Fehlt für "äußerst ansprechend" / Markenerlebnis

- [x] Startseite ist noch Standard-Dawn/Trade-Theme-Baukasten-Layout, kein eigenes Design (090226): Hero von generischem `image-banner` auf neue eigene Section `sections/hero-split.liquid` umgestellt — Zweispalten-Layout, links feste Markenfläche (scheme-5: Anthrazit/Gold) mit Überschrift/CTA, rechts großformatig ein Bild. **Bild zweimal iteriert**: erster Versuch war ein reines Produktfoto (STEFFI-Pack, 3 Socken auf Weiß) — Martin fand das noch nicht überzeugend genug. Zweiter Versuch: echtes redaktionelles Lifestyle-Foto aus dem Occulto-Lookbook-PDF extrahiert (PyMuPDF, Bild "BEST DAD"-Socke am Fuß, sitzend auf Barhocker, hohe Auflösung 1589×2303) statt reinem Produktfoto — per Staged-Upload zu Shopify Files hochgeladen (`occulto-hero-best-dad.jpg`, brauchte neuen App-Scope `write_files`). Kein KI-generiertes Bild verwendet (siehe "Bereits erledigt": KI-Bildgenerierung wurde für Markenbilder bereits verworfen). Rest der Startseite (Collections/Bestseller/Vorteile) unverändert, das war bereits akzeptabel gestaltet.
- [ ] Keine echte Markenerzählung (Über-uns, Herkunft, Qualität, Made in Germany?)
- [ ] Kein Social Proof (Handelspartner-Logos, Zahlen, Testimonials)
- [ ] Standard-Shopify-Transaktionsmails (Bestellbestätigung, Willkommen als Handelspartner) unbranded
- [ ] Kein Faceted Search/Filter bei 100 Einzelprodukten (Motiv-Kategorie, Größe, Anlass)

## Tier 4 – Offene Risiken

- [ ] AGB und Datenschutzerklärung sind Entwürfe, noch nicht anwaltlich geprüft
- [ ] Keine echte Performance-Messung (Lighthouse/PageSpeed) — hochskalierte Bilder evtl. Ladezeit verschlechtert
- [ ] Mobile-Ansicht nie wirklich verifiziert (Browser-Resize-Tool funktionierte nicht zuverlässig)
- [ ] **JTL-Wawi-Artikelstruktur passt nicht zur Shopify-Struktur** (090226): Shopify hat jetzt ~100 Einzelprodukte (nur Größe als Variante pro Farbe) — JTL-Wawis Standard-Verhalten ist aber ein Vaterartikel pro Style mit Farbe+Größe zusammen als Varianten. Der JTL-Connector (Shopify-seitige Konfiguration geprüft) hat **keine** Einstellung dafür — das muss in JTL-Wawi selbst gelöst werden (jede Farbe als eigener Vaterartikel, nur Größe als Kind). Martin ändert das in JTL-Wawi, noch nicht umgesetzt. Risiko bis dahin: der nächste volle Sync könnte Duplikate anlegen oder Preise/Bestände am falschen Produkt aktualisieren. Erst an einem Testartikel prüfen, bevor der ganze Katalog läuft — siehe [[project-b2b-webshop-overview]] für Details.

## Bereits erledigt (Referenz)

- [x] Warenkorb-Bug behoben (Minimum-Bestellwert-Funktion blockierte jeden Cart-Klick)
- [x] Händlerregistrierungs-Formular war nie live deployed — gefixt
- [x] Impressum + AGB-Entwurf + Datenschutzerklärung-Entwurf live gesetzt
- [x] 29 Bundle-Produkte in 100 Einzelprodukte gesplittet (nur Größe als Variante)
- [x] 54 Produktbilder aus echtem Lookbook-PDF extrahiert, zugeordnet und per KI (FSRCNN) 4x hochskaliert
- [x] Digitaler Katalog (Lookbook-PDF) als Download in Navigation verlinkt
- [x] Getestet: lokale KI-Bildgenerierung/-bearbeitung (SD-Turbo) für neue/lifestyle Produktbilder — ungeeignet, verfälscht Markentext, siehe Tier 3 Anmerkung: echte Fotografie bleibt einziger verlässlicher Weg zu Konkurrenz-Bildqualität
