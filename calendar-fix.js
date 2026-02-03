/**
 * calendar-fix.js
 * Behebt das Kalender-Rendering-Problem
 * 
 * Problem: Der Kalender zeigt keine Tage an, weil die Rendering-Funktion fehlt
 * Lösung: Implementiert vollständige Kalender-Funktionalität
 */

(function() {
  'use strict';

  console.log('[Calendar Fix] Initializing calendar rendering...');

  // Globales Calendar-Objekt
  window.calendarFix = {
    currentDate: new Date(),
    currentYear: 1,
    markedDays: new Set(),
    
    /**
     * Initialisiert den Kalender
     */
    init: function() {
      console.log('[Calendar Fix] Init called');
      
      // Event-Listener für Navigation
      const prevBtn = document.getElementById('btnCalPrev');
      const nextBtn = document.getElementById('btnCalNext');
      const todayBtn = document.getElementById('btnCalToday');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.previousMonth();
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.nextMonth();
        });
      }
      
      if (todayBtn) {
        todayBtn.addEventListener('click', () => {
          this.goToToday();
        });
      }
      
      // Initialer Render
      this.render();
      
      console.log('[Calendar Fix] Calendar initialized successfully');
    },
    
    /**
     * Lädt markierte Tage aus localStorage
     */
    loadMarkedDays: function() {
      try {
        const storeKey = 'azubi_tagebuch_v3';
        const data = localStorage.getItem(storeKey);
        if (!data) return;
        
        const store = JSON.parse(data);
        const year = store.yearActive || '1';
        const yearData = store.years && store.years[year];
        
        if (!yearData || !yearData.days) return;
        
        this.markedDays.clear();
        
        // Alle Tage mit Einträgen markieren
        Object.keys(yearData.days).forEach(dateKey => {
          const dayData = yearData.days[dateKey];
          if (dayData && (dayData.text || dayData.checks)) {
            this.markedDays.add(dateKey);
          }
        });
        
      } catch (e) {
        console.error('[Calendar Fix] Error loading marked days:', e);
      }
    },
    
    /**
     * Rendert den Kalender
     */
    render: function() {
      const grid = document.getElementById('calendarGrid');
      if (!grid) {
        console.warn('[Calendar Fix] Calendar grid not found');
        return;
      }
      
      // Markierte Tage laden
      this.loadMarkedDays();
      
      // Grid leeren
      grid.innerHTML = '';
      
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      // Ersten Tag des Monats
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Wochentag des ersten Tags (0 = Sonntag, 1 = Montag, ...)
      let firstWeekday = firstDay.getDay();
      // Umrechnen: Montag = 0, Sonntag = 6
      firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;
      
      // Leere Zellen am Anfang
      for (let i = 0; i < firstWeekday; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calDay calDay--empty';
        grid.appendChild(emptyCell);
      }
      
      // Tage des Monats
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDate = new Date(year, month, day);
        const dateKey = this.formatDateKey(dayDate);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'calDay';
        dayCell.textContent = day;
        dayCell.dataset.date = dateKey;
        
        // Markierung für Tage mit Einträgen
        if (this.markedDays.has(dateKey)) {
          dayCell.classList.add('is-marked');
        }
        
        // Heute hervorheben
        const today = new Date();
        if (
          dayDate.getDate() === today.getDate() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getFullYear() === today.getFullYear()
        ) {
          dayCell.classList.add('is-today');
        }
        
        // Click-Handler
        dayCell.addEventListener('click', () => {
          this.selectDay(dateKey);
        });
        
        grid.appendChild(dayCell);
      }
      
      console.log(`[Calendar Fix] Rendered ${lastDay.getDate()} days for ${year}-${month + 1}`);
    },
    
    /**
     * Formatiert Datum als Key (YYYY-MM-DD)
     */
    formatDateKey: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    /**
     * Wählt einen Tag aus und wechselt zum Tag-Tab
     */
    selectDay: function(dateKey) {
      console.log('[Calendar Fix] Day selected:', dateKey);
      
      // Datum im Store speichern
      try {
        const storeKey = 'azubi_tagebuch_v3';
        const data = localStorage.getItem(storeKey);
        let store = data ? JSON.parse(data) : { version: 3, years: {} };
        
        store.selectedDate = dateKey;
        store.updatedAt = new Date().toISOString();
        
        localStorage.setItem(storeKey, JSON.stringify(store));
        
        // Zum Tag-Tab wechseln
        if (typeof setTab === 'function') {
          setTab('tag');
        } else {
          console.warn('[Calendar Fix] setTab function not found');
        }
        
        // Toast-Benachrichtigung
        if (typeof showToast === 'function') {
          showToast(`Tag ausgewählt: ${dateKey}`);
        }
        
      } catch (e) {
        console.error('[Calendar Fix] Error selecting day:', e);
      }
    },
    
    /**
     * Vorheriger Monat
     */
    previousMonth: function() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    },
    
    /**
     * Nächster Monat
     */
    nextMonth: function() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    },
    
    /**
     * Zu heute springen
     */
    goToToday: function() {
      this.currentDate = new Date();
      this.render();
    }
  };
  
  // Initialisierung nach DOM-Load
  function initCalendar() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.calendarFix.init();
      });
    } else {
      window.calendarFix.init();
    }
  }
  
  initCalendar();
  
  // Re-render wenn Kalender-Tab aktiviert wird
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('button[data-tab="kalender"], .tab');
    if (tabBtn && tabBtn.textContent.toLowerCase().includes('kalender')) {
      setTimeout(() => {
        if (window.calendarFix) {
          window.calendarFix.render();
        }
      }, 100);
    }
  });
  
})();
