const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const content = document.getElementById('content');
const imageCol = document.getElementById('image-col');
const backArrow = document.getElementById('back-arrow');
let mobileDepth = 0;

function isMobile() {
  return window.innerWidth <= 600;
}

function getItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item, a'));
}

function preloadImages() {
    document.querySelectorAll('item images img').forEach(img => {
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
  preloadImages();
  initMobileView();
});

function showSubmenu(key) {
  submenu.innerHTML = "";

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

let audioCtx;
let clickBuffer;

fetch('lyd/DuiB.mp3')
  .then(res => res.arrayBuffer())
  .then(data => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.decodeAudioData(data);
  })
  .then(buffer => {
    clickBuffer = buffer;
  });

const logo = document.querySelector('header img');
logo.addEventListener('click', () => {
  if (!clickBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
});

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