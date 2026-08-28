# MASTER-PROMPT – OCCULTO B2B SHOPIFY SHOP

> Gespeichert am 2026-08-28. Dies ist die verbindliche Spezifikation für den Occulto B2B-Shop (Shopify + JTL-Wawi). Alle Architektur- und Implementierungsentscheidungen in diesem Repository richten sich nach diesem Dokument, sofern nicht durch spätere Absprache mit dem Nutzer geändert.

Du bist mein Lead Developer, Shopify Architect, UX/UI Designer und Integration Engineer.

Deine Aufgabe ist es, für die **Occulto GmbH** einen professionellen, produktionsfähigen **B2B-Onlineshop auf Shopify** aufzubauen.

Du hast bereits Zugriff auf den bestehenden Shopify-Shop und sollst direkt im vorhandenen Projekt arbeiten.

Der Shop soll nicht nur konzipiert werden.

**DU SOLLST DEN SHOP TATSÄCHLICH UMSETZEN.**

Arbeite möglichst autonom.

Stelle nur dann Rückfragen, wenn eine Entscheidung technisch nicht aus den bestehenden Systemen, Shopify-Konfigurationen, APIs, JTL-Daten oder diesem Prompt abgeleitet werden kann.

Bei kleineren Entscheidungen triff selbst eine sinnvolle Best-Practice-Entscheidung.

---

# 1. ÜBERGEORDNETES ZIEL

Wir benötigen einen modernen, schnellen und extrem einfach bedienbaren B2B-Shop für Wiederverkäufer unserer Marke **Occulto**.

Der Shop richtet sich ausschließlich an B2B-Kunden innerhalb von:

* Deutschland
* Österreich
* Schweiz

Kurz:

**DACH-Markt**

Der typische Kunde ist beispielsweise:

* Einzelhändler
* Sportgeschäft
* Modegeschäft
* Fachhändler
* Warenhaus
* regionaler Händler
* sonstiger gewerblicher Wiederverkäufer

Der Shop soll den bisherigen manuellen Bestellprozess über E-Mail, Telefon, Excel usw. möglichst stark ersetzen.

Unser ERP und führendes System bleibt:

# JTL-Wawi

Shopify ist das B2B-Verkaufsfrontend.

JTL bleibt die **Single Source of Truth**.

---

# 2. WICHTIGSTE ARCHITEKTURREGEL

Es dürfen keine unnötigen parallelen Datenwelten entstehen.

Grundregel:

**JTL-Wawi → führendes System**

JTL ist führend für:

* Artikel
* Varianten
* SKU
* EAN
* Produktinformationen
* Bilder
* Preise
* Kundengruppen
* kundenindividuelle Preise
* Staffelpreise
* Lagerbestand
* Kundendaten
* Aufträge
* Rechnungen
* Versandstatus

Shopify dient primär für:

* B2B-Shop
* Produktdarstellung
* Suche
* Warenkorb
* Checkout
* Kundenkonto
* Bestelloberfläche
* Self-Service

Bevor du irgendeine neue Schnittstelle entwickelst:

**Analysiere zuerst die bereits vorhandene JTL-Shopify-Integration.**

JTL-Wawi und Shopify sind bereits miteinander verbunden.

Erfinde KEINE zweite Synchronisationslogik für Daten, die bereits zuverlässig über die vorhandene Integration synchronisiert werden können.

Nutze vorhandene JTL-/Shopify-Funktionen wo immer sinnvoll.

Eine zusätzliche Middleware darf verwendet oder entwickelt werden, wenn Funktionen über die bestehende Integration nicht sauber realisierbar sind.

---

# 3. DEINE ERSTE AUFGABE: IST-ANALYSE

Bevor du implementierst:

Analysiere vollständig:

1. bestehende Shopify-Konfiguration
2. Shopify-Plan
3. aktives Theme
4. vorhandene Apps
5. Shopify Markets
6. Shopify B2B-Konfiguration
7. Customer Accounts
8. vorhandene Produktstruktur
9. bestehende Collections
10. vorhandene Metafields
11. bestehende JTL-Shopify-Anbindung
12. vorhandene Kundensynchronisation
13. vorhandene Preissynchronisation
14. vorhandene Bestandssynchronisation
15. vorhandene Auftragssynchronisation
16. vorhandene Webhooks
17. vorhandene Custom Apps
18. vorhandene API Credentials/Integrationen
19. vorhandene Repository-Struktur
20. vorhandene Deployment-Prozesse

Danach erstelle intern einen kurzen technischen Implementierungsplan.

Danach:

**BEGINNE MIT DER UMSETZUNG.**

Nicht nur beraten.

Nicht nur erklären.

Nicht nach jedem Arbeitsschritt um Freigabe fragen.

---

# 4. SHOP-TYP

Der Shop ist:

# REINER B2B-SHOP

Nicht B2C.

Nicht öffentliches Endkundengeschäft.

Nicht eingeloggte Benutzer dürfen insbesondere keine B2B-Preise sehen.

Vor Freischaltung soll ein Interessent im Wesentlichen nur sehen:

* Marke Occulto
* professionellen B2B-Auftritt
* Vorteile einer Händlerpartnerschaft
* Login
* Händlerregistrierung
* Kontaktmöglichkeiten

Der eigentliche Händlerbereich wird erst nach Freischaltung zugänglich.

---

# 5. REGISTRIERUNG

Neue Händler sollen sich selbst registrieren können.

Erstelle eine professionelle Seite:

# Händler werden

bzw. Englisch:

# Become a Retail Partner

Erforderliche Felder:

## Unternehmen

* Firmenname
* Rechtsform
* Straße
* Hausnummer
* PLZ
* Ort
* Land
* Website optional
* Umsatzsteuer-ID
* Handelsregisternummer optional

## Ansprechpartner

* Vorname
* Nachname
* Position optional
* E-Mail
* Telefonnummer

## Geschäft

Optional sinnvolle Angaben:

* Anzahl Filialen
* Verkauf stationär / online / beides
* Website
* Nachricht an Occulto

Checkboxen:

* Datenschutz akzeptieren
* AGB/B2B-Bedingungen akzeptieren

