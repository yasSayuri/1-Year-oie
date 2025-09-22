document.addEventListener('DOMContentLoaded', () => {
  // ===== Helpers de cor via CSS vars
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.legend.labels.boxWidth = 10;
  Chart.defaults.plugins.legend.labels.boxHeight = 10;

  const css = getComputedStyle(document.documentElement);
  const C = {
    purple: css.getPropertyValue('--purple') || '#7c3aed',
    pink:   css.getPropertyValue('--pink')   || '#ec4899',
    blue:   css.getPropertyValue('--blue')   || '#3b82f6',
    green:  css.getPropertyValue('--green')  || '#10b981',
    orange: css.getPropertyValue('--orange') || '#f59e0b',
    ink:    css.getPropertyValue('--ink')    || '#1f2337',
    muted:  css.getPropertyValue('--muted')  || '#7e8aa3'
  };

  const P = {
    lilac:  '#a78bfa',
    violet: '#c084fc',
    pinkSoft: '#d53d91'
  };
  const GLASS = css.getPropertyValue('--glass')?.trim() || 'rgba(255,255,255,.55)';

  // ===== Ano mostrado e corte de meses futuros
  const YEAR_VIEW = 2025;
  const now = new Date();
  const cutoff = (now.getFullYear() === YEAR_VIEW) ? (now.getMonth() + 1) : 12; // ex.: setembro => 9

  // Labels e dados (12 meses “cheios”)
  const labelsAll = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const dataLosBragasAll = [2,1,3,2,4,3,2,3,4,2,3,5];
  const dataTheBestAll   = [1,2,1,1,2,2,3,1,2,3,2,2];
  const dataOutrosAll    = [1,1,0,2,1,1,1,2,1,1,0,1];
  const loveAll          = Array.from({length: 12}, (_, i) => Math.round(Math.pow(1.2, i)*10)+i*5);

  // Aplica o corte (remove meses futuros)
  const labels        = labelsAll.slice(0, cutoff);
  const dataLosBragas = dataLosBragasAll.slice(0, cutoff);
  const dataTheBest   = dataTheBestAll.slice(0, cutoff);
  const dataOutros    = dataOutrosAll.slice(0, cutoff);
  const dataLol       = new Array(cutoff).fill(0);
  const love          = loveAll.slice(0, cutoff);

  // KPIs (somam só até o mês atual)
  setText('kpiLosBragas', sum(dataLosBragas));
  setText('kpiTheBest',   sum(dataTheBest));
  setText('kpiOutros',    sum(dataOutros));
  // kpiLol = 0, kpiLove = ∞ no HTML

  // ===== Opções comuns
  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: C.muted } },
      y: { grid: { color: 'rgba(0,0,0,.06)' }, ticks: { color: C.muted }, beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: C.ink,
        bodyColor: C.ink,
        borderColor: 'rgba(0,0,0,.08)',
        borderWidth: 1
      }
    }
  };

  // — Los Bragas (barras)
  const losBragasEl = document.getElementById('chartLosBragas');
  if (losBragasEl) {
    new Chart(losBragasEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Idas',
          data: dataLosBragas,
          borderRadius: 10,
          backgroundColor: gradientFactory('chartLosBragas', C.purple, C.pink)
        }]
      },
      options: commonOpts
    });
  }

  // — The Best (barras) — tom mais próximo do seu pie (lilás → roxo)
  const theBestEl = document.getElementById('chartTheBest');
  if (theBestEl) {
    new Chart(theBestEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Idas',
          data: dataTheBest,
          borderRadius: 10,
          backgroundColor: gradientFactory('chartTheBest', '#977dff', C.purple)
        }]
      },
      options: commonOpts
    });
  }

  // — Comparativo (donut) — paleta parecida com o pie do dashboard
  const compCtx = document.getElementById('chartComparativo');
  if (compCtx) {
    const compData = [ sum(dataLosBragas), sum(dataTheBest), Math.max(0, sum(dataOutros)) ];
    const compColors = [P.violet, P.lilac, P.pinkSoft];

    new Chart(compCtx, {
      type: 'doughnut',
      data: {
        labels: ['Los Bragas', 'The Best', 'Outros'],
        datasets: [{
          data: compData,
          backgroundColor: compColors,
          borderColor: GLASS,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        radius: '82%',
        layout: { padding: { bottom: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: C.ink,
            bodyColor: C.ink,
            borderColor: 'rgba(0,0,0,.08)',
            borderWidth: 1
          }
        }
      }
    });

    buildDonutLegend('donutLegend', ['Los Bragas','The Best','Outros'], compColors, compData);
  }

  // — LoL (0 o ano inteiro)
  const lolEl = document.getElementById('chartLol');
  if (lolEl) {
    new Chart(lolEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Partidas Duo',
          data: dataLol,
          borderRadius: 8,
          backgroundColor: '#a3a3a3'
        }]
      },
      options: {
        ...commonOpts,
        scales: {
          x: commonOpts.scales.x,
          y: { ...commonOpts.scales.y, suggestedMax: 1 } // mostra eixo mesmo com 0
        }
      }
    });
  }

  // — Amor infinito (linha/área) — não começa do zero
  const loveEl = document.getElementById('chartLove');
  if (loveEl) {
    const loveMin = Math.min(...love);
    const loveMax = Math.max(...love);
    const padding = Math.max(2, Math.round((loveMax - loveMin) * 0.15)); // folguinha

    new Chart(loveEl, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Amor',
          data: love,
          fill: true,
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.35,
          borderColor: C.pink,
          backgroundColor: gradientFactory('chartLove', 'rgba(236,72,153,.35)', 'rgba(124,58,237,.05)')
        }]
      },
      options: {
        ...commonOpts,
        plugins: { ...commonOpts.plugins, legend: { display:false } },
        scales: {
          x: commonOpts.scales.x,
          y: {
            grid: { color:'rgba(0,0,0,.05)' },
            ticks: { color: C.muted },
            beginAtZero: false,            // <- não parte do zero
            suggestedMin: loveMin - padding
          }
        }
      }
    });
  }

  // ===== Search de cards (filtra pelos títulos dos cards)
  const search = document.getElementById('statsSearch');
  const clearBtn = document.getElementById('statsSearchClear');
  if (search && clearBtn) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      clearBtn.classList.toggle('hidden', q.length === 0);
      document.querySelectorAll('.stat-card').forEach(card => {
        const t = (card.dataset.title || '').toLowerCase();
        card.style.display = t.includes(q) ? '' : 'none';
      });
    });
    clearBtn.addEventListener('click', () => {
      search.value = '';
      search.dispatchEvent(new Event('input'));
    });
  }

  // ===== Utils
  function sum(arr){ return arr.reduce((a,b)=>a+b,0); }
  function setText(id, val){ const el = document.getElementById(id); if (el) el.textContent = val; }

  // Gradiente suave (usa o chartArea pra pegar o tamanho real)
  function gradientFactory(canvasId, from, to){
    return (ctx) => {
      const chart = ctx.chart;
      const {ctx: c, chartArea} = chart;
      if (!chartArea) return from;
      const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, from);
      g.addColorStop(1, to);
      return g;
    };
  }

  // legenda custom para o donut
  function buildDonutLegend(targetId, labels, colors, values){
    const el = document.getElementById(targetId);
    if (!el) return;
    el.innerHTML = labels.map((l, i) => `
      <span class="item">
        <span class="dot" style="background:${colors[i]}"></span>
        ${l} — <strong>${values[i]}</strong>
      </span>
    `).join('');
  }
});
