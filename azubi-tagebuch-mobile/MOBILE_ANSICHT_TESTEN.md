# Mobile-Ansicht testen

## Wichtig zu wissen

Die App ist **speziell für Smartphones optimiert**. Die neuen Features (Tabs im Header, Kalender am unteren Rand) sind nur auf **Bildschirmen unter 820px Breite** sichtbar.

---

## Methode 1: Echtes Smartphone (empfohlen)

### Schritt 1: ZIP auf Smartphone übertragen
- Per E-Mail, Cloud (Dropbox, Google Drive) oder USB-Kabel
- ZIP auf dem Smartphone entpacken

### Schritt 2: App öffnen
- Datei-Manager öffnen
- Zum entpackten Ordner navigieren
- `index.html` antippen
- Im Browser öffnen

### Schritt 3: Als Web-App installieren (optional)

**iOS (Safari):**
1. Teilen-Button (Quadrat mit Pfeil) antippen
2. "Zum Home-Bildschirm" wählen
3. App erscheint wie eine native App

**Android (Chrome):**
1. Menü (⋮) öffnen
2. "Zum Startbildschirm hinzufügen" wählen
3. App erscheint wie eine native App

---

## Methode 2: Desktop-Browser mit Mobile-Simulation

### Chrome/Edge:
1. App im Browser öffnen (index.html)
2. **F12** drücken (DevTools öffnen)
3. **Strg+Shift+M** drücken (Mobile-Modus)
4. Gerät wählen: "iPhone 12 Pro" oder "Samsung Galaxy S21"
5. Seite neu laden (**F5**)

### Safari:
1. App im Browser öffnen (index.html)
2. **Entwickler-Menü** aktivieren (Einstellungen → Erweitert)
3. **Entwickler → Responsive Design-Modus** (Cmd+Option+R)
4. Gerät wählen: "iPhone 12 Pro"
5. Seite neu laden

### Firefox:
1. App im Browser öffnen (index.html)
2. **F12** drücken (DevTools öffnen)
3. **Strg+Shift+M** drücken (Responsive Design-Modus)
4. Gerät wählen: "iPhone 12/13 Pro"
5. Seite neu laden

---

## Methode 3: Mobile-Test-Seite (mitgeliefert)

Die ZIP enthält eine spezielle Test-Seite:

1. `mobile-test.html` im Browser öffnen
2. Zeigt die App in einem iPhone 12 Pro Simulator
3. Perfekt um die Mobile-Ansicht zu demonstrieren

---

## Was Sie sehen sollten

### Oben (Header):
- Brand "Azubi Tagebuch Küche"
- Lehrjahr-Buttons (1, 2, 3)
- Stats (Tage, Wochen, Monate)
- Export/Import Buttons
- **Tabs horizontal scrollbar** (Start, Kalender, Tag, Woche, etc.)

### Mitte (Content):
- Aktueller Panel-Inhalt
- Start-Panel: Prominentes Notizfeld
- Scrollbar für lange Inhalte

### Unten (Kalender-Bar):
- Monat-Header: "Februar 2026" mit < > Navigation
- Wochentag-Labels: SO, MO, DI, MI, DO, FR, SA
- 7-Tage-Woche-Grid mit allen Tagen
- Heute-Tag hervorgehoben (braun)
- "Heute"-Button und "Kalender öffnen"-Button

---

## Fehlerbehebung

### Problem: Kalender-Bar nicht sichtbar

**Ursache:** Browser-Breite ist größer als 820px

**Lösung:**
- Echtes Smartphone verwenden, oder
- Browser-DevTools mit Mobile-Simulation nutzen, oder
- Browser-Fenster sehr schmal machen (<820px)

### Problem: Tabs immer noch unten

**Ursache:** Browser-Cache lädt alte Version

**Lösung:**
- **Strg+F5** (Hard Reload)
- Browser-Cache leeren
- Private/Inkognito-Modus verwenden

### Problem: Schrift zu groß/klein

**Ursache:** Browser-Zoom ist nicht 100%

**Lösung:**
- **Strg+0** (Zoom zurücksetzen)
- Zoom auf 100% stellen

---

## Empfohlene Test-Geräte

### Smartphones:
- iPhone SE (375px) - Kleinster Test
- iPhone 12 Pro (390px) - Standard
- iPhone 14 Pro Max (430px) - Größter iPhone
- Samsung Galaxy S21 (360px) - Standard Android
- Samsung Galaxy S22 Ultra (384px) - Größerer Android

### Tablets (funktioniert auch):
- iPad Mini (768px) - Zeigt Desktop-Ansicht
- iPad Air (820px) - Grenzfall

---

## Support

Bei Fragen oder Problemen:

**RE:BELLE™ Media**  
rebelle.media.creator@gmail.com  
newwomanintheshop.com  
rebellemedia.de

---

**Die App ist 100% smartphone-tauglich! Viel Erfolg bei der Ausbildung!**