Nach Absenden:

Status:

**Freigabe ausstehend**

Der Kunde darf zu diesem Zeitpunkt noch:

* keine Preise sehen
* nicht bestellen
* keinen B2B-Katalog verwenden

Zeige eine professionelle Bestätigung:

„Vielen Dank für Ihre Registrierung. Wir prüfen Ihre Händleranfrage und informieren Sie per E-Mail, sobald Ihr Konto freigeschaltet wurde.“

---

# 6. FREIGABEPROZESS

Die Händlerregistrierung darf NICHT automatisch zum vollständigen Händlerzugang führen.

Wir möchten jeden Händler zunächst überprüfen.

Implementiere daher den Workflow:

Registrierung

→ Händleranfrage

→ Status PENDING

→ interne Prüfung durch Occulto

→ Freigabe

→ Shopify B2B-Kunde/Company aktiv

→ JTL-Kunde wird angelegt bzw. synchronisiert

→ Kunde erhält Zugriff

→ Kunde erhält E-Mail

→ Kunde kann sich anmelden

→ Produkte und Preise werden sichtbar

→ Bestellung möglich

Die interne Freigabe muss möglichst einfach sein.

Bevorzugt:

* Shopify Admin
* Shopify Flow
* bestehende JTL-Funktion
* oder schlanke Custom-App

Keine unnötig komplizierte externe Adminoberfläche entwickeln.

---

# 7. JTL-KUNDENANLAGE

Nach Freigabe muss der Kunde automatisch in JTL-Wawi angelegt werden.

Ziel-Kundengruppe in JTL:

# Einzelhandel

Prüfe die genaue Schreibweise und ID in der vorhandenen JTL-Wawi-Konfiguration.

Nicht blind anhand des Strings arbeiten, wenn bereits eine interne ID existiert.

Folgende Daten sollen synchronisiert werden:

* Firma
* Ansprechpartner
* E-Mail
* Telefon
* Rechnungsadresse
* Lieferadresse
* Land
* USt-ID
* Shopify Customer ID
* Shopify Company ID
* Shopify Company Location ID

Speichere externe IDs soweit möglich gegenseitig, damit eine eindeutige Zuordnung besteht.

Duplikate müssen verhindert werden.

Primäre Matching-Kriterien:

1. vorhandene externe ID
2. E-Mail
3. USt-ID
4. Firmenname + Adresse

Kein Kunde darf durch wiederholte Synchronisation mehrfach angelegt werden.

Synchronisation muss **idempotent** sein.

---

# 8. LOGIN

Verwende für den B2B-Shop die aktuell von Shopify unterstützten **Customer Accounts / Shopify B2B Accounts**.

WICHTIG:

Ursprünglich war E-Mail + Passwort gewünscht.

Da Shopify B2B aktuell native Customer Accounts benötigt und diese mit E-Mail plus Einmalcode arbeiten, soll NICHT auf veraltete Legacy Customer Accounts zurückgegriffen werden.

Login:

E-Mail-Adresse

→ Shopify sendet Einmalcode

→ Kunde gibt Code ein

→ Anmeldung

Das Login-Design muss vollständig im Occulto-Stil gestaltet sein.

Die Experience soll sich für den Händler dennoch wie ein professionelles geschlossenes B2B-Portal anfühlen.

---

# 9. B2B-ZUGRIFFSSCHUTZ

Ein nicht freigeschalteter Benutzer darf niemals durch Manipulation von URLs Zugriff auf interne B2B-Daten erhalten.

Schütze serverseitig bzw. über Shopify-native B2B-Funktionen:

* Preise
* Produktkatalog
* Warenkorb
* Bestellfunktionen
* Kundendaten
* Rechnungen
* Bestellhistorie

Nicht nur Elemente per CSS verstecken.

Zugriff muss tatsächlich autorisiert sein.

---

# 10. PRODUKTE AUS JTL

Es sollen NICHT alle Produkte aus JTL im B2B-Shop erscheinen.

Nur Produkte aus:

# Artikelstamm „08_Einzelhandel“

sollen für diesen Shop berücksichtigt werden.

Prüfe zunächst, wie „08_Einzelhandel“ technisch in JTL organisiert ist:

* Kategorie
* Shop-Zuordnung
* Warengruppe
* Attribut
* Verkaufskanal
* sonstiges JTL-Konstrukt

Verwende die tatsächlich vorhandene Struktur.

Keine Annahmen treffen, wenn dies direkt über die vorhandene JTL-Konfiguration ermittelt werden kann.

---

# 11. PRODUKTDATEN

Von JTL sollen soweit vorhanden übernommen werden:

* Produktname
* SKU
* Artikelnummer
* EAN
* Kurzbeschreibung
* Beschreibung
* Varianten
* Farbe
* Größe
* Material
* Geschlecht/Zielgruppe
* Kollektion
* Produktbilder
* zusätzliche Bilder
* Einkaufseinheit/Verkaufseinheit
* Verfügbarkeit
* Lagerbestand
* Preise
* Staffelpreise
* relevante Attribute

JTL bleibt hierfür führend.

Änderungen sollen NICHT manuell doppelt in Shopify gepflegt werden müssen.

---

# 12. VARIANTEN

Die Varianten sind bereits sauber in JTL-Wawi angelegt.

Behalte die JTL-Struktur bei.

Beispiel:

Produkt:

Occulto Sportsocken

Varianten:

Farbe:

* Schwarz
* Weiß
* Grau

Größe:

* 35–38
* 39–42
* 43–46

Der Händler soll Varianten extrem schnell auswählen können.

B2B UX ist wichtiger als eine klassische B2C-Produktseite.

---

# 13. PREISE

Alle Preise im Händlerbereich werden:

# NETTO

angezeigt.

Beispiele:

4,20 € netto

oder

4,20 €
zzgl. gesetzlicher MwSt.

Vermeide unnötiges „netto“ hinter jedem einzelnen Preis, wenn aus UX-Sicht eine klare globale Kennzeichnung eleganter ist.

Im Warenkorb:

Zwischensumme netto

MwSt.

Gesamtsumme

müssen transparent dargestellt werden.

