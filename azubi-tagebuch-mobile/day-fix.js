/**
 * day-fix.js
 * Implementiert die Tag-Ansicht-Funktionalität
 * 
 * Problem: Tag-Ansicht ist leer nach Klick auf Kalendertag
 * Lösung: Lädt und speichert Tageseinträge
 */

(function() {
  'use strict';

  console.log('[Day Fix] Initializing day view functionality...');

  // Globales Day-Objekt
  window.dayFix = {
    currentDate: null,
    
    /**
     * Initialisiert die Tag-Ansicht
     */
    init: function() {
      console.log('[Day Fix] Init called');
      
      // Event-Listener für Speichern-Button
      const saveBtn = document.getElementById('btnSaveDay');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.saveDay();
        });
      }
      
      // Event-Listener für Leeren-Button
      const clearBtn = document.getElementById('btnClearDay');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.clearDay();
        });
      }
      
      // Event-Listener für Stress-Slider
      const stressSlider = document.getElementById('dayStress');
      const stressPill = document.getElementById('stressPill');
      if (stressSlider && stressPill) {
        stressSlider.addEventListener('input', (e) => {
          stressPill.textContent = e.target.value;
        });
      }
      
      // Beim Wechsel zum Tag-Tab laden
      document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('button[data-tab="tag"], .tab');
        if (tabBtn && tabBtn.textContent.toLowerCase().includes('tag')) {
          setTimeout(() => {
            this.loadDay();
          }, 100);
        }
      });
      
      console.log('[Day Fix] Day view initialized successfully');
    },
    
    /**
     * Lädt den aktuellen Tag
     */
    loadDay: function() {
      try {
        const storeKey = 'azubi_tagebuch_v3';
        const data = localStorage.getItem(storeKey);
        
        if (!data) {
          console.log('[Day Fix] No data found, using today');
          this.currentDate = this.formatDateKey(new Date());
          this.updateDateField();
          return;
        }
        
        const store = JSON.parse(data);
        
        // Ausgewähltes Datum aus Store oder heute
        this.currentDate = store.selectedDate || this.formatDateKey(new Date());
        
        console.log('[Day Fix] Loading day:', this.currentDate);
        
        // Datum-Feld aktualisieren
        this.updateDateField();
        
        // Gespeicherte Daten laden
        const year = store.yearActive || '1';
        const yearData = store.years && store.years[year];
        
        if (!yearData || !yearData.days || !yearData.days[this.currentDate]) {
          console.log('[Day Fix] No entry for this day');
          this.clearFields();
          return;
        }
        
        const dayData = yearData.days[this.currentDate];
        
        // Felder füllen
        this.setFieldValue('dayShift', dayData.shift || 'frueh');
        this.setFieldValue('dayStation', dayData.station || '');
        this.setFieldValue('dayTask', dayData.task || '');
        this.setFieldValue('dayLearningGoal', dayData.learningGoal || '');
        this.setFieldValue('dayLearned', dayData.learned || '');
        this.setFieldValue('dayStandard', dayData.standard || '');
        this.setFieldValue('dayStress', dayData.stress || '5');
        this.setFieldValue('dayWentWell', dayData.wentWell || '');
        this.setFieldValue('dayToImprove', dayData.toImprove || '');
        this.setFieldValue('dayFreeNotes', dayData.freeNotes || '');
        
        // Stress-Pill aktualisieren
        const stressPill = document.getElementById('stressPill');
        if (stressPill) {
          stressPill.textContent = dayData.stress || '5';
        }
        
        console.log('[Day Fix] Day loaded successfully');
        
      } catch (e) {
        console.error('[Day Fix] Error loading day:', e);
      }
    },
    
    /**
     * Speichert den aktuellen Tag
     */
    saveDay: function() {
      try {
        const storeKey = 'azubi_tagebuch_v3';
        const data = localStorage.getItem(storeKey);
        let store = data ? JSON.parse(data) : { version: 3, years: {} };
        
        // Sicherstellen dass currentDate gesetzt ist
        if (!this.currentDate) {
          this.currentDate = this.formatDateKey(new Date());
        }
        
        const year = store.yearActive || '1';
        
        // Jahre-Struktur initialisieren
        if (!store.years) store.years = {};
        if (!store.years[year]) store.years[year] = { days: {} };
        if (!store.years[year].days) store.years[year].days = {};
        
        // Daten sammeln
        const dayData = {
          date: this.currentDate,
          shift: this.getFieldValue('dayShift'),
          station: this.getFieldValue('dayStation'),
          task: this.getFieldValue('dayTask'),
          learningGoal: this.getFieldValue('dayLearningGoal'),
          learned: this.getFieldValue('dayLearned'),
          standard: this.getFieldValue('dayStandard'),
          stress: this.getFieldValue('dayStress'),
          wentWell: this.getFieldValue('dayWentWell'),
          toImprove: this.getFieldValue('dayToImprove'),
          freeNotes: this.getFieldValue('dayFreeNotes'),
          updatedAt: new Date().toISOString()
        };
        
        // Speichern
        store.years[year].days[this.currentDate] = dayData;
        store.updatedAt = new Date().toISOString();
        
        localStorage.setItem(storeKey, JSON.stringify(store));
        
        console.log('[Day Fix] Day saved:', this.currentDate);
        
        // Toast-Benachrichtigung
        if (typeof showToast === 'function') {
          showToast(`Tages-Eintrag gespeichert! ✓`);
        }
        
        // Kalender neu rendern (markiert Tag)
        if (window.calendarFix && typeof window.calendarFix.render === 'function') {
          window.calendarFix.render();
        }
        
      } catch (e) {
        console.error('[Day Fix] Error saving day:', e);
        if (typeof showToast === 'function') {
          showToast('Fehler beim Speichern!');
        }
      }
    },
    
    /**
     * Leert alle Felder
     */
    clearDay: function() {
      if (!confirm('Wirklich alle Felder leeren?')) {
        return;
      }
      
      this.clearFields();
      
      if (typeof showToast === 'function') {
        showToast('Felder geleert');
      }
    },
    
    /**
     * Leert alle Eingabefelder
     */
    clearFields: function() {
      this.setFieldValue('dayShift', 'frueh');
      this.setFieldValue('dayStation', '');
      this.setFieldValue('dayTask', '');
      this.setFieldValue('dayLearningGoal', '');
      this.setFieldValue('dayLearned', '');
      this.setFieldValue('dayStandard', '');
      this.setFieldValue('dayStress', '5');
      this.setFieldValue('dayWentWell', '');
      this.setFieldValue('dayToImprove', '');
      this.setFieldValue('dayFreeNotes', '');
      
      const stressPill = document.getElementById('stressPill');
      if (stressPill) {
        stressPill.textContent = '5';
      }
    },
    
    /**
     * Aktualisiert das Datum-Feld
     */
    updateDateField: function() {
      const dateField = document.getElementById('dayDate');
      if (dateField && this.currentDate) {
        dateField.value = this.currentDate;
      }
    },
    
    /**
     * Holt Feldwert
     */
    getFieldValue: function(id) {
      const field = document.getElementById(id);
      return field ? field.value : '';
    },
    
    /**
     * Setzt Feldwert
     */
    setFieldValue: function(id, value) {
      const field = document.getElementById(id);
      if (field) {
        field.value = value;
      }
    },
    
    /**
     * Formatiert Datum als Key (YYYY-MM-DD)
     */
    formatDateKey: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };
  
  // Initialisierung nach DOM-Load
  function initDay() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.dayFix.init();
      });
    } else {
      window.dayFix.init();
    }
  }
  
  initDay();
  
})();
