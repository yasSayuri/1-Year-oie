const layer = document.getElementById('hearts');

const COLORS = [
  '#7d4fff',
  '#977dff',
  '#d3c4ff', 
  '#8e7dff', 
  '#2c1976'  
];

const MIN_SIZE = 18;   
const MAX_SIZE = 40;  
const MIN_DUR  = 3.0; 
const MAX_DUR  = 10.0; 
const SPAWN_MS = 280;  

function spawnHeart() {
  const el = document.createElement('span');
  el.className = 'heart';
  el.textContent = '❤';

  const x = Math.random() * 100;         
  el.style.left = `${x}%`;

  const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE);
  el.style.setProperty('--size', `${size}px`);
  const startScale = 1 + Math.random() * 0.4; 
  const endScale   = startScale * 0.6;        
  el.style.setProperty('--startScale', startScale);
  el.style.setProperty('--endScale', endScale);

  const dur = (Math.random() * (MAX_DUR - MIN_DUR) + MIN_DUR).toFixed(2) + 's';
  el.style.setProperty('--dur', dur);
  el.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);

  const rot = (Math.random() * 20 - 10).toFixed(1); 
  el.style.transform += ` rotate(${rot}deg)`;

  el.addEventListener('animationend', () => el.remove());

  layer.appendChild(el);
}

const timer = setInterval(spawnHeart, SPAWN_MS);