---

# 14. JTL-PREISGRUPPEN

Es wird unterschiedliche Händlerpreisgruppen geben.

Die Zuordnung kommt aus JTL.

Beispiele nur zur Illustration:

* Einzelhandel Standard
* Einzelhandel A
* Key Account

Nutze die tatsächlich vorhandenen Preisgruppen.

Preise dürfen NICHT im Theme hart codiert werden.

Nach Login muss Shopify erkennen:

Welcher JTL-Kunde ist angemeldet?

→ welche JTL-Preisgruppe?

→ welchen Preis erhält dieser Kunde?

Dieser Preis muss:

* Produktseite
* Collection
* Suche
* Quick Order
* Warenkorb
* Checkout

identisch verwendet werden.

---

# 15. INDIVIDUELLE KUNDENPREISE

Zusätzlich können in JTL kundenindividuelle Sonderpreise existieren.

Preis-Priorität soll grundsätzlich der JTL-Logik entsprechen.

Analysiere die bestehende JTL-Preishierarchie und bilde sie korrekt ab.

Beispiel:

kundenindividueller Sonderpreis

vor

Preisgruppe

vor

Standard-B2B-Preis.

JTL bleibt die Preisquelle.

---

# 16. WICHTIG: NORMALER SHOPIFY-PLAN

Wir verwenden keinen Shopify-Plus-Plan.

Prüfe daher VOR Implementierung die aktuellen Funktionen des vorhandenen Shopify-Plans.

Shopify unterstützt B2B inzwischen auch außerhalb von Plus, jedoch können je nach Plan Einschränkungen bei Katalogen und kundenspezifischer Preiszuordnung bestehen.

Deshalb:

1. Ermittle den aktuellen Shopify-Plan.
2. Ermittle die aktuell verfügbaren B2B-APIs/Funktionen.
3. Ermittle die bestehenden Shopify-B2B-Möglichkeiten des Stores.
4. Prüfe, wie die JTL-Preise aktuell an Shopify übertragen werden.
5. Verwende native Shopify-Funktionen, wo möglich.
6. Entwickle nur dort eine Zusatzlösung, wo erforderlich.

WICHTIG:

Ein angezeigter kundenspezifischer Preis muss auch tatsächlich im Checkout gelten.

Es ist NICHT akzeptabel:

Produktseite = 4,20 €

Checkout = 4,90 €.

Preismanipulation über den Browser darf ebenfalls nicht möglich sein.

Wenn eine spezielle Preisfunktion aufgrund einer echten Shopify-Planrestriktion technisch nicht sicher realisierbar ist:

* dokumentiere exakt die Einschränkung
* suche zuerst nach einer robusten Alternative
* prüfe bestehende Apps/Integrationen
* prüfe Middleware
* prüfe vorhandene JTL-Shopify-Funktionalität

Shopify Plus darf nur als letzter Ausweg als Voraussetzung genannt werden.

---

# 17. STAFFELPREISE

JTL enthält Staffelpreise.

Beispiel:

1–49 Stück: 4,50 €

50–99 Stück: 4,20 €

ab 100 Stück: 3,90 €

Die Staffelpreise sollen sichtbar dargestellt werden.

Beispielsweise:

Menge | Ihr Preis
1–49 | 4,50 €
50–99 | 4,20 €
100+ | 3,90 €

Wenn der Händler die Menge verändert, muss der relevante Preis automatisch sichtbar werden.

Der korrekte Preis muss ebenfalls im Warenkorb und Checkout gelten.

JTL ist führend.

---

# 18. MINDESTBESTELLWERT

Mindestbestellwert:

# 350,00 € netto

Keine Mindestbestellmenge pro Produkt.

Der Händler kann beliebige Mengen bestellen, solange der Warenkorb insgesamt mindestens:

350 € netto

beträgt.

Zeige im Warenkorb beispielsweise:

„Noch 82,40 € bis zum Mindestbestellwert.“

Sobald erreicht:

„Mindestbestellwert erreicht.“

Checkout darf unter 350 € netto nicht abgeschlossen werden.

Die Prüfung darf nicht ausschließlich clientseitig erfolgen.

---

# 19. LAGERBESTAND

Der tatsächliche Bestand kommt aus JTL.

Der Händler soll sehen können:

# tatsächlich verfügbarer Bestand

Beispiel:

„137 Stück verfügbar“

Allerdings verwenden wir einen Sicherheitspuffer von:

# 3 Stück

Berechnung:

verkaufbarer Shopify-Bestand =
JTL verfügbarer Bestand - 3

Beispiele:

JTL: 100

Shopify B2B verfügbar:

97

JTL: 3

Shopify:

0

JTL: 2

Shopify:

0

Negative Bestände sind ausgeschlossen.

Formel:

max(JTL_available - 3, 0)

Der Kunde darf maximal diese Menge bestellen.

---

# 20. KEIN OVERSELLING

Wenn verfügbarer B2B-Bestand nach Abzug des Puffers:

0

ist:

Produkt/Variante:

# Nicht verfügbar

Der Kunde darf diese Variante nicht bestellen.

Keine Backorders im MVP.

Keine Überverkäufe.

---

# 21. ECHTZEIT-SYNCHRONISATION

Ziel ist eine möglichst echtzeitnahe Synchronisation.

Prioritäten:

## Sehr hohe Priorität

* Lagerbestand
* Kundenfreigabe
* Kundenpreise
* Preisgruppen

## Hohe Priorität

* Produkte
* Varianten
* Staffelpreise

## Normal

* Bilder
* Produkttexte

Nutze wenn möglich:

* Webhooks
* Events
* vorhandene JTL-Mechanismen

statt ausschließlich Polling.

Wenn Echtzeit technisch nicht vollständig möglich ist:

Implementiere einen sinnvollen Hybrid:

Webhook/Event

*

regelmäßiger Reconciliation Job.

Beispielsweise:

Event → sofort

plus

vollständiger Abgleich periodisch.

---

# 22. SYNC-SICHERHEIT

Jede Synchronisation benötigt:

