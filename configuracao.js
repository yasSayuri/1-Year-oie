// card do yasmin
const opcoesYasminBase = [
  { key: 'tagarela',    label: 'Tagarela',    locked: false, defaultOn: false },
  { key: 'engracada',   label: 'Engraçada',   locked: false, defaultOn: false },
  { key: 'inteligente', label: 'Inteligente', locked: false, defaultOn: false },
  { key: 'chata',       label: 'Chata',       locked: false, defaultOn: false },
  { key: 'ciumenta',    label: 'Ciumenta',    locked: false, defaultOn: false },
  { key: 'feliz',       label: 'Feliz',       locked: false, defaultOn: false },
  { key: 'paumole',     label: 'Pau mole',    locked: false, defaultOn: false,
    tooltip: 'essa opção tá sendo tratada mentalmente' },
  { key: 'safada',      label: 'Safada',      locked: false, defaultOn: false },
  { key: 'bovo',        label: 'Bovo',        locked: true,  defaultOn: true,
    tooltip: 'essa opção não pode ser desativada' },
];

// card do victor
const opcoesVictorBase = [
  { key: 'feliz',    label: 'Feliz',    locked: false, defaultOn: false },
  { key: 'ranzinza', label: 'Ranzinza', locked: false, defaultOn: false },
  { key: 'melhor-namorado-do-mundo', label: 'Melhor namorado do mundo',
    locked: true, defaultOn: true, tooltip: 'essa opção não pode ser desativada' },
];

// storage
const STORAGE_KEY_Y_STATE   = 'prefsYasmin_state_v1';
const STORAGE_KEY_V_STATE   = 'prefsVictor_state_v1';
const STORAGE_KEY_Y_CUSTOM  = 'prefsYasmin_custom_list_v1';

// utils
function loadJSON(key, fallback){
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : (fallback ?? null); }
  catch{ return fallback ?? null; }
}
function saveJSON(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch{}
}

// toggles
function renderToggles({ gridId, opcoes, storageKey }){
  const grid = document.getElementById(gridId);
  if(!grid) return;

  const state = loadJSON(storageKey, {});
  grid.innerHTML = '';

  opcoes.forEach(opt => {
    const initial = (opt.key in state) ? !!state[opt.key] : !!opt.defaultOn;

    const wrapper = document.createElement('div');
    wrapper.className = 'toggle';

    const left = document.createElement('div');
    left.className = 'label';
    left.textContent = opt.label;

    const id = `sw-${opt.key}`;
    const switchWrap = document.createElement('div');
    switchWrap.className = 'switch';
    if (opt.tooltip) {
      switchWrap.classList.add('has-tooltip');
      switchWrap.setAttribute('data-tooltip', opt.tooltip);
    }

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.className = 'switch-input';
    input.role = 'switch';
    input.checked = initial;
    input.ariaChecked = initial ? 'true' : 'false';
    if (opt.locked) {
      input.disabled = true;
      input.checked = true;
      input.ariaChecked = 'true';
    }

    const label = document.createElement('label');
    label.className = 'switch-label';
    label.setAttribute('for', id);

    const track = document.createElement('span'); track.className = 'track';
    const knob  = document.createElement('span'); knob.className  = 'knob';

    label.appendChild(track);
    label.appendChild(knob);
    switchWrap.appendChild(input);
    switchWrap.appendChild(label);

    wrapper.appendChild(left);
    wrapper.appendChild(switchWrap);

    knob.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (opt.locked) return;
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    input.addEventListener('change', () => {
      if (opt.locked) {
        input.checked = true;
        input.ariaChecked = 'true';
        return;
      }
      const newState = loadJSON(storageKey, {});
      newState[opt.key] = input.checked;
      saveJSON(storageKey, newState);
      input.ariaChecked = input.checked ? 'true' : 'false';
    });

    grid.appendChild(wrapper);
  });

  const ensured = loadJSON(storageKey, {});
  opcoes.forEach(o => { if(o.locked) ensured[o.key] = true; });
  saveJSON(storageKey, ensured);
}

