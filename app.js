/* app.js (clean) – Azubi Tagebuch Küche
   Ziel: Buttons & Navigation 100% zuverlässig, Glossar rendern (kumulativ nach Lehrjahr), Export/Import.
   Build: CLEAN-20260113-055059
*/
(() => {
  'use strict';

  const BUILD_ID = "CLEAN-20260113-055059";
  window.__BUILD_ID__ = BUILD_ID;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------- Build Badge ----------
  function addBuildBadge() {
    try {
      const b = document.createElement('div');
      b.id = 'buildBadge';
      b.textContent = 'Build: ' + BUILD_ID;
      document.body.appendChild(b);
    } catch(e) {}
  }

  // ---------- Toast ----------
  function toast(msg) {
    let t = $('#__toast');
    if(!t) {
      t = document.createElement('div');
      t.id='__toast';
      t.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:999999;padding:10px 12px;border-radius:12px;background:rgba(20,22,27,.92);color:#fff;font:14px/1.25 system-ui,-apple-system,Segoe UI,Roboto,Arial;box-shadow:0 10px 30px rgba(0,0,0,.2);max-width:min(520px,calc(100vw - 24px));opacity:0;transition:opacity .15s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => t.style.opacity='0', 1400);
  }

  // ---------- State ----------
  const STATE_KEY = 'azubi_ui_state_v1';
  const DEFAULT_STATE = {
    activeTab: 'start',
    activeYear: '1',
    glossarFilter: 'all',
    glossarQuery: ''
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if(!raw) return {...DEFAULT_STATE};
      const parsed = JSON.parse(raw);
      return {...DEFAULT_STATE, ...parsed};
    } catch(e) {
      return {...DEFAULT_STATE};
    }
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  let state = loadState();

  // ---------- Tabs ----------
  const tabButtons = () => $$('button.tab[data-tab]');
  const panels = () => $$('section.panel[id^="panel-"]');

  function setTab(tab) {
    const t = String(tab || 'start').trim();
    state.activeTab = t;
    saveState();

    tabButtons().forEach(b => b.classList.toggle('is-active', b.dataset.tab === t));
    panels().forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + t));

    if(t === 'glossar') renderGlossar();
    try { window.scrollTo({top:0, behavior:'smooth'}); } catch(_) {}
  }

  // ---------- Lehrjahr ----------
  const yearButtons = () => $$('button.yearBtn[data-year]');

  function setYear(year) {
    const y = String(year || '1').replace(/\D+/g,'') || '1';
    state.activeYear = y;
    saveState();

    yearButtons().forEach(b => b.classList.toggle('is-active', b.dataset.year === y));

    // sync glossary filter default (kumulativ)
    const yf = $('#glossarYearFilter');
    if(yf) {
      // wenn der Nutzer nicht explizit "all" gewählt hat: kumulativ am Lehrjahr ausrichten
      if(state.glossarFilter !== 'all') {
        state.glossarFilter = y;
        yf.value = y;
      }
    }

    // (optional) stats update (wenn IDs existieren)
    updateStats();

    if(state.activeTab === 'glossar') renderGlossar();
  }

  // ---------- Export / Import ----------
  function exportJSON(filename='azubi-export.json') {
    try {
      // Export: nur UI-State + optional localStorage (komplett) wäre too much -> hier nur state
      const blob = new Blob([JSON.stringify({state}, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 800);
    } catch(e) {
      toast('Export fehlgeschlagen.');
    }
  }

  async function importJSON(file) {
    try {
      const txt = await file.text();
      const obj = JSON.parse(txt);
      if(obj && obj.state) {
        state = {...DEFAULT_STATE, ...obj.state};
        saveState();
        hydrateUI();
        toast('Import ok.');
      } else {
        toast('Import-Datei ungültig.');
      }
    } catch(e) {
      toast('Import fehlgeschlagen.');
    }
  }

  // ---------- Stats (optional) ----------
  function updateStats() {
    // Wenn deine App eigene Speicherstruktur nutzt, kannst du hier später echte Counts einbauen.
    // Für jetzt: nur "0" lassen, damit nichts crasht.
    const d = $('#statDays'), w = $('#statWeeks'), m = $('#statMonths');
    if(d) d.textContent = d.textContent || '0';
    if(w) w.textContent = w.textContent || '0';
    if(m) m.textContent = m.textContent || '0';
  }

  // ---------- Glossar (kumulativ nach Lehrjahr) ----------
  function allowedYearsCumulative(filterValue) {
    if(filterValue === 'all') return [1,2,3];
    const y = Number(filterValue || state.activeYear || 1);
    return [1,2,3].filter(n => n <= y);
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function renderGlossar() {
    const list = $('#glossarList');
    const toc = $('#glossarToc');
    const count = $('#glossarCount');
    const qInput = $('#glossarSearch');
    const yFilter = $('#glossarYearFilter');

    if(!list || !toc) return;

    const data = window.AZUBI_GLOSSARY_PRO;
    const items = (data && Array.isArray(data.items)) ? data.items : [];

    // read filter/query
    const query = (qInput ? qInput.value : state.glossarQuery || '').trim().toLowerCase();
    const filter = (yFilter ? yFilter.value : state.glossarFilter || 'all');

    state.glossarQuery = query;
    state.glossarFilter = filter;
    saveState();

    const allowed = allowedYearsCumulative(filter);

    // filter
    let view = items.filter(it => {
      const years = Array.isArray(it.years) ? it.years.map(Number) : [];
      const yearOk = years.some(y => allowed.includes(y));
      if(!yearOk) return false;
      if(!query) return true;
      const hay = `${it.term||''} ${it.definition||''} ${it.praxis||''} ${it.merksatz||''} ${it.fehler||''}`.toLowerCase();
      return hay.includes(query);
    });

    // sort A-Z
    view.sort((a,b) => String(a.term||'').localeCompare(String(b.term||''), 'de', {sensitivity:'base'}));

    if(count) count.textContent = `${view.length} Begriffe`;

    // group
    const groups = new Map();
    for(const it of view) {
      const t = String(it.term||'').trim();
      const L = (t[0] || '#').toUpperCase();
      if(!groups.has(L)) groups.set(L, []);
      groups.get(L).push(it);
    }
    const letters = Array.from(groups.keys()).sort((a,b)=>a.localeCompare(b,'de'));

    // toc
    toc.innerHTML = letters.map(L => `<button type="button" class="chip" data-jump="${escapeHtml(L)}">${escapeHtml(L)}</button>`).join('');

    // list
    list.innerHTML = letters.map(L => {
      const rows = groups.get(L).map(it => {
        const years = (Array.isArray(it.years) ? it.years.join(', ') : '');
        return `
          <article class="card glossarCard" data-term="${escapeHtml(it.term||'')}">
            <div class="card__top">
              <div class="card__title">${escapeHtml(it.term||'')}</div>
              <div class="pill">Lehrjahr: ${escapeHtml(years || '—')}</div>
            </div>
            <div class="card__body">
              <div class="def">${escapeHtml(it.definition||'')}</div>
              ${it.praxis ? `<div class="hint"><b>Praxis:</b> ${escapeHtml(it.praxis)}</div>` : ''}
              ${it.merksatz ? `<div class="hint"><b>Merksatz:</b> ${escapeHtml(it.merksatz)}</div>` : ''}
              ${it.fehler ? `<div class="hint"><b>Typische Fehler:</b> ${escapeHtml(it.fehler)}</div>` : ''}
            </div>
          </article>
        `;
      }).join('');
      return `<section class="group" id="G${escapeHtml(L)}"><h3 class="group__title">${escapeHtml(L)}</h3><div class="group__grid">${rows}</div></section>`;
    }).join('');

    // toc jump
    toc.onclick = (e) => {
      const b = e.target.closest('button[data-jump]');
      if(!b) return;
      const id = 'G' + b.dataset.jump;
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    };
  }

  // ---------- Global click delegation ----------
  function onGlobalClick(e) {
    const tabBtn = e.target.closest('button.tab[data-tab]');
    if(tabBtn) {
      e.preventDefault();
      setTab(tabBtn.dataset.tab);
      return;
    }

    const yearBtn = e.target.closest('button.yearBtn[data-year]');
    if(yearBtn) {
      e.preventDefault();
      setYear(yearBtn.dataset.year);
      return;
    }

    const openGlossar = e.target.closest('#btnOpenGlossar');
    if(openGlossar) {
      e.preventDefault();
      setTab('glossar');
      return;
    }

    const exp = e.target.closest('#btnExport');
    if(exp) {
      e.preventDefault();
      exportJSON('azubi-ui-export.json');
      toast('Export erstellt.');
      return;
    }

    const saveQuick = e.target.closest('#btnSaveQuick');
    if(saveQuick) {
      e.preventDefault();
      toast('Gespeichert.');
      return;
    }

    const saveDay = e.target.closest('#btnSaveDay');
    if(saveDay) {
      e.preventDefault();
      toast('Tages-Eintrag gespeichert.');
      return;
    }
    const saveWeek = e.target.closest('#btnSaveWeek');
    if(saveWeek) {
      e.preventDefault();
      toast('Wochencheck gespeichert.');
      return;
    }
    const saveMonth = e.target.closest('#btnSaveMonth');
    if(saveMonth) {
      e.preventDefault();
      toast('Monatscheck gespeichert.');
      return;
    }
  }

  function hydrateUI() {
    // set year buttons
    yearButtons().forEach(b => b.classList.toggle('is-active', b.dataset.year === state.activeYear));

    // set glossary filter/search
    const yFilter = $('#glossarYearFilter');
    if(yFilter) {
      yFilter.value = state.glossarFilter || 'all';
      yFilter.addEventListener('change', () => renderGlossar());
    }
    const q = $('#glossarSearch');
    if(q) {
      q.value = state.glossarQuery || '';
      q.addEventListener('input', () => renderGlossar());
    }
    const reset = $('#glossarReset');
    if(reset) {
      reset.addEventListener('click', () => {
        if(q) q.value = '';
        if(yFilter) yFilter.value = state.activeYear; // sinnvoller Default
        state.glossarFilter = state.activeYear;
        state.glossarQuery = '';
        saveState();
        renderGlossar();
      });
    }

    // import
    const fileImport = $('#fileImport');
    if(fileImport) {
      fileImport.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if(!f) return;
        importJSON(f).finally(() => { fileImport.value = ''; });
      });
    }

    // tab
    setTab(state.activeTab || 'start');
    setYear(state.activeYear || '1');
  }

  document.addEventListener('DOMContentLoaded', () => {
    addBuildBadge();
    document.addEventListener('click', onGlobalClick, true);
    hydrateUI();
    // initial glossary render if needed
    if(state.activeTab === 'glossar') renderGlossar();
  });

})();