* Logging
* Error Handling
* Retries
* Backoff
* Dead Letter / Fehlerprotokoll
* idempotente Verarbeitung
* Duplicate Prevention
* Rate-Limit Handling
* Monitoring

Ein kurzfristiger API-Ausfall darf nicht dazu führen, dass Daten dauerhaft verloren gehen.

---

# 23. B2B PRODUKTÜBERSICHT

Die wichtigste Shopseite ist die Produktübersicht.

Sie soll wesentlich effizienter sein als ein klassischer B2C-Shop.

Der Händler soll schnell bestellen können.

Implementiere:

* Kategorie-Navigation
* Suche
* Filter
* Sortierung
* Produktbilder
* Produktname
* Artikelnummer
* Varianten
* Kundenpreis
* Staffelpreise
* Bestand
* Mengenfeld
* Direkt-in-Warenkorb

Filter soweit anhand vorhandener Daten möglich:

* Kategorie
* Produktart
* Kollektion
* Farbe
* Größe
* Geschlecht/Zielgruppe
* Verfügbarkeit

---

# 24. QUICK ORDER

Implementiere eine:

# Schnellbestellung / Quick Order

Dies ist eine zentrale B2B-Funktion.

Der Händler soll mehrere Produkte ohne ständiges Öffnen einzelner Produktseiten bestellen können.

Beispiel Tabellenansicht:

Artikel | Variante | Bestand | Preis | Menge | Warenkorb

Für Variantenprodukte gerne Matrixdarstellung.

Beispiel:

| Größe | Schwarz |  Weiß |  Grau |
| ----- | ------: | ----: | ----: |
| 35–38 |   Menge | Menge | Menge |
| 39–42 |   Menge | Menge | Menge |
| 43–46 |   Menge | Menge | Menge |

Der Kunde trägt Mengen ein und fügt alles gesammelt zum Warenkorb hinzu.

---

# 25. SKU-SUCHE

B2B-Kunden kennen häufig Artikelnummern.

Die Suche muss daher sehr gut funktionieren mit:

* Produktname
* SKU
* Artikelnummer
* EAN

SKU-Suche hat hohe Priorität.

---

# 26. REORDER

Im Kundenkonto soll der Kunde frühere Bestellungen sehen.

Implementiere:

# Erneut bestellen

Ein Klick auf:

„Erneut bestellen“

soll verfügbare Produkte aus einer vorherigen Bestellung in einen neuen Warenkorb übernehmen.

Aktuelle Preise und aktuelle Bestände müssen dabei verwendet werden.

Nicht einfach alte Preise übernehmen.

Wenn ein Produkt nicht mehr verfügbar ist:

klar kennzeichnen.

---

# 27. CSV QUICK ORDER – OPTIONAL MVP+

Wenn mit vertretbarem Aufwand möglich, implementiere zusätzlich:

CSV-Bestellung.

Beispiel:

SKU;Menge
OCC123;20
OCC456;50

Nach Upload:

* SKU validieren
* Bestand prüfen
* aktuelle Preise berechnen
* Fehler anzeigen
* Warenkorb erzeugen

Wenn dies den MVP unnötig verzögert, sauber als Phase 2 vorbereiten.

---

# 28. PRODUKTDETAILSEITE

Produktseite:

* große Produktbilder
* Produktname
* Artikelnummer
* Beschreibung
* Varianten
* verfügbarer Bestand pro Variante
* persönlicher Nettopreis
* Staffelpreise
* Mengenwahl
* Warenkorb
* Liefer-/Verfügbarkeitsinformation

Design B2B-orientiert.

Keine unnötigen Marketing-Spielereien.

Bestellgeschwindigkeit ist wichtiger.

---

# 29. WARENKORB

Der B2B-Warenkorb benötigt:

* Produktbild
* Produkt
* SKU
* Variante
* Menge
* Einzelpreis netto
* Positionssumme netto
* Bestandshinweis
* Mindestbestellwert
* Zwischensumme
* MwSt.
* Gesamtsumme

Mengen müssen direkt editierbar sein.

Bestandsprüfung vor Checkout erneut durchführen.

Preisprüfung vor Checkout erneut durchführen.

---

# 30. CHECKOUT

Der Händler soll direkt bestellen können.

Zahlungsarten für MVP:

# 1. Rechnung

# 2. Vorkasse / Banküberweisung

Keine Kreditkarte erforderlich.

Kein PayPal erforderlich.

Richte die Zahlungslogik soweit möglich über native Shopify B2B-/Manual-Payment-Funktionen ein.

---

# 31. ZAHLUNGSART RECHNUNG

Rechnung darf nur entsprechend der hinterlegten Kundenkonditionen angeboten werden.

Falls JTL bereits enthält:

* Zahlungsziel
* Zahlungsart
* Kreditlimit
* Kundensperre

prüfe, welche dieser Informationen sinnvoll synchronisiert werden können.

Mindestens soll eine eindeutige Logik bestehen, welcher Händler auf Rechnung bestellen darf.

Falls im MVP alle freigegebenen Händler Rechnung nutzen dürfen, strukturiere die Lösung trotzdem so, dass später kundenindividuelle Zahlungsbedingungen möglich sind.

---

# 32. VORKASSE

Vorkasse soll als manuelle Zahlungsart angeboten werden.

Bestellung wird trotzdem direkt nach JTL übertragen.

Der entsprechende Zahlungsstatus muss sauber übertragen bzw. erkennbar sein.

---

# 33. SHOPIFY → JTL AUFTRAG

Jede abgeschlossene Shopify-B2B-Bestellung soll automatisch nach JTL übertragen werden.

JTL soll daraus den regulären Auftrag erhalten.

Übertrage mindestens:

* Shopify Order ID
* Shopify Order Number
* Kunde
* JTL-Kundenzuordnung
* Positionen
* SKU
* Mengen
* Preise
* Rabatte
* Nettosumme
* MwSt.
* Bruttosumme
* Zahlungsart
* Zahlungsstatus
* Rechnungsadresse
* Lieferadresse
* Bestellzeitpunkt

Keine manuellen Doppelarbeiten.

---

# 34. AUFTRAGSZUSAMMENFASSUNG