// personalização + modal
function setupPersonalizacao(){
  const input   = document.getElementById('traitInput');
  const addBtn  = document.getElementById('traitAdd');
  const btnOpen = document.getElementById('openUpdates');

  // modal sem backdrop
  const modal     = document.getElementById('updatesModal');   // <div class="ymodal">
  const modalCard = modal.querySelector('.ymodal-card');       // card interno
  const modalClose= modal.querySelector('.ymodal-close');      // botão X
  const list      = document.getElementById('customList');

  function renderList(){
    const items = loadJSON(STORAGE_KEY_Y_CUSTOM, []);
    list.innerHTML = '';
    if(!items.length){
      const p = document.createElement('p');
      p.className = 'muted small';
      p.textContent = 'Nada adicionado ainda.';
      list.appendChild(p);
      return;
    }
    items.forEach((txt, idx) => {
      const li = document.createElement('div');
      li.className = 'custom-item';

      const dot  = document.createElement('span'); dot.className  = 'custom-dot';
      const span = document.createElement('span'); span.className = 'custom-text'; span.textContent = txt;

      const btn  = document.createElement('button');
      btn.className = 'custom-remove';
      btn.title = 'Remover';
      btn.innerHTML = '<span class="material-icons" aria-hidden="true">close</span>';

      btn.addEventListener('click', () => {
        const arr = loadJSON(STORAGE_KEY_Y_CUSTOM, []);
        arr.splice(idx, 1);
        saveJSON(STORAGE_KEY_Y_CUSTOM, arr);
        renderList();
      });

      li.appendChild(dot);
      li.appendChild(span);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function addTrait(){
    const label = (input.value || '').trim();
    if(!label) return;
    const items = loadJSON(STORAGE_KEY_Y_CUSTOM, []);
    items.push(label);
    saveJSON(STORAGE_KEY_Y_CUSTOM, items);
    input.value = '';
  }

  function openModal(){
    renderList();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  addBtn.addEventListener('click', addTrait);
  input.addEventListener('keydown', (e) => { if(e.key === 'Enter') addTrait(); });

  btnOpen.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

  // fecha ao clicar fora do card (o overlay é o próprio .ymodal, transparente)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderToggles({ gridId: 'prefsGrid',   opcoes: opcoesYasminBase, storageKey: STORAGE_KEY_Y_STATE });
  renderToggles({ gridId: 'prefsVictor', opcoes: opcoesVictorBase, storageKey: STORAGE_KEY_V_STATE });
  setupPersonalizacao();
  bindYTooltips();
});


(function(){
  let tipEl = null, currentAnchor = null, raf = 0;

  function ensureTip(){
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'ytip';
    document.body.appendChild(tipEl);
    return tipEl;
  }

  function placeTip(anchor, pref = 'top'){
    if (!tipEl || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const pad = 8;

    // posição padrão: acima, alinhada à direita do switch
    let top  = r.top - tipEl.offsetHeight - pad;
    let left = r.right - tipEl.offsetWidth;

    // fallback se sair da viewport
    if (top < 0) top = r.bottom + pad;                  // põe embaixo
    if (left < 0) left = pad;                           // cola na esquerda
    const maxLeft = window.innerWidth - tipEl.offsetWidth - pad;
    if (left > maxLeft) left = maxLeft;

    tipEl.style.top  = `${Math.max(0, top)}px`;
    tipEl.style.left = `${Math.max(pad, left)}px`;
  }

  function showTipFor(el){
    const text = el.getAttribute('data-tooltip');
    if (!text) return;
    const tip = ensureTip();
    tip.textContent = text;
    tip.classList.add('show');
    currentAnchor = el;

    // mede depois de render
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => placeTip(el));
  }

  function hideTip(){
    currentAnchor = null;
    if (tipEl) tipEl.classList.remove('show');
  }

  // reposiciona em scroll/resize
  function onReflow(){
    if (currentAnchor && tipEl?.classList.contains('show')) placeTip(currentAnchor);
  }
  window.addEventListener('scroll', onReflow, true);
  window.addEventListener('resize', onReflow);

  // API para (re)ligar eventos após render dinâmico
  window.bindYTooltips = function(root = document){
    const nodes = root.querySelectorAll('.has-tooltip[data-tooltip]');
    nodes.forEach(el => {
      if (el.dataset.ytipBound) return;
      el.dataset.ytipBound = '1';
      el.addEventListener('mouseenter', () => showTipFor(el));
      el.addEventListener('mouseleave', hideTip);
      el.addEventListener('blur', hideTip, true);
      el.addEventListener('focus', () => showTipFor(el), true);
    });
  };
})();

