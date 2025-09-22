(function(){
  const storyEl = document.getElementById('story');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn  = document.getElementById('noBtn');
  const modal  = document.getElementById('denyModal');
  const countEl= document.getElementById('count');
  const cancel = document.getElementById('cancelRedirect');

  const lines = [
    'Era uma vez um bovo',
    'Esse bovo não tinha um senso de gps muito bom, e vivia se perdendo',
    'Mas dessa vez, ele se perdeu LEGAL do bbzão dele e está muito triste, sozinha e abandonada',
    'MY SHEIIILLAAA',
    'Seu objetivo é levar o bovo até seu bbzão pra ele ficar felizinho denovo',
    'Será que você consegue?'
  ];

  const speed = 22;
  const pauseLine = 420;
  let typing = true;
  let timer = null;

  function typeText(target, texts){
    target.textContent = '';
    target.classList.add('typing');

    let li = 0, ci = 0;

    function nextChar(){
      if(li >= texts.length){
        typing = false; 
        target.classList.remove('typing');
        return; 
      }
      const line = texts[li];
      if(ci < line.length){
        target.textContent += line.charAt(ci);
        ci++;
        timer = setTimeout(nextChar, speed);
      } else {
        // ✅ quebra de linha real
        target.textContent += (li < texts.length-1 ? '\n' : '');
        li++; 
        ci = 0;
        timer = setTimeout(nextChar, pauseLine);
      }
    }
    nextChar();

    // Pular a digitação
    document.getElementById('stage').addEventListener('click', () => {
      if(!typing) return;
      clearTimeout(timer);
      // ✅ junta com quebras reais
      target.textContent = texts.join('\n');
      target.classList.remove('typing');
      typing = false;
    }, { once: true });
  }

  yesBtn.addEventListener('click', () => {
    window.location.href = 'game.html';
  });

  let countdownId = null;
  noBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    startCountdown();
  });

  cancel.addEventListener('click', () => {
    modal.classList.add('hidden');
    if(countdownId) clearInterval(countdownId);
  });

  function startCountdown(){
    let n = 3; 
    countEl.textContent = n;
    countdownId = setInterval(() => {
      n--; 
      countEl.textContent = n;
      if(n <= 0){
        clearInterval(countdownId);
        redirectBack();
      }
    }, 1000);
  }

function redirectBack(){
  const ref = document.referrer || '';
  const cameFromGame = /(^|\/)game\.html(\?|#|$)/i.test(ref);

  if (cameFromGame) {
    // se a página anterior for game.html, força ir pra principal
    window.location.href = 'principal.html';
    return;
  }

  // caso normal: volta pra origem se existir; senão, principal
  if (ref) {
    window.location.href = ref;
  } else {
    window.location.href = 'principal.html';
  }
}


  typeText(storyEl, lines);
})();