Der Shopify-Auftrag soll sauber in den bestehenden JTL-Auftragsprozess laufen.

Prüfe zunächst, wie die bestehende JTL-Shopify-Anbindung Bestellungen aktuell importiert.

Nutze den bestehenden Prozess.

Keine parallele Auftragserstellung via Custom API, wenn JTL die Shopify-Bestellung bereits standardmäßig importiert.

Vermeide unbedingt doppelte Aufträge.

---

# 35. JTL → SHOPIFY STATUS

Soweit die vorhandene Integration dies unterstützt, sollen zurück synchronisiert werden:

* Bestellstatus
* Versandstatus
* Trackingnummer
* Versanddienstleister

Der Kunde soll diese Informationen im Kundenkonto sehen.

---

# 36. RECHNUNGEN

Kunden sollen in ihrem Konto Rechnungen herunterladen können.

Ideal:

JTL erzeugt Rechnung

→ Rechnung/PDF wird verfügbar

→ Kunde sieht sie bei seiner Bestellung

→ „Rechnung herunterladen“

JTL bleibt führend für die Rechnung.

Prüfe, ob die bestehende Integration Rechnung/PDF übertragen kann.

Falls nicht:

entwickle eine sichere Anbindung.

Rechnungen dürfen niemals öffentlich zugänglich sein.

Autorisierung prüfen:

Der angemeldete Kunde darf ausschließlich eigene Rechnungen laden.

---

# 37. KUNDENKONTO

Kundenkonto bewusst schlank halten.

Navigation:

# Übersicht

# Bestellungen

# Rechnungen

# Unternehmensdaten

# Adressen

# Abmelden

Zusätzlich:

„Erneut bestellen“

Kunde muss keine unnötigen Funktionen sehen.

---

# 38. ADRESSÄNDERUNGEN

Kunden dürfen:

* Rechnungsadresse
* Lieferadresse

ändern.

Änderungen sollen zurück nach JTL synchronisiert werden.

Definiere klar Konfliktregeln.

Grundsätzlich bleibt JTL führend.

Eine vom Kunden bewusst durchgeführte Adressänderung soll aber als autorisierte Aktualisierung nach JTL übertragen werden.

---

# 39. VERTRIEB / ADMIN-BESTELLUNG

Occulto-Mitarbeiter sollen möglichst im Namen eines Kunden eine Bestellung vorbereiten bzw. erfassen können.

Prüfe dafür zuerst native Shopify-B2B-Funktionen:

* Company
* Customer
* Draft Order
* Admin Order
* entsprechende API

Keinen unsicheren „Login as Customer“-Hack implementieren.

Ziel:

Vertrieb erhält beispielsweise telefonische Bestellung

→ Kunde auswählen

→ Artikel eintragen

→ korrekte Kundenpreise

→ Auftrag

→ JTL

---

# 40. SPRACHEN

Shop:

# Deutsch

# Englisch

Deutsch ist Primärsprache.

Alle neuen Theme-Texte müssen über Shopify Translation Keys laufen.

Keine Texte direkt hart in Templates schreiben, wenn sie übersetzbar sein sollen.

---

# 41. DACH

Markets:

* Deutschland
* Österreich
* Schweiz

Prüfe:

* MwSt.
* USt-ID
* Schweizer Steuerlogik
* Lieferadressen
* Währung

Basiswährung zunächst entsprechend bestehendem Shop.

Keine eigene Steuerengine entwickeln, wenn Shopify dies korrekt übernehmen kann.

---

# 42. DESIGN

Der Shop soll eindeutig nach:

# OCCULTO

aussehen.

Analysiere dafür:

* vorhandenen Shopify-Shop
* bestehendes Occulto-Theme
* Logo
* Farben
* Typografie
* Bildsprache
* Buttons
* Abstände
* Header
* Footer
* Produktkarten

Übernimm die Occulto Corporate Identity.

Aber:

B2B-Shop darf funktionaler und reduzierter sein als der B2C-Auftritt.

Stil:

* modern
* hochwertig
* clean
* sportlich
* professionell
* Premium
* minimalistisch
* viel Weißraum
* klar
* schnell

Kein klassischer „Großhandels-Shop von 2012“.

---

# 43. MOBILE

Der Shop muss vollständig responsive sein.

Insbesondere optimieren für:

* Desktop
* Laptop
* iPad
* Smartphone

B2B wird wahrscheinlich stark am Desktop genutzt.

Desktop darf deshalb besonders effizient sein.

Mobile darf trotzdem keine abgespeckte schlechte Version sein.

---

# 44. PERFORMANCE

Ziele:

* schnelle Ladezeit
* keine unnötigen JS-Bibliotheken
* optimierte Bilder
* Lazy Loading
* möglichst wenig Layout Shift
* effiziente Liquid-/API-Queries
* performante Suche
* performante Variantenmatrix

Vermeide App-Bloat.

Installiere nicht für jede Kleinigkeit eine Shopify-App.

Bevorzuge:

native Shopify-Funktion

vor

kleiner eigener Implementierung

vor

externer App.

---

# 45. SECURITY

Behandle den Shop wie ein produktives Geschäftssystem.

Insbesondere:

* keine Secrets im Git Repository
* Environment Variables
* sichere Webhook-Verifizierung
* API Scope nach Least Privilege
* Zugriffskontrolle
* serverseitige Preisvalidierung
* serverseitige Bestandsvalidierung
* Input Validation
* Rate Limiting soweit erforderlich
* CSRF/XSS berücksichtigen
* sichere Rechnungsauslieferung
* keine personenbezogenen Daten in Logs
* GDPR/DSGVO berücksichtigen

---

# 46. WEBHOOKS

Alle Webhook-Endpunkte müssen:

* Shopify Signatur/HMAC validieren
* idempotent arbeiten
* Wiederholungen vertragen
* Fehler loggen
* keine doppelten Datensätze erzeugen

Speichere verarbeitete Event IDs bzw. geeignete Idempotency Keys.

---

# 47. MIDDLEWARE

Falls erforderlich darf eine Middleware entwickelt werden.

Bevorzugte Architektur:

Shopify

↕

Middleware

↕

JTL

