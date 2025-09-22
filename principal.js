window.addEventListener('DOMContentLoaded', () => {
  /* ===== Gráfico de Pizza: Dinheiro gasto neste namoro ===== */
  const pieCanvas = document.getElementById('pieChart');
  if (pieCanvas) {
    const valores = [68, 22, 10, 0]; // Lanche, Docinhos, Pizzas, Camisinhas
    const labels = ['Lanche', 'Docinhos', 'Pizzas ', 'Camisinha'];
    const cores  = ['#a78bfa', '#f9a8d4', '#c084fc', '#e9d5ff'];
    const total  = valores.reduce((a,b)=>a+b,0);

    new Chart(pieCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels,
            datasets: [{
            data: valores,
            backgroundColor: cores,
            borderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue('--glass').trim() || 'rgba(255,255,255,.55)',
            borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 4 },
            plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 12,
                boxHeight: 12,
                padding: 14,
                font: { size: 12 },
                generateLabels(chart) {
                    const ds = chart.data.datasets[0];
                    const base = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                    const tot = ds.data.reduce((a,b)=>a+(+b||0),0);
                    return chart.data.labels.map((label, i) => {
                    const v = ds.data[i] || 0;
                    const pct = tot ? Math.round((v/tot)*100) : 0;
                    return {
                        ...base[i],
                        text: `${label} — ${pct}%`,
                        fillStyle: ds.backgroundColor[i], // mesma cor da fatia
                        strokeStyle: '#ffffff',           // borda branca na bolinha
                        lineWidth: 2
                    };
                    });
                }
                }
            },
            tooltip: {
                callbacks: {
                label(ctx) {
                    const v = ctx.parsed || 0;
                    const tot = valores.reduce((a,b)=>a+b,0);
                    const pct = tot ? ((v/tot)*100).toFixed(1) : '0.0';
                    return `${ctx.label}: ${v} (${pct}%)`;
                }
                }
            }
            }
        }
        });

  }
});

/* ===== Gráfico de linhas: Humor Victor vs Humor Yasmin ===== */
const lineCanvas = document.getElementById('lineChart');
if (lineCanvas) {
  const ctx = lineCanvas.getContext('2d');

  // Gradientes
  const g1 = ctx.createLinearGradient(0,0,0,260);
  g1.addColorStop(0, 'rgba(124,58,237,0.6)');
  g1.addColorStop(1, 'rgba(124,58,237,0.05)');

  const g2 = ctx.createLinearGradient(0,0,0,260);
  g2.addColorStop(0, 'rgba(236,72,153,0.6)');
  g2.addColorStop(1, 'rgba(236,72,153,0.05)');

  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  // Yasmin: sempre FELIZ (linha reta no topo)
  const yasmin = dias.map(d => ({ x: d, y: 'Feliz' }));

  // Victor: varie como quiser abaixo
  const victorHumor = ['Feliz','Bravo','Feliz','Bravo','Feliz','Feliz','Bravo'];
  const victor = dias.map((d, i) => ({ x: d, y: victorHumor[i] }));

  new Chart(lineCanvas, {
    type: 'line',
    data: {
      labels: dias,
      datasets: [
        {
          label: 'Victor',
          data: victor,
          borderColor: '#7c3aed',
          backgroundColor: g1,
          tension: .35,
          pointRadius: 5,
          pointHoverRadius: 6,
          fill: true,
        },
        {
          label: 'Yasmin',
          data: yasmin,
          borderColor: '#ec4899',
          backgroundColor: g2,
          tension: .35,
          pointRadius: 5,
          pointHoverRadius: 6,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          grid: { display: false }
        },
        y: {
          type: 'category',

          labels: ['Bravo','Feliz'],
          grid: { color: '#e9e9f0' }
        }
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label(ctx) {
              const nome = ctx.dataset.label || '';
              const cat = ctx.chart.scales.y.getLabelForValue(ctx.parsed.y);
              return `${nome}: ${cat} (${ctx.label})`;
            }
          }
        }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

// ===== Dates já feitos (To-do) =====
(function(){
  const keyPrefix = 'namoro-todo:';
  const container = document.querySelector('.todo');

  function bindItemEvents(item, key){
    const cb = item.querySelector('input[type="checkbox"]');
    const removeBtn = item.querySelector('.todo-remove');

    const val = localStorage.getItem(key);
    if (val === '1') cb.checked = true;
    item.classList.toggle('done', cb.checked);

    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked ? '1' : '0');
      item.classList.toggle('done', cb.checked);
    });

    removeBtn.addEventListener('click', () => {
      localStorage.removeItem(key);
      item.remove();
    });
  }

  container.querySelectorAll('.todo-item').forEach(item => {
    const cb = item.querySelector('input');
    const key = keyPrefix + cb.dataset.key;
    bindItemEvents(item, key);
  });

  const input = document.getElementById('todoInput');
  const addBtn = document.getElementById('todoAddBtn');
  function addCustomItem(text){
    if(!text) return;
    const item = document.createElement('div');
    item.className = 'todo-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.key = 'custom-' + Date.now();
    const span = document.createElement('span');
    span.textContent = text;
    const btn = document.createElement('button');
    btn.className = 'todo-remove';
    btn.textContent = '×';
    item.append(cb, span, btn);
    container.appendChild(item);

    const key = keyPrefix + cb.dataset.key;
    localStorage.setItem(key, '0');
    bindItemEvents(item, key);
    input.value = '';
  }
  addBtn?.addEventListener('click', () => addCustomItem(input.value.trim()));
  input?.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') addCustomItem(input.value.trim());
  });
})();

