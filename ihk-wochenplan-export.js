// ============================================================================
// IHK-KONFORMER WOCHENPLAN-EXPORT
// ============================================================================
// Exportiert Tages-Einträge als IHK-konformen Ausbildungsnachweis (PDF)
// Gemäß IHK-Vorgaben für digitales Berichtsheft

(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // ========================================================================
  // IHK-WOCHENPLAN DATEN SAMMELN
  // ========================================================================
  const collectWeeklyData = (weekNumber, year) => {
    // Hole alle Einträge aus localStorage
    const allEntries = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('day_')) {
        const dateStr = key.replace('day_', '');
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          allEntries[dateStr] = data;
        } catch (e) {
          console.error('Fehler beim Parsen von', key, e);
        }
      }
    }

    // Finde Einträge der gewünschten Woche
    const weekEntries = [];
    Object.keys(allEntries).forEach(dateStr => {
      const date = new Date(dateStr + 'T00:00:00');
      const entryWeek = getWeekNumber(date);
      const entryYear = date.getFullYear();
      
      if (entryWeek === weekNumber && entryYear === year) {
        weekEntries.push({
          date: dateStr,
          ...allEntries[dateStr]
        });
      }
    });

    // Sortiere nach Datum
    weekEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return weekEntries;
  };

  // ========================================================================
  // WOCHENNUMMER BERECHNEN (ISO 8601)
  // ========================================================================
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // ========================================================================
  // IHK-PDF GENERIEREN
  // ========================================================================
  const generateIHKWeeklyReport = (weekNumber, year) => {
    const entries = collectWeeklyData(weekNumber, year);
    
    if (entries.length === 0) {
      alert(`Keine Einträge für KW ${weekNumber}/${year} gefunden!`);
      return null;
    }

    // Berechne Gesamtstunden
    const totalHours = entries.reduce((sum, entry) => {
      if (entry.shift === 'frei') return sum;
      // Annahme: Früh/Spät/Split = 8h, kann angepasst werden
      return sum + 8;
    }, 0);

    // Sammle alle Tätigkeiten
    const activities = entries
      .filter(e => e.task || e.learned)
      .map(e => {
        const dateObj = new Date(e.date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
        const dayDate = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        
        let text = `${dayName} ${dayDate}: `;
        if (e.station) text += `${e.station} - `;
        if (e.task) text += e.task;
        if (e.learned) text += ` | Gelernt: ${e.learned}`;
        
        return text;
      })
      .join('\n');

    // Sammle Lernziele und Standards
    const learningGoals = entries
      .filter(e => e.learningGoal)
      .map(e => `• ${e.learningGoal}`)
      .join('\n');

    const standards = entries
      .filter(e => e.standard)
      .map(e => `• ${e.standard}`)
      .join('\n');

    // Berechne Zeitraum
    const startDate = new Date(entries[0].date + 'T00:00:00');
    const endDate = new Date(entries[entries.length - 1].date + 'T00:00:00');
    const dateRange = `${startDate.toLocaleDateString('de-DE')} - ${endDate.toLocaleDateString('de-DE')}`;

    // HTML für PDF generieren
    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IHK Ausbildungsnachweis - KW ${weekNumber}/${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 15mm; }
    
    body {
      font-family: 'Arimo', Arial, sans-serif;
      font-size: 9pt;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 15mm;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    
    .header-brand {
      font-size: 11pt;
      font-weight: bold;
      color: #000;
      margin-bottom: 4px;
    }
    
    .header-subtitle {
      font-size: 8pt;
      color: #666;
    }
    
    .title {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin: 15px 0;
      text-transform: uppercase;
    }
    
    .meta-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
      padding: 8px;
      border: 1px solid #ccc;
      background: #f9f9f9;
    }
    
    .meta-field {
      font-size: 9pt;
    }
    
    .meta-label {
      font-weight: bold;
      display: inline-block;
      width: 100px;
    }
    
    .section {
      margin-bottom: 15px;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: bold;
      background: #e0e0e0;
      padding: 4px 8px;
      border-left: 3px solid #000;
      margin-bottom: 8px;
    }
    
    .section-content {
      padding: 8px;
      border: 1px solid #ddd;
      min-height: 60px;
      white-space: pre-wrap;
      font-size: 9pt;
      line-height: 1.5;
    }
    
    .hours-box {
      display: inline-block;
      padding: 6px 12px;
      border: 2px solid #000;
      font-weight: bold;
      font-size: 11pt;
      margin-top: 5px;
    }
    
    .signature-area {
      margin-top: 30px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    
    .signature-box {
      border-top: 1px solid #000;
      padding-top: 5px;
      text-align: center;
      font-size: 8pt;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }
    
    .footer-brand {
      font-weight: bold;
      color: #000;
    }
    
    @media print {
      body { margin: 0; padding: 0; }
      .page { 
        width: 100%; 
        min-height: 100%; 
        margin: 0; 
        padding: 15mm; 
        box-shadow: none; 
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-brand">🖤RE:BELLE™ DIRT & GLORY Projekt by Newwomanintheshop</div>
      <div class="header-subtitle">The Art of Feeling. Amplified.</div>
    </div>

    <!-- Titel -->
    <div class="title">Ausbildungsnachweis</div>

    <!-- Meta-Informationen -->
    <div class="meta-info">
      <div class="meta-field">
        <span class="meta-label">Kalenderwoche:</span> KW ${weekNumber}/${year}
      </div>
      <div class="meta-field">
        <span class="meta-label">Zeitraum:</span> ${dateRange}
      </div>
      <div class="meta-field">
        <span class="meta-label">Ausbildungsberuf:</span> Koch/Köchin
      </div>
      <div class="meta-field">
        <span class="meta-label">Lehrjahr:</span> ${localStorage.getItem('currentYear') || '1'}
      </div>
    </div>

    <!-- Ausgeführte Arbeiten -->
    <div class="section">
      <div class="section-title">1. Ausgeführte Arbeiten, Unterweisungen, Schulungen</div>
      <div class="section-content">${activities || 'Keine Einträge vorhanden'}</div>
    </div>

    <!-- Berufsschule -->
    <div class="section">
      <div class="section-title">2. Berufsschule / Überbetriebliche Unterweisung</div>
      <div class="section-content">${learningGoals || 'Keine Einträge vorhanden'}</div>
    </div>

    <!-- Standards und Regeln -->
    <div class="section">
      <div class="section-title">3. Gelernte Standards, Regeln und Verfahren</div>
      <div class="section-content">${standards || 'Keine Einträge vorhanden'}</div>
    </div>

    <!-- Gesamtstunden -->
    <div class="section">
      <div class="section-title">4. Gesamtstunden</div>
      <div class="hours-box">${totalHours} Stunden</div>
    </div>

    <!-- Unterschriften -->
    <div class="signature-area">
      <div class="signature-box">
        Datum, Unterschrift Auszubildende/r
      </div>
      <div class="signature-box">
        Datum, Unterschrift Ausbilder/in
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">♥ RE:BELLE™ by NEWWOMANINTHESHOP</div>
      <div>rebelle.media.creator@gmail.com | newwomanintheshop.com | rebellemedia.de</div>
      <div style="margin-top: 5px;">Seite 1 | Erstellt am ${new Date().toLocaleDateString('de-DE')}</div>
    </div>
  </div>
</body>
</html>
    `;

    return html;
  };

  // ========================================================================
  // PDF DOWNLOAD
  // ========================================================================
  const downloadWeeklyReport = (weekNumber, year) => {
    const html = generateIHKWeeklyReport(weekNumber, year);
    if (!html) return;
    
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const filename = `IHK_Ausbildungsnachweis_KW${weekNumber}_${year}.html`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // ========================================================================
  // PDF PRINT
  // ========================================================================
  const printWeeklyReport = (weekNumber, year) => {
    const html = generateIHKWeeklyReport(weekNumber, year);
    if (!html) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  // ========================================================================
  // UI INTEGRATION
  // ========================================================================
  const initWeeklyReportUI = () => {
    // Erstelle Button für Wochenplan-Export
    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.className = 'btn btn--primary';
    exportBtn.textContent = '📄 IHK Wochenplan';
    exportBtn.style.cssText = 'position: fixed; bottom: 80px; right: 20px; z-index: 999; padding: 12px 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
    
    exportBtn.addEventListener('click', () => {
      // Zeige Dialog für Wochenauswahl
      const currentDate = new Date();
      const currentWeek = getWeekNumber(currentDate);
      const currentYear = currentDate.getFullYear();
      
      const week = prompt(`Welche Kalenderwoche exportieren?\n(Aktuell: KW ${currentWeek}/${currentYear})`, currentWeek);
      if (!week) return;
      
      const year = prompt('Welches Jahr?', currentYear);
      if (!year) return;
      
      const action = confirm('Drücken Sie OK zum Herunterladen oder Abbrechen zum Drucken');
      
      if (action) {
        downloadWeeklyReport(Number(week), Number(year));
      } else {
        printWeeklyReport(Number(week), Number(year));
      }
    });
    
    document.body.appendChild(exportBtn);
  };

  // ========================================================================
  // INITIALISIERUNG
  // ========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeeklyReportUI);
  } else {
    initWeeklyReportUI();
  }

  // Mache Funktionen global verfügbar
  window.ihkExport = {
    generateIHKWeeklyReport,
    downloadWeeklyReport,
    printWeeklyReport,
    getWeekNumber,
  };

})();