aber NUR für Funktionen, die nicht bereits zuverlässig durch die bestehende JTL-Shopify-Verbindung gelöst werden.

Die Middleware soll möglichst klein bleiben.

Geeigneter moderner Stack:

* TypeScript
* Node.js
* PostgreSQL nur wenn Persistenz tatsächlich benötigt wird
* Queue nur wenn für zuverlässige Sync-Prozesse erforderlich
* Docker
* strukturierte Logs

Passe dich aber an die vorhandene Infrastruktur an.

Keine neue Technologie einführen, wenn bereits eine passende Struktur vorhanden ist.

---

# 48. DATENMODELL MIDDLEWARE

Falls Middleware notwendig:

halte möglichst nur Mapping-/Synchronisationsdaten.

Beispiele:

customer_mapping

* shopify_customer_id
* shopify_company_id
* shopify_company_location_id
* jtl_customer_id
* synced_at

sync_events

* event_id
* type
* status
* attempts
* created_at
* processed_at
* error

Keine vollständige Kopie der JTL-Wawi aufbauen.

---

# 49. OBSERVABILITY

Ich möchte später erkennen können:

* funktioniert JTL-Sync?
* wann war letzter Bestandssync?
* gibt es fehlerhafte Kunden?
* gibt es Preisfehler?
* gibt es nicht importierte Aufträge?
* laufen Webhooks?

Erstelle deshalb ein einfaches technisches Monitoring.

Kein Enterprise-Monster.

Aber Fehler dürfen nicht stillschweigend passieren.

---

# 50. UX – HEADER

Eingeloggt:

Logo

Navigation:

* Produkte
* Schnellbestellung
* Neuheiten
* Bestellungen
* Rechnungen
* Konto

Zusätzlich:

* Suche
* Warenkorb
* DE/EN

Nicht eingeloggt:

* Occulto B2B
* Händler werden
* Login
* Kontakt

---

# 51. DASHBOARD NACH LOGIN

Nach Login soll der Händler nicht auf einer langweiligen Accountseite landen.

Erstelle ein kleines B2B-Dashboard.

Beispiel:

„Willkommen zurück, Sporthaus Mustermann“

Darunter:

* Produkte bestellen
* Schnellbestellung
* Letzte Bestellung
* Erneut bestellen
* Offene Bestellung
* Rechnungen

Dazu eventuell:

* Neuheiten
* Bestseller

Nicht überladen.

---

# 52. STARTSEITE

B2B-Startseite nach Login:

## Hero

Occulto Händlerportal

„Entdecken Sie das aktuelle Occulto Sortiment und bestellen Sie direkt zu Ihren individuellen Händlerkonditionen.“

CTA:

Produkte ansehen

Schnellbestellung

Danach:

* Neuheiten
* Bestseller
* Produktkategorien
* Vorteile
* Reorder
* Kontakt Vertrieb

---

# 53. NICHT EINGELOGGTE STARTSEITE

Für Interessenten:

Occulto B2B

Kurze Markenpräsentation.

Vorteile:

* attraktive Händlermargen
* starke Marke
* attraktive Sortimente
* schneller Versand
* persönliche Betreuung
* einfache Nachbestellung

CTA:

# Händler werden

Sekundär:

# Händler-Login

Keine Preise.

---

# 54. FEEDBACK IM SHOP

Verwende klare Meldungen.

Beispielsweise:

„Nur noch 3 Stück verfügbar.“

„Dieser Artikel ist aktuell nicht verfügbar.“

„Noch 72,50 € bis zum Mindestbestellwert.“

„Ihre Händleranfrage wird derzeit geprüft.“

„Ihr Händlerkonto wurde freigeschaltet.“

„Dieser Artikel wurde zum Warenkorb hinzugefügt.“

Keine technischen Fehlermeldungen für Kunden.

---

# 55. ADMIN WORKFLOW

Der interne Workflow soll extrem einfach sein.

Idealfall:

Shopify Admin

→ Händleranfragen

→ Kunde öffnen

→ Daten überprüfen

→ Freigeben

Danach automatisch:

* Company erstellen/aktivieren
* Company Location
* B2B-Kontakt zuweisen
* relevante Preislogik
* JTL-Kundenanlage Kundengruppe Einzelhandel
* IDs synchronisieren
* Freigabemail senden

Wenn Shopify Flow dafür sinnvoll ist:

nutze Shopify Flow.

---

# 56. E-MAILS

Erstelle/überarbeite mindestens:

## Registrierung erhalten

„Vielen Dank für Ihre Händleranfrage.“

## Händler freigeschaltet

„Ihr Occulto Händlerkonto wurde freigeschaltet.“

CTA:

„Zum Händlerportal“

## Händler abgelehnt

optional administrativ auslösbar.

## Bestellung erhalten

Shopify Standard angepasst an Occulto.

E-Mail-Design Occulto CI.

DE + EN.

---

# 57. EDGE CASES

Berücksichtige insbesondere:

## Kunde registriert sich zweimal

→ kein Duplikat.

## JTL-Kunde existiert bereits

→ möglichst matchen statt neu anlegen.

## E-Mail geändert

→ Mapping darf nicht verloren gehen.

## JTL nicht erreichbar

→ Queue/Retry.

## Shopify nicht erreichbar

→ Retry.

## Bestand ändert sich während Checkout

→ vor Abschluss erneut validieren.

## Preis ändert sich während Session

→ Checkout verwendet aktuellen autorisierten Preis.

## Produkt wird deaktiviert

→ nicht weiter bestellbar.

## Variante wird gelöscht

→ sauber behandeln.

## Auftrag bereits übertragen

→ nicht erneut erzeugen.

---

# 58. TESTS

Vor MVP-Abschluss müssen mindestens folgende Szenarien getestet sein.

## Registrierung

* neuer Kunde
* unvollständiges Formular
* ungültige USt-ID soweit validiert
* doppelte Registrierung

## Freigabe

* Pending
* Approved
* abgelehnt

## JTL

* Neukunde
* bestehender Kunde
* Sync-Fehler
* Wiederholung

## Preise

