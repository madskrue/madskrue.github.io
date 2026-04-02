const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const content = document.getElementById('content');
const imageCol = document.getElementById('image-col');
const backArrow = document.getElementById('back-arrow');
const playBtn = document.getElementById('play-btn');
let mobileDepth = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer;
let musicBuffer;
let musicSource;
let musicPlaying = false;
let musicStartTime = 0;
let musicOffset = 0;

function isMobile() {
  return window.innerWidth <= 600;
}

function getItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item, a'));
}

function preloadImages(key) {
  const template = document.getElementById(`data-${key}`);
  if (!template) return;
  
  template.content.querySelectorAll('item images img').forEach(img => {
    const el = new Image();
    el.src = img.getAttribute('src');
  });
}

function setMobileDepth(depth) {
  if (!isMobile()) return;
  mobileDepth = depth;
  if (depth > 0) {
    backArrow.classList.remove('inactive');
  } else {
    backArrow.classList.add('inactive');
  }
}

function initMobileView() {
  if (isMobile()) {
    document.querySelector('.menu').classList.add('mobile-active');
    backArrow.style.display = 'inline';
    backArrow.classList.add('inactive');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileView();
});

function showSubmenu(key) {
  submenu.innerHTML = "";
  
  // Preload images for this section
  preloadImages(key);

  getItems(key).forEach(item => {
    if (item.tagName === 'A') {
      const el = item.cloneNode(true);
      el.textContent = item.getAttribute('name');
      submenu.appendChild(el);
    } else {
      const el = document.createElement('p');
      el.textContent = item.getAttribute('name');
      el.onclick = () => {
        document.querySelectorAll('.submenu p').forEach(p => p.classList.remove('active'));
        el.classList.add('active');
        content.innerHTML = item.innerHTML;
        const images = Array.from(item.querySelectorAll('images img'));
        if (images.length) {
          imageCol.innerHTML = images.map(img =>
            `<img src="${img.getAttribute('src')}" alt="${item.getAttribute('name')}">` +
            (img.getAttribute('caption')
              ? `<p class="image-caption">${img.getAttribute('caption')}</p>`
              : '')
          ).join('');
        } else {
          imageCol.innerHTML = '';
        }
        if (isMobile()) {
          document.querySelector('.submenu').classList.remove('mobile-active');
          content.classList.add('mobile-active');
          imageCol.classList.add('mobile-active');
          setMobileDepth(2);
        }
      };
      submenu.appendChild(el);
    }
  });

  if (isMobile()) {
    document.querySelector('.menu').classList.remove('mobile-active');
    document.querySelector('.submenu').classList.add('mobile-active');
    setMobileDepth(1);
  }
}

menu.forEach(item => {
  item.addEventListener('click', () => {
    menu.forEach(m => m.classList.remove('active'));
    item.classList.add('active');
    const key = item.dataset.target;
    showSubmenu(key);
  });
});

backArrow.addEventListener('click', () => {
  if (mobileDepth === 2) {
    content.classList.remove('mobile-active');
    imageCol.classList.remove('mobile-active');
    document.querySelector('.submenu').classList.add('mobile-active');
    setMobileDepth(1);
  } else if (mobileDepth === 1) {
    document.querySelector('.submenu').classList.remove('mobile-active');
    document.querySelector('.menu').classList.add('mobile-active');
    setMobileDepth(0);
  }
});

fetch('lyd/DuiB.mp3')
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => { clickBuffer = buffer; });

fetch('lyd/success.mp3')
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => { musicBuffer = buffer; });

const logo = document.querySelector('header img');
logo.addEventListener('click', () => {
  if (!clickBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.5;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
});

playBtn.addEventListener('click', () => {
  if (!musicBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (musicPlaying) {
    musicOffset = (audioCtx.currentTime - musicStartTime) % musicBuffer.duration;
    musicSource.stop();
    musicSource = null;
    musicPlaying = false;
    playBtn.textContent = '▶︎';
  } else {
    musicSource = audioCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(audioCtx.destination);
    musicSource.start(0, musicOffset);
    musicStartTime = audioCtx.currentTime - musicOffset;
    musicPlaying = true;
    playBtn.textContent = '◼︎';
  }
});

document.addEventListener('pointerdown', () => {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });

document.getElementById('header-title').addEventListener('click', () => {
  menu.forEach(m => m.classList.remove('active'));
  submenu.innerHTML = "";
  content.innerHTML = "";
  imageCol.innerHTML = "";
  setMobileDepth(0);

  if (isMobile()) {
    document.querySelector('.submenu').classList.remove('mobile-active');
    content.classList.remove('mobile-active');
    imageCol.classList.remove('mobile-active');
    document.querySelector('.menu').classList.add('mobile-active');
  }
});