// ===== Tempo de Namoro (ao vivo) =====
(function(){
  // Início do namoro: 29/09/2024 00:00 em America/Sao_Paulo (GMT-3)
  // Use a forma Date(ano, mesIndex, dia, hora, min, seg) — mês 0-based (setembro = 8)
  const START = new Date(2024, 8, 29, 0, 0, 0);

  const el = document.getElementById('loveElapsed');
  const hHand = document.getElementById('clkHour');
  const mHand = document.getElementById('clkMin');
  const sHand = document.getElementById('clkSec');

  function plural(n, sing, plur){ return n === 1 ? sing : plur; }

  // calcula “anos completos” pelo calendário, depois o resto em dias/h/m/s
  function diffParts(now){
    // anos completos desde START até agora
    let years = now.getFullYear() - START.getFullYear();
    const anniv = new Date(START);
    anniv.setFullYear(START.getFullYear() + years);
    if (now < anniv) {
      years--;
      anniv.setFullYear(START.getFullYear() + years);
    }
    // restante em ms desde o último “aniversário”
    let ms = now - anniv;
    let sec = Math.floor(ms / 1000);
    const days = Math.floor(sec / 86400); sec -= days * 86400;
    const hours = Math.floor(sec / 3600); sec -= hours * 3600;
    const mins = Math.floor(sec / 60);    sec -= mins * 60;

    return { years, days, hours, mins, sec };
  }

  function format(parts){
    const { years, days, hours, mins, sec } = parts;
    const chunks = [];
    if (years) chunks.push(`${years} ${plural(years,'ano','anos')}`);
    if (days)  chunks.push(`${days} ${plural(days,'dia','dias')}`);
    chunks.push(
      `${hours} ${plural(hours,'hora','horas')}`,
      `${mins} ${plural(mins,'minuto','minutos')}`,
      `${sec} ${plural(sec,'segundo','segundos')}`
    );
    return chunks.join(' ');
  }

  function updateClockHands(now){
    const s = now.getSeconds() + now.getMilliseconds()/1000;
    const m = now.getMinutes() + s/60;
    const h = (now.getHours()%12) + m/60;

    const sAngle = s * 6;             // 360/60
    const mAngle = m * 6;             // 360/60
    const hAngle = h * 30;            // 360/12

    if (hHand) hHand.style.transform = `rotate(${hAngle}deg)`;
    if (mHand) mHand.style.transform = `rotate(${mAngle}deg)`;
    if (sHand) sHand.style.transform = `rotate(${sAngle}deg)`;
  }

  function tick(){
    const now = new Date();
    const parts = diffParts(now);
    if (el) el.textContent = format(parts);
    updateClockHands(now);
  }

  tick();
  setInterval(tick, 1000);
})();

// ===== Modo "ta pesquisando coisa pq?" =====
(function(){
  const input = document.querySelector('.search input');
  const warning = document.getElementById('searchWarning');
  if (!input || !warning) return;

  const sectionsToHide = Array.from(
    document.querySelectorAll('main > section:not(.topbar):not(#searchWarning)')
  );

  function update() {
    const q = input.value.trim();
    if (q.length) {
      sectionsToHide.forEach(s => s.classList.add('hidden'));
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
      sectionsToHide.forEach(s => s.classList.remove('hidden'));
    }
  }

  input.addEventListener('input', update);
})();

// ===== Botão "limpar" do search =====
(function(){
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  if (!input || !clearBtn) return;

  input.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', !input.value.length);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.add('hidden');
    input.dispatchEvent(new Event('input')); // dispara evento pra restaurar cards
  });
})();

// ===== Modal "Add Task" =====
(function(){
  const btn = document.getElementById('topAddBtn');
  const input = document.getElementById('taskInput');
  const overlay = document.getElementById('addTaskModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const taskText = document.getElementById('modalTaskText');

  if(!btn || !overlay) return;

  function openModal(){
    const val = (input?.value || '').trim();
    taskText.textContent = val ? `“${val}”` : '“(sem título)”';
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden','false');
  }
    function closeModal(){
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden','true');
        // limpar a tarefa ao fechar
        if (input) {
            input.value = '';
            // esconder o botão ✖ da task também
            const clearTaskBtn = document.getElementById('clearTask');
            clearTaskBtn?.classList.add('hidden');
        }
    }


  btn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e)=>{
    if(e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal();
  });
})();

// ===== Botão "limpar" do input de task =====
(function(){
  const taskInput = document.getElementById('taskInput');
  const clearTask = document.getElementById('clearTask');
  if (!taskInput || !clearTask) return;

  function toggleBtn(){
    clearTask.classList.toggle('hidden', !taskInput.value.length);
  }

  taskInput.addEventListener('input', toggleBtn);

  clearTask.addEventListener('click', () => {
    taskInput.value = '';
    clearTask.classList.add('hidden');
    taskInput.focus();
  });

  // opcional: ESC limpa também quando o input está focado
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && taskInput.value) {
      taskInput.value = '';
      clearTask.classList.add('hidden');
      e.preventDefault();
    }
  });
})();
