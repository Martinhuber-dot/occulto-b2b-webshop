# B2B Shop Roadmap – Weg zum "perfekten" Shop

Stand: 2026-08-31. Ziel: b2b.occulto.de von "funktioniert" zu "äußerst ansprechend, kein 0815-Shop" bringen.
Diese Liste ist der Tracking-Ort für den Fortschritt — bei jeder Session hier abhaken/aktualisieren.

## Tier 1 – Blocker (verhindern aktiv den Verkauf)

- [x] Sofortmaßnahme (083126): 42 Produkte ohne Bild (nicht 46, exakte Prüfung per API) auf Status "Entwurf" gesetzt → keine Platzhalter-Boxen mehr im Shop sichtbar (58 aktive Produkte bleiben, alle mit Bild)
  - [ ] Langfristig: echte Fotos für die Produkte mit echtem Lagerbestand beschaffen und wieder aktivieren — Priorität: MOMO 001+002, GUSTO 002+003 (je 41 Stück), Kind Fußball + Schulkind 001 (je 24), SUMMER 010 (17), NALA 001 (6)
  - [ ] Business-Entscheidung nötig: Rest hat 0 oder negativen Bestand (RIO 012–024, SUMMER 011–012, BUNNY 001–006, GUSTO 001+004, ROBIN 002+003, DREAMER 001–003, Schulkind 002+003, NALA 002, OSWALD 001+002, Rudi 001+002, GERLINDE, CLAUS) — dauerhaft einstellen oder nachproduzieren?
- [x] Adventskalender-Kachel auf Startseite (083126): Kachel führte ins Leere (beide Produkte 0 Bestand + kein Bild, jetzt Entwurf) — Kachel entfernt statt mit Bild kaschiert, Sortiment-Grid jetzt sauber 3-spaltig (Tennissocken/Sneaker/Kinder). Wieder aktivieren sobald Saisonware für Weihnachten bestückt + fotografiert ist.
- [x] Mindestbestellwert (083126): von 350€ auf 500€ netto angehoben (Martins Entscheidung) — Shopify Function `minimum-order-value` angepasst + getestet (3/3 Tests grün) + deployt als App-Version b2b-webshop-9, AGB-Text aktualisiert, Homepage-Kachel "Warum Occulto?" aktualisiert. Alles live verifiziert.
- [ ] Keine Mengenstaffel-/Rabattpreise sichtbar (z.B. ab 50 Stück -5%, ab 100 Stück -10%) — WICHTIGER FUND: Shop läuft auf Shopify **Basic**-Plan, native B2B-Preislisten mit Mengenstaffeln sind Plus-exklusiv und stehen NICHT zur Verfügung. Optionen: (a) Drittanbieter-App für Staffelpreise, (b) eigene Shopify-Function für automatischen Mengenrabatt. Noch nicht entschieden/umgesetzt — nächster Schritt für morgen.
- [ ] Kein sichtbarer Lagerbestand pro Größe auf Produktseite

## Tier 2 – Fehlt für "einfache Bestellung" (Kernanspruch B2B)

- [ ] Kein produktübergreifender Sammel-Bestelltisch (aktuell nur Quick-Order pro Einzelprodukt)
- [ ] Kein CSV/Excel-Bulk-Upload für Bestellungen
- [ ] Kein "letzte Bestellung wiederholen"/Reorder-Button
- [ ] Rechnung/Vorkasse ohne automatisierte Bonitätsprüfung (bremst schnelle Freigabe)

## Tier 3 – Fehlt für "äußerst ansprechend" / Markenerlebnis

- [ ] Startseite ist noch Standard-Dawn/Trade-Theme-Baukasten-Layout, kein eigenes Design
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
