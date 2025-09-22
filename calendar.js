/* ===========================
   Calendário 2025 — Namoro
   (1 mês por vez + setinhas)
   =========================== */
const PT_MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const PT_WEEKDAYS_MIN = ["D","S","T","Q","Q","S","S"];

const YEAR = 2025;
const STORAGE_KEY = "datingEvents2025";
const DAILY_SEED_KEY = "daily-metidinha-2025"; // identidade fixa do evento diário

/* ====== Estado ====== */
let eventsMap = loadEvents();
let selectedISO = null;
let currentMonth = 0;

/* ==== MIGRAÇÃO + GARANTIA (1x por carga) ==== */
// 1) marca eventos antigos (por título) com seedKey e remove duplicados no mesmo dia
tagAndDedupeDaily(DAILY_SEED_KEY, "Metidinha");
// 2) garante 1 evento por dia com esse seedKey (sem depender do título)
ensureDailyEvent(YEAR, DAILY_SEED_KEY, "Metidinha", "var(--purple)");
saveEvents();


/* ====== DOM ====== */
const monthGrid = document.getElementById("monthGrid");
const monthLabel = document.getElementById("monthLabel");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const dayTitle = document.getElementById("dayTitle");
const daySub = document.getElementById("daySub");
const eventsList = document.getElementById("eventsList");
const addEventBtn = document.getElementById("addEventBtn");

const modal = document.getElementById("eventModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const evtCancel = document.getElementById("evtCancel");
const evtTitle = document.getElementById("evtTitle");
const evtDate = document.getElementById("evtDate");
const evtDesc = document.getElementById("evtDesc");
const eventForm = document.getElementById("eventForm");

const calSearch = document.getElementById("calSearch");
const calSearchClear = document.getElementById("calSearchClear");

/* ====== Inicialização ====== */
initMonthStart();
renderMonthView(YEAR, currentMonth, eventsMap);
updateMonthNavState();
autoSelectTodayIf2025();

/* ====== Navegação (setas) ====== */
prevMonthBtn.addEventListener("click", () => {
  if (currentMonth > 0) {
    currentMonth--;
    renderMonthView(YEAR, currentMonth, eventsMap);
    updateMonthNavState();
    if (selectedISO && parseISO(selectedISO).getMonth() !== currentMonth) {
      clearDaySelection();
    }
  }
});
nextMonthBtn.addEventListener("click", () => {
  if (currentMonth < 11) {
    currentMonth++;
    renderMonthView(YEAR, currentMonth, eventsMap);
    updateMonthNavState();
    if (selectedISO && parseISO(selectedISO).getMonth() !== currentMonth) {
      clearDaySelection();
    }
  }
});

function updateMonthNavState(){
  monthLabel.textContent = `${PT_MONTHS[currentMonth]} ${YEAR}`;
  prevMonthBtn.disabled = (currentMonth === 0);
  nextMonthBtn.disabled = (currentMonth === 11);
}

/* ====== Ações do painel direito ====== */
addEventBtn.addEventListener("click", () => {
  if (!selectedISO) {
    alert("Selecione um dia no calendário antes de adicionar um evento.");
    return;
  }
  evtTitle.value = "";
  evtDesc.value = "";
  evtDate.value = selectedISO;
  openModal();
});

modalCloseBtn?.addEventListener("click", closeModal);
evtCancel?.addEventListener("click", closeModal);

eventForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = evtTitle.value.trim();
  const dateISO = evtDate.value;
  const desc = evtDesc.value.trim();
  if (!title || !dateISO) return;

  addEvent(dateISO, { title, desc });
  saveEvents();
  refreshDayMarkers();
  selectCell(dateISO);
  showDay(dateISO);
  closeModal();
});