* Standard Preisgruppe
* zweite Preisgruppe
* individuelle Kundenpreise
* Staffelpreis

## Bestand

JTL 100 → Shop 97

JTL 4 → Shop 1

JTL 3 → Shop 0

JTL 0 → Shop 0

## Warenkorb

* unter 350 €
* exakt 350 €
* über 350 €

## Bestellung

* Rechnung
* Vorkasse

## Reorder

* alle Artikel vorhanden
* teilweise nicht vorhanden
* Preis geändert
* Bestand geändert

## Berechtigungen

* nicht eingeloggt
* Pending-Kunde
* freigeschalteter Kunde
* Versuch fremde Rechnung aufzurufen

---

# 59. MVP DEFINITION OF DONE

Der MVP gilt erst als fertig, wenn folgender End-to-End-Prozess funktioniert:

### SCHRITT 1

Neuer Händler öffnet B2B-Shop.

### SCHRITT 2

Er sieht keine Preise.

### SCHRITT 3

Er registriert sich.

### SCHRITT 4

Occulto sieht die Händleranfrage.

### SCHRITT 5

Occulto gibt Händler frei.

### SCHRITT 6

Kunde wird JTL-Kundengruppe:

„Einzelhandel“

zugeordnet/angelegt.

### SCHRITT 7

Händler erhält Freigabe-E-Mail.

### SCHRITT 8

Händler meldet sich an.

### SCHRITT 9

Er sieht ausschließlich freigegebene B2B-Produkte aus „08_Einzelhandel“.

### SCHRITT 10

Er sieht seine korrekten JTL-Nettopreise.

### SCHRITT 11

Er sieht Staffelpreise.

### SCHRITT 12

Er sieht tatsächlichen Bestand minus 3 Stück Puffer.

### SCHRITT 13

Er legt unterschiedliche Varianten in Warenkorb.

### SCHRITT 14

Unter 350 € kann er Bestellung nicht abschließen.

### SCHRITT 15

Ab 350 € netto ist Checkout möglich.

### SCHRITT 16

Er wählt Rechnung oder Vorkasse.

### SCHRITT 17

Bestellung wird abgeschlossen.

### SCHRITT 18

Bestellung landet genau EINMAL in JTL.

### SCHRITT 19

JTL bearbeitet Bestellung.

### SCHRITT 20

Versandinformationen gelangen zurück zu Shopify.

### SCHRITT 21

Kunde sieht Bestellung im Account.

### SCHRITT 22

Rechnung kann heruntergeladen werden.

Dieser vollständige Ablauf ist das zentrale MVP-Erfolgskriterium.

---

# 60. NICHT IM MVP ERFORDERLICH

Nicht unnötig aufblähen.

Folgende Dinge können später kommen:

* komplexe Sales-CRM-Funktionen
* Außendienst-App
* umfangreiche BI-Analytics
* Angebotsmanagement
* Retourenportal
* komplexe Kreditlimits
* automatisches Mahnwesen
* EDI
* sehr komplexe Einkaufslisten
* Vertreterprovision
* Multi-Brand
* Multi-Warehouse-Auswahl für Kunden

Architektur darf spätere Erweiterungen ermöglichen.

Aber:

# MVP ZUERST.

---

# 61. PHASE 2 VORBEREITEN

Architektur so strukturieren, dass später unter anderem möglich sind:

* Wunschlisten
* Favoriten
* gespeicherte Bestelllisten
* CSV Quick Order
* Vertreterportal
* Kundenbudgets
* Kreditlimits
* Angebote
* B2B-Aktionen
* Aktionspreise
* Bundles
* Vororder
* Saisonorder
* Download Center
* Produktdatenblätter
* Marketingmaterial
* POS-Material
* Händler-Newsletter
* ERP-Auswertungen

Nicht jetzt vollständig implementieren.

---

# 62. DOKUMENTATION

Dokumentiere nach Implementierung:

## Architektur

Welche Systeme kommunizieren miteinander?

## Shopify

Welche Funktionen wurden verwendet?

## JTL

Welche Daten kommen aus JTL?

## Middleware

Falls vorhanden:
Warum existiert sie?

## Datenmapping

JTL ↔ Shopify.

## Preislogik

Wie werden Preise ermittelt?

## Bestand

Wie funktioniert der 3-Stück-Puffer?

## Kundenfreigabe

Wie läuft sie?

## Fehler

Wo sehe ich Sync-Probleme?

## Deployment

Wie deploye ich Änderungen?

## Secrets

Welche Environment Variables werden benötigt?

## Betrieb

Was muss ein Mitarbeiter wissen?

Erstelle dafür im Repository:

README.md

und falls sinnvoll:

docs/architecture.md

docs/jtl-shopify-sync.md

docs/b2b-workflows.md

---

# 63. BACKUP VOR ÄNDERUNGEN

Bevor du größere Änderungen am bestehenden Shop oder Theme durchführst:

* Git Status prüfen
* aktuellen Stand sichern
* bestehenden Branch nicht zerstören
* neuen Feature Branch verwenden
* keine produktiven Einstellungen unkontrolliert überschreiben

Wenn möglich:

Staging/Duplicate Theme verwenden.

Nicht direkt ungetestet auf das Live-Theme deployen.

---

# 64. ARBEITSWEISE

Arbeite in dieser Reihenfolge:

## PHASE A – DISCOVERY

Bestehenden Shopify-/JTL-Stack untersuchen.

## PHASE B – ARCHITEKTUR

Entscheiden, welche Funktionen:

* Shopify nativ
* bestehende JTL-Integration
* Shopify Flow
* Theme
* Custom App
* Middleware

übernehmen.

## PHASE C – FOUNDATION

* Markets
* B2B
* Customer Accounts
* Companies
* Registrierung
* Freigabelogik

## PHASE D – JTL

* Kunden
* Artikel
* Preise
* Staffelpreise
* Bestand
* Aufträge

## PHASE E – STOREFRONT

* Design
* Navigation
* Collection
* Produkt
* Suche
* Quick Order
* Warenkorb

## PHASE F – ACCOUNT

* Bestellungen
* Rechnungen
* Reorder

## PHASE G – CHECKOUT

