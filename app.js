(() => {
  const header = document.querySelector(".topbar");
  if (!header) return;

  // Elemente aus deiner bestehenden UI
  const yearBtns = header.querySelectorAll(".yearBtn");
  const exportBtn = document.getElementById("btnExport");

  // Aktuelles Lehrjahr aus UI oder Storage
  const getActiveYear = () => {
    const active = header.querySelector(".yearBtn.is-active");
    return active?.dataset?.year || localStorage.getItem("azubi_year") || "1";
  };

  // Mini-Strip DOM bauen (ohne HTML edit)
  const mini = document.createElement("div");
  mini.className = "miniStrip";
  mini.innerHTML = `
    <div class="miniStrip__left">
      <div class="miniStrip__title">Azubi Tagebuch Küche</div>
      <div class="miniStrip__year" id="miniYear">Lehrjahr ${getActiveYear()}</div>
    </div>
    <div class="miniStrip__right">
      <button class="miniStrip__btn" id="miniShow" type="button">Menü</button>
      <button class="miniStrip__btn miniStrip__btn--primary" id="miniExport" type="button">Export</button>
    </div>
  `;

  // Mini-Strip direkt vor dem Header einfügen (sticky top)
  header.parentNode.insertBefore(mini, header);

  const miniYear = mini.querySelector("#miniYear");
  const btnMiniExport = mini.querySelector("#miniExport");
  const btnMiniShow = mini.querySelector("#miniShow");

  // Mini Export klickt den echten Export Button (wenn vorhanden)
  btnMiniExport.addEventListener("click", () => {
    if (exportBtn) exportBtn.click();
    else alert("Export-Button nicht gefunden (btnExport).");
  });

  // "Menü" zeigt Header kurz an (damit man Tabs/Import etc. erreicht)
  let menuRevealTimer = null;
  btnMiniShow.addEventListener("click", () => {
    header.classList.remove("is-hidden");
    mini.classList.remove("is-on");
    clearTimeout(menuRevealTimer);
    menuRevealTimer = setTimeout(() => {
      // nach kurzer Zeit wieder in Mini-Modus, falls man weiter scrollt
      // (keine erzwungene Hide)
    }, 1200);
  });

  // Lehrjahr-Wechsel sync in Mini-Strip
  yearBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const y = btn.dataset.year;
      localStorage.setItem("azubi_year", y);
      if (miniYear) miniYear.textContent = `Lehrjahr ${y}`;
    });
  });

  // Scroll-Logik: Variante C
  let lastY = window.scrollY;
  let ticking = false;

  const MIN_Y = 60;   // ab wann überhaupt umschalten
  const DELTA = 6;    // Mikro-scroll ignorieren

  function setMini(on){
    if (on) mini.classList.add("is-on");
    else mini.classList.remove("is-on");
  }

  function onScroll() {
    const y = window.scrollY;

    const goingDown = y > lastY + DELTA;
    const goingUp   = y < lastY - DELTA;

    // C: Header verschwindet beim Runterscrollen,
    // Mini-Strip bleibt (Titel + Lehrjahr + Export)
    if (y > MIN_Y && goingDown) {
      header.classList.add("is-hidden");
      setMini(true);
    }

    // Beim Hochscrollen Header wieder zeigen, Mini aus
    if (goingUp || y <= MIN_Y) {
      header.classList.remove("is-hidden");
      setMini(false);
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Initialzustand
  miniYear.textContent = `Lehrjahr ${getActiveYear()}`;
  setMini(false);
})();