/* ====== Busca ====== */
calSearch?.addEventListener("input", () => {
  const q = calSearch.value.trim().toLowerCase();
  calSearchClear.classList.toggle("hidden", q.length === 0);
  filterByQuery(q);
});
calSearchClear?.addEventListener("click", () => {
  calSearch.value = "";
  calSearch.dispatchEvent(new Event("input"));
});

/* ===========================
   Renderização de 1 mês
   =========================== */
function renderMonthView(year, monthIndex, map){
  monthGrid.innerHTML = "";

  const wrapper = document.createElement("section");
  wrapper.className = "month";

  const w = document.createElement("div");
  w.className = "weekdays";
  PT_WEEKDAYS_MIN.forEach(d => {
    const s = document.createElement("div");
    s.textContent = d;
    w.appendChild(s);
  });
  wrapper.appendChild(w);

  const days = document.createElement("div");
  days.className = "days";

  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevLast = new Date(year, monthIndex, 0).getDate();
  const totalCells = 42;
  const todayISO = toISO(new Date());

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day";
    cell.setAttribute("aria-pressed", "false");

    let dayNum, realDate;

    if (i < firstWeekday) {
      dayNum = prevLast - firstWeekday + 1 + i;
      realDate = new Date(year, monthIndex - 1, dayNum);
      cell.classList.add("out");
    } else if (i >= firstWeekday + daysInMonth) {
      dayNum = i - (firstWeekday + daysInMonth) + 1;
      realDate = new Date(year, monthIndex + 1, dayNum);
      cell.classList.add("out");
    } else {
      dayNum = i - firstWeekday + 1;
      realDate = new Date(year, monthIndex, dayNum);
    }

    const iso = toISO(realDate);
    cell.dataset.date = iso;

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(realDate.getDate());
    cell.appendChild(num);

    if (iso === todayISO) cell.classList.add("today");


    if (map[iso]?.length) {
        const dotsWrap = document.createElement("div");
        dotsWrap.className = "markers";
        dotsWrap.title = `${map[iso].length} evento(s)`;

        map[iso].forEach(ev => {
            const dot = document.createElement("span");
            dot.className = "marker";
            dot.style.background = ev.color || "var(--grad-c)";
            dotsWrap.appendChild(dot);
        });

        cell.appendChild(dotsWrap);
    }

    cell.addEventListener("click", () => {
      selectCell(iso);
      showDay(iso);
    });

    days.appendChild(cell);
  }

  wrapper.appendChild(days);
  monthGrid.appendChild(wrapper);

  if (selectedISO && parseISO(selectedISO).getMonth() === monthIndex) {
    selectCell(selectedISO);
  }
}

/* ===========================
   Painel do dia selecionado
   =========================== */
function selectCell(iso) {
  document.querySelectorAll(".day.selected").forEach(el => {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed","false");
  });
  const target = document.querySelector(`.day[data-date="${iso}"]`);
  if (target) {
    target.classList.add("selected");
    target.setAttribute("aria-pressed","true");
    selectedISO = iso;
  }
}