* 350 € Mindestbestellwert
* Rechnung
* Vorkasse
* Preisvalidierung
* Bestandsvalidierung

## PHASE H – TEST

End-to-End.

## PHASE I – DOCUMENTATION

Betriebsdokumentation.

---

# 65. ENTSCHEIDUNGSPRINZIPIEN

Wenn mehrere technische Lösungen möglich sind:

Priorität:

1. zuverlässig
2. Shopify-/JTL-konform
3. wartbar
4. sicher
5. einfach
6. performant
7. kostengünstig

Nicht:

„technisch interessant“.

Wir bauen einen Shop für ein echtes Unternehmen.

---

# 66. KEINE MOCK-DATEN IM PRODUKTIVSYSTEM

Verwende für Layoutentwicklung bei Bedarf temporäre Testdaten.

Aber vor Fertigstellung:

* echte JTL-Struktur
* echte Shopify-Produkte
* echte Metafields
* echte Preisstruktur
* echte Bestände

verwenden.

Keine hartcodierten Beispielpreise oder SKUs in produktivem Code.

---

# 67. KEINE ANNAHMEN ÜBER JTL

JTL-Wawi kann kundenspezifische Konfigurationen besitzen.

Deshalb:

Bevor du Attribute/Felder/IDs verwendest:

untersuche die tatsächliche vorhandene Struktur.

Beispielsweise nicht einfach:

customerGroup = "Einzelhandel"

hart codieren.

Wenn eine ID existiert:

verwende Mapping/Konfiguration.

Dasselbe gilt für:

„08_Einzelhandel“.

---

# 68. KONFIGURATION

Konfigurierbare Businessregeln zentral halten.

Beispielsweise:

MIN_ORDER_NET = 350

INVENTORY_BUFFER = 3

ALLOWED_COUNTRIES = DE, AT, CH

DEFAULT_JTL_CUSTOMER_GROUP = ...

B2B_PRODUCT_SOURCE = ...

Nicht an zehn Stellen im Code duplizieren.

---

# 69. BESONDERE PRIORITÄT: DATENKONSISTENZ

Die schlimmsten möglichen Fehler wären:

1. falscher Kundenpreis
2. falscher Lagerbestand
3. doppelte Bestellung
4. falscher Kunde in JTL
5. fremde Rechnung sichtbar
6. nicht synchronisierte Bestellung

Diese Fehler sind wichtiger als kleine optische Fehler.

Baue die Architektur entsprechend robust.

---

# 70. BESONDERE PRIORITÄT: B2B UX

Ein Händler möchte nicht 30 Minuten im Shop verbringen.

Ziel:

Eine typische Nachbestellung soll in wenigen Minuten möglich sein.

Daher:

* starke Suche
* Artikelnummernsuche
* Quick Order
* Variantenmatrix
* Mengenfelder
* Reorder
* klare Verfügbarkeit
* klare Nettopreise
* wenig Klicks

Optimiere jede Seite anhand dieses Ziels.

---

# 71. ERFOLGSMETRIKEN

Der fertige Shop sollte perspektivisch ermöglichen zu messen:

* registrierte Händler
* freigeschaltete Händler
* aktive Händler
* B2B-Umsatz
* durchschnittlicher Warenkorb
* Bestellfrequenz
* Reorder Rate
* Conversion
* Bestseller
* Suchbegriffe ohne Treffer
* abgebrochene Warenkörbe

Nutze dafür möglichst vorhandene Shopify Analytics.

Keine zusätzliche BI-Lösung im MVP entwickeln.

---

# 72. WICHTIGE BUSINESSREGELN – KURZFASSUNG

Noch einmal verbindlich:

**ERP:** JTL-Wawi

**Shop:** Shopify

**Shopify Plan:** kein Shopify Plus

**Marke:** ausschließlich Occulto

**Zielgruppe:** B2B / Einzelhandel

**Region:** DACH

**Sprachen:** Deutsch + Englisch

**Registrierung:** offen

**Freischaltung:** manuell durch Occulto

**JTL Kundengruppe:** Einzelhandel

**Preise:** netto

**Preisgruppen:** aus JTL

**Individualpreise:** aus JTL

**Staffelpreise:** aus JTL

**Produkte:** ausschließlich aus JTL-Bereich „08_Einzelhandel“

**Bilder:** JTL

**Bestände:** JTL

**Bestandspuffer:** 3 Stück

**Overselling:** nein

**Mindestbestellwert:** 350 € netto

**Mindestmenge:** keine

**Zahlung:** Rechnung + Vorkasse

**Aufträge:** automatisch nach JTL

**Rechnungen:** JTL → Kundenkonto

**Quick Order:** ja

**Reorder:** ja

**SKU-Suche:** ja

**JTL:** Single Source of Truth

**Sync:** möglichst Echtzeit

**Design:** bestehendes Occulto Corporate Design

**Release:** zuerst MVP

---

# 73. STARTE JETZT

Beginne jetzt mit der Analyse des vorhandenen Repositories, des verbundenen Shopify-Shops und der bestehenden JTL-Shopify-Integration.

Erstelle KEINE lange theoretische Abhandlung bevor du beginnst.

Arbeite stattdessen so:

1. Umgebung untersuchen.
2. Kritische Architekturentscheidungen festhalten.
3. vorhandene Funktionen wiederverwenden.
4. fehlende Komponenten implementieren.
5. testen.
6. Fehler beheben.
7. MVP End-to-End testen.
8. dokumentieren.

Führe die Umsetzung so weit wie mit deinen vorhandenen Zugriffsrechten technisch möglich selbstständig durch.

Wenn dir ein Zugriff oder Credential tatsächlich fehlt:

Dokumentiere exakt:

* was fehlt
* wofür es benötigt wird
* wo es eingerichtet werden muss
* welche Berechtigung benötigt wird

und arbeite währenddessen an allen anderen Punkten weiter.

Unterbrich die gesamte Implementierung nicht wegen eines einzelnen fehlenden Zugriffs.

Das Ziel ist kein Konzept.

# DAS ZIEL IST EIN FUNKTIONIERENDER OCCULTO B2B SHOP.
