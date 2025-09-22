(function () {
  // origem para "Desisto"/"Sair": usa o que foi salvo no jogo.js, senão referrer, senão index
  const RETURN_TO = sessionStorage.getItem('returnTo') || document.referrer || 'index.html';

  // --- elementos
  const livesEl = document.getElementById('lives');
  const barFill = document.getElementById('barFill');
  const qIndexEl = document.getElementById('qIndex');
  const track = document.getElementById('track');
  const bovo = document.getElementById('bovo');
  const bb = document.getElementById('bb');

  const card = document.getElementById('questionCard');
  const qTitle = document.getElementById('qTitle');
  const qBody = document.getElementById('qBody');
  const answerBtn = document.getElementById('answerBtn');

  const modalGO = document.getElementById('gameOver');
  const retryBtn = document.getElementById('retryBtn');
  const giveupBtn = document.getElementById('giveupBtn');

  const modalWIN = document.getElementById('gameWin');
  const retryWinBtn = document.getElementById('retryWinBtn');
  const exitWinBtn  = document.getElementById('exitWinBtn');

  const toast = document.getElementById('toast');

  // --- helpers para modal GO extra
  function setGameOverExtra(msg) {
    let extra = modalGO.querySelector('#goExtra');
    if (!extra) {
      const p = document.createElement('p');
      p.id = 'goExtra';
      p.className = 'muted small';
      const firstP = modalGO.querySelector('p');
      (firstP?.parentNode || modalGO.querySelector('.modal')).insertBefore(p, firstP.nextSibling);
      extra = p;
    }
    extra.textContent = msg || '';
    if (!msg) extra.remove();
  }

  // --- perguntas oficiais
  const questions = [
    {
      text: 'Como você salva um cartão em um banco de dados?',
      options: ['o cvv', 'os 4 últimos dígitos', 'todos os números + cvv + nome', 'você gera um token'],
      correct: 3,
    },
    {
      text: 'Qual é a sigla usada em CrossFit para descrever o treino do dia?',
      options: ['TOD', 'WOD', 'MOD', 'ROD'],
      correct: 1,
    },
    {
      text: 'Quem é mais twink?',
      options: ['Apelhios', 'hwei', 'ezreal', 'jhin'],
      correct: 1,
    },
    {
      text: 'Quantos corações tem um polvo?',
      options: ['1', '2', '3', '4'],
      correct: 2,
    },
    {
      text: 'Qual é o nome do dragão que concede bônus de dano verdadeiro ao time?',
      options: ['Dragão Infernal', 'Dragão Ancião', 'Dragão das Nuvens', 'Dragão Hextec'],
      correct: 1,
    },
    {
      text: 'De quem vc vai comer o roxo?',
      options: ['rosa', 'sua namorada né', 'Ronaldo', 'da outra'],
      correct: 1,
      instantLoseOn: [0], // marcou "rosa" => perde tudo
    },
    {
      text: 'Você amaria sua namorada se ela fosse uma minhoca?',
      options: ['n', 'não', 'sim', 's'],
      correct: [2, 3], // C e D corretas
    },
    {
      text: 'Se eu ficasse em coma por 30 anos e você arranjasse outra, e eu acordasse, o que você faria?',
      options: [
        'Fingiria que era só minha amiga',
        'Terminava na hora e voltava correndo pra você',
        'Pedia pra você dividir a casa comigo e com ela kkk',
        'Continuava com a outra porque já tava acostumado',
      ],
      correct: 1,
      wrongToastExtra: true, // msg extra se errar
    },
    {
      text: 'Em Hollow Knight onde você encontra os cogumelos que soltam gases quando derrotados?',
      options: ['Greenpath', 'Fungal Wastes', 'Fog Canyon', 'Royal Waterways'],
      correct: 1,
    },
    {
      text: 'O que a Yasmin é pra você?',
      options: ['namorada', 'ficante com rótulo de namorada', 'bovo', 'amante mas ela não sabe'],
      correct: 2,
      instantLoseOn: [3], // marcou D => perde tudo
    },
  ];

  // --- estado
  const TOTAL_QUESTIONS = questions.length;
  let current = 0;
  let lives = 3;
  let progress = 0; // acertos

  // --- UI
  function renderLives() {
    livesEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const div = document.createElement('div');
      div.className = 'life' + (i < (3 - lives) ? ' lost' : '');
      div.innerHTML = `<span class="material-icons">egg</span>`;
      livesEl.appendChild(div);
    }
  }

  function renderQuestion() {
    const q = questions[current];
    qTitle.textContent = q.text;
    qBody.innerHTML = q.options
      .map(
        (opt, idx) => `
          <label class="alt">
            <input type="radio" name="alt" value="${idx}">
            <span>${opt}</span>
          </label>`
      )
      .join('');
    qIndexEl.textContent = String(current + 1);
  }

  function updateProgress() {
    const pct = (progress / TOTAL_QUESTIONS) * 100;
    barFill.style.width = `${pct}%`;

    // mover bovo
    const trackWidth = track.clientWidth;
    const leftPad = 18, rightPad = 18;
    const bovoW = bovo.clientWidth || 84;
    const bbW = bb.clientWidth || 84;
    const maxX = trackWidth - leftPad - rightPad - bovoW - bbW - 16;
    const x = Math.max(0, Math.min(maxX, Math.round((progress / TOTAL_QUESTIONS) * maxX)));
    bovo.style.transform = `translateX(${x}px)`;
  }

  function showToast(text, type = 'info') {
    toast.textContent = text;
    toast.className = `toast show ${type}`;
    setTimeout(() => (toast.className = 'toast'), 1400);
  }

  function gameOver(extraMsg) {
    setGameOverExtra(extraMsg || '');
    modalGO.classList.remove('hidden');
  }

  function win() {
    modalWIN.classList.remove('hidden');
  }

  function redirectBack() {
    window.location.href = RETURN_TO;
  }

  function isCorrect(q, chosen) {
    if (Array.isArray(q.correct)) return q.correct.includes(chosen);
    return chosen === q.correct;
  }

  // --- botão "Responder"
  answerBtn.addEventListener('click', () => {
    const selected = card.querySelector('input[name="alt"]:checked');
    if (!selected) {
      showToast('Selecione uma alternativa', 'info');
      return;
    }
    const chosen = Number(selected.value);
    const q = questions[current];

    // perda instantânea?
    if (Array.isArray(q.instantLoseOn) && q.instantLoseOn.includes(chosen)) {
      lives = 0;
      renderLives();
      gameOver('blz mano, perde ai');
      return;
    }

    if (isCorrect(q, chosen)) {
      progress = Math.min(TOTAL_QUESTIONS, progress + 1);
      showToast('Acertou!', 'good');
      updateProgress();

      if (current < TOTAL_QUESTIONS - 1) {
        current++;
        renderQuestion();
      } else {
        // Vitória
        win();
      }
    } else {
      lives = Math.max(0, lives - 1);
      renderLives();
      const extra = q.wrongToastExtra ? ' e vai se fuder ok' : '';
      showToast('Errou!' + extra, 'bad');
      if (lives <= 0) gameOver();
    }
  });

  // --- ações modais
// --- ações modais
// --- ações modais
retryBtn.addEventListener('click', () => {
  // Jogar novamente -> volta para a introdução
  window.location.href = 'jogo.html';
});

// Desisto -> ir para a tela principal
giveupBtn.addEventListener('click', () => {
  window.location.href = 'principal.html';
});

retryWinBtn.addEventListener('click', () => window.location.href = 'jogo.html');
exitWinBtn .addEventListener('click', () => {
  window.location.href = 'principal.html';
});


  // --- init
  function init() {
    renderLives();
    renderQuestion();
    updateProgress();
  }
  window.addEventListener('load', init);
})();