function showDay(iso) {
  const d = parseISO(iso);
  const title = d.toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
  dayTitle.textContent = capitalize(title);
  daySub.textContent = iso;

  const items = eventsMap[iso] ?? [];
  if (!items.length) {
    eventsList.innerHTML = `<li class="muted">Nenhum evento para este dia.</li>`;
    return;
  }

  eventsList.innerHTML = "";
  items.forEach((ev, idx) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
    <div class="event-head" style="display:flex; justify-content:space-between; align-items:center;">
        <h4 class="event-title" style="display:flex; align-items:center; gap:6px;">
        <span class="marker" style="position:static; width:12px; height:12px; background:${ev.color}; border:2px solid #fff;"></span>
        ${escapeHTML(ev.title)}
        </h4>
        <button class="event-remove" data-del="${idx}" aria-label="Remover evento">
        <span class="material-icons">close</span>
        </button>
    </div>
    ${ev.desc ? `<p class="event-desc">${escapeHTML(ev.desc)}</p>` : ""}
    `;
    li.querySelector("[data-del]").addEventListener("click", () => {
      removeEvent(iso, idx);
      saveEvents();
      refreshDayMarkers();
      showDay(iso);
    });
    eventsList.appendChild(li);
  });
}

function clearDaySelection(){
  selectedISO = null;
  dayTitle.textContent = "Selecione um dia";
  daySub.textContent = "";
  eventsList.innerHTML = `<li class="muted">Nenhum dia selecionado.</li>`;
}

/* ===========================
   Busca
   =========================== */
function filterByQuery(q) {
  if (!q) {
    if (selectedISO) showDay(selectedISO);
    else clearDaySelection();
    return;
  }
  dayTitle.textContent = `Resultados da busca`;
  daySub.textContent = `"${q}" em 2025`;

  const results = [];
  Object.entries(eventsMap).forEach(([iso, arr]) => {
    arr.forEach(ev => {
      const inTitle = ev.title.toLowerCase().includes(q);
      const inDesc  = (ev.desc||"").toLowerCase().includes(q);
      if (inTitle || inDesc) results.push({ iso, ...ev });
    });
  });

  if (!results.length) {
    eventsList.innerHTML = `<li class="muted">Nenhum evento encontrado.</li>`;
    return;
  }

  eventsList.innerHTML = "";
  results.sort((a,b)=> a.iso.localeCompare(b.iso)).forEach(ev => {
    const li = document.createElement("li");
    li.className = "event-item";
    const dt = parseISO(ev.iso).toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric"});
    li.innerHTML = `
      <h4 class="event-title">${escapeHTML(ev.title)}</h4>
      <p class="event-desc">${dt}${ev.desc ? " — " + escapeHTML(ev.desc) : ""}</p>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <button class="btn ghost" data-go="${ev.iso}">Ir ao dia</button>
      </div>
    `;
    li.querySelector("[data-go]").addEventListener("click", () => {
      const m = parseISO(ev.iso).getMonth();
      if (m !== currentMonth) {
        currentMonth = m;
        renderMonthView(YEAR, currentMonth, eventsMap);
        updateMonthNavState();
      }
      selectCell(ev.iso);
      showDay(ev.iso);
    });
    eventsList.appendChild(li);
  });
}

/* ===========================
   Persistência
   =========================== */
function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const seed = {
    "2025-06-12": [{ title:"Dia dos Namorados", desc:"Presentes + foto" }],
    "2025-09-29": [{ title:"Aniversário de namoro", desc:"Dar esta surpresa" }],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsMap));
}
function addEvent(iso, ev) {
  if (!eventsMap[iso]) eventsMap[iso] = [];

  const dailyTitle = getDailyTitle().toLowerCase();
  const evTitle = (ev.title || "").toLowerCase();

  if (evTitle === dailyTitle) {
    // vira o diário desse dia
    const already = eventsMap[iso].some(e => e.seedKey === DAILY_SEED_KEY);
    if (!already) {
      ev.seedKey = DAILY_SEED_KEY;
      ev.color = "var(--purple)";
    } else {
      // já existe o diário, só garante cor roxa do novo (ou muda o existente – aqui preferimos só a cor)
      ev.color = ev.color || "var(--purple)";
    }
  } else if (!ev.color) {
    ev.color = randomColor();
  }

  eventsMap[iso].push(ev);
}

function removeEvent(iso, idx) {
  if (!eventsMap[iso]) return;
  eventsMap[iso].splice(idx,1);
  if (eventsMap[iso].length === 0) delete eventsMap[iso];
}

/* ===========================
   Helpers
   =========================== */
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function parseISO(iso) {
  const [y,m,d] = iso.split("-").map(Number);
  return new Date(y, m-1, d);
}
function capitalize(s){
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
function escapeHTML(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function openModal(){ modal.classList.remove("hidden"); modal.setAttribute("aria-hidden","false"); }
function closeModal(){ modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true"); }

function initMonthStart(){
  const now = new Date();
  currentMonth = (now.getFullYear() === YEAR) ? now.getMonth() : 0;
}
function autoSelectTodayIf2025(){
  const now = new Date();
  if (now.getFullYear() !== YEAR) return;
  const iso = toISO(now);
  renderMonthView(YEAR, currentMonth, eventsMap);
  updateMonthNavState();
  const todayCell = document.querySelector(`.day[data-date="${iso}"]`);
  if (todayCell) {
    selectCell(iso);
    showDay(iso);
  }
}
function refreshDayMarkers() {
  renderMonthView(YEAR, currentMonth, eventsMap);
  if (selectedISO && parseISO(selectedISO).getMonth() === currentMonth) {
    selectCell(selectedISO);
  }
}

function ensureEventEveryDay(year, title){
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const iso = toISO(d);
    if (!eventsMap[iso]) eventsMap[iso] = [];
    const has = eventsMap[iso].some(ev => (ev.title || "").toLowerCase() === title.toLowerCase());
    if (!has) {
      eventsMap[iso].push({ title, desc: "", color: "var(--purple)" });
    }
  }
}


function randomColor() {
  const palette = [
    "#7c3aed", 
    "#ec4899", 
    "#10b981", 
    "#f59e0b", 
    "#3b82f6" 
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

function enforcePurpleForMetidinha() {
  Object.keys(eventsMap).forEach(iso => {
    eventsMap[iso].forEach(ev => {
      if ((ev.title || "").toLowerCase() === "metidinha") {
        ev.color = "var(--purple)";
      }
    });
  });
}

function tagAndDedupeDaily(seedKey, legacyTitle){
  const legacy = (legacyTitle || "").toLowerCase();
  Object.keys(eventsMap).forEach(iso => {
    const arr = eventsMap[iso] || [];
    // marca quem não tem seedKey mas é "Metidinha"
    arr.forEach(ev => {
      const t = (ev.title || "").toLowerCase();
      if (!ev.seedKey && t === legacy) {
        ev.seedKey = seedKey;
        ev.color = "var(--purple)";
      }
    });
    // deduplica: mantém só 1 por seedKey naquele dia
    const seen = new Set();
    const cleaned = [];
    for (const ev of arr) {
      if (ev.seedKey === seedKey) {
        if (seen.has(seedKey)) continue; // já tem um, descarta duplicata
        seen.add(seedKey);
        // força cor roxa
        ev.color = "var(--purple)";
      }
      cleaned.push(ev);
    }
    eventsMap[iso] = cleaned;
  });
}

function ensureDailyEvent(year, seedKey, title, color){
  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const iso = toISO(d);
    if (!eventsMap[iso]) eventsMap[iso] = [];
    const has = eventsMap[iso].some(ev => ev.seedKey === seedKey);
    if (!has) {
      eventsMap[iso].push({ seedKey, title, desc:"", color: color || "var(--purple)" });
    }
  }
}

/* pega o título atual do “diário” (depois de renomear) */
function getDailyTitle(){
  for (const arr of Object.values(eventsMap)) {
    const ev = (arr || []).find(e => e.seedKey === DAILY_SEED_KEY);
    if (ev) return ev.title || "Metidinha";
  }
  return "Metidinha";
}

/* renomeia o evento diário SEM recriar nada */
function renameDaily(newTitle){
  const t = (newTitle || "").trim();
  if (!t) return;
  Object.keys(eventsMap).forEach(iso => {
    (eventsMap[iso] || []).forEach(ev => {
      if (ev.seedKey === DAILY_SEED_KEY) {
        ev.title = t;
        ev.color = "var(--purple)"; // continua roxinha
      }
    });
  });
  saveEvents();
  refreshDayMarkers();
  if (selectedISO) showDay(selectedISO);
}

