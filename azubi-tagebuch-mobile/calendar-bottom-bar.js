/* ============================================================================
   KALENDER-BOTTOM-BAR JAVASCRIPT
   Version 7.0 - Kalender-Schnellzugriff
   ============================================================================ */

(function() {
  'use strict';
  
  // Nur auf Mobile ausführen
  if (window.innerWidth > 820) {
    return;
  }
  
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const weekdayShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  
  // DOM-Elemente
  const calBottomMonth = document.getElementById('calBottomMonth');
  const calBottomGrid = document.getElementById('calBottomGrid');
  const calBottomPrev = document.getElementById('calBottomPrev');
  const calBottomNext = document.getElementById('calBottomNext');
  const calBottomToday = document.getElementById('calBottomToday');
  const calBottomOpen = document.getElementById('calBottomOpen');
  
  if (!calBottomGrid) {
    console.warn('Kalender-Bottom-Bar: Grid-Element nicht gefunden');
    return;
  }
  
  // Kalender rendern
  function renderCalendar(month, year) {
    calBottomGrid.innerHTML = '';
    
    // Monatstitel aktualisieren
    if (calBottomMonth) {
      calBottomMonth.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Vorheriger Monat (ausgegraut)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dayEl = createDayElement(day, true, false);
      calBottomGrid.appendChild(dayEl);
    }
    
    // Aktueller Monat
    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const hasEntry = checkIfHasEntry(year, month, day);
      const dayEl = createDayElement(day, false, isToday, hasEntry, year, month);
      calBottomGrid.appendChild(dayEl);
    }
    
    // Nächster Monat (ausgegraut)
    const totalCells = calBottomGrid.children.length;
    const remainingCells = 35 - totalCells; // 5 Wochen = 35 Zellen
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = createDayElement(day, true, false);
      calBottomGrid.appendChild(dayEl);
    }
  }
  
  // Tag-Element erstellen
  function createDayElement(day, isOtherMonth, isToday, hasEntry, year, month) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-mini-day';
    
    if (isOtherMonth) {
      dayEl.classList.add('is-other-month');
    }
    
    if (isToday) {
      dayEl.classList.add('is-today');
    }
    
    if (hasEntry) {
      dayEl.classList.add('has-entry');
    }
    
    // Wochentag ermitteln
    let weekday = '';
    if (!isOtherMonth && year !== undefined && month !== undefined) {
      const date = new Date(year, month, day);
      weekday = weekdayShort[date.getDay()];
    }
    
    dayEl.innerHTML = `
      ${weekday ? `<div class="calendar-mini-day__weekday">${weekday}</div>` : ''}
      <div class="calendar-mini-day__date">${day}</div>
    `;
    
    // Click-Handler
    if (!isOtherMonth) {
      dayEl.addEventListener('click', () => {
        handleDayClick(year, month, day);
      });
    }
    
    return dayEl;
  }
  
  // Prüfen ob Tag einen Eintrag hat
  function checkIfHasEntry(year, month, day) {
    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entries = JSON.parse(localStorage.getItem('dayEntries') || '{}');
      return entries[dateStr] && entries[dateStr].notes;
    } catch (e) {
      return false;
    }
  }
  
  // Tag-Click-Handler
  function handleDayClick(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Datum in Quick-Date-Field setzen (Start-Panel)
    const quickDateField = document.getElementById('quickDate');
    if (quickDateField) {
      quickDateField.value = dateStr;
    }
    
    // Zur Tag-Ansicht wechseln
    const dayTab = document.querySelector('[data-tab="day"]');
    if (dayTab) {
      dayTab.click();
    }
    
    // Toast-Nachricht
    showToast(`📅 ${day}. ${monthNames[month]} ${year}`);
  }
  
  // Toast-Nachricht anzeigen
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('is-on');
      setTimeout(() => {
        toast.classList.remove('is-on');
      }, 2000);
    }
  }
  
  // Event-Listener
  if (calBottomPrev) {
    calBottomPrev.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }
  
  if (calBottomNext) {
    calBottomNext.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
  }
  
  if (calBottomToday) {
    calBottomToday.addEventListener('click', () => {
      const today = new Date();
      currentMonth = today.getMonth();
      currentYear = today.getFullYear();
      renderCalendar(currentMonth, currentYear);
      showToast('📅 Heute');
    });
  }
  
  if (calBottomOpen) {
    calBottomOpen.addEventListener('click', () => {
      const calendarTab = document.querySelector('[data-tab="calendar"]');
      if (calendarTab) {
        calendarTab.click();
      }
    });
  }
  
  // Initial rendern
  renderCalendar(currentMonth, currentYear);
  
  // Bei Resize prüfen ob Mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) {
      const calBottomBar = document.querySelector('.calendar-bottom-bar');
      if (calBottomBar) {
        calBottomBar.style.display = 'none';
      }
    } else {
      const calBottomBar = document.querySelector('.calendar-bottom-bar');
      if (calBottomBar) {
        calBottomBar.style.display = 'block';
      }
    }
  });
  
  console.log('✅ Kalender-Bottom-Bar initialisiert');
})();
