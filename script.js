// Hent alt relevant
const layout = document.querySelector('.layout');
const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const content = document.getElementById('content');
const imageCol = document.getElementById('image-col');
const backArrow = document.getElementById('back-arrow');
const playBtn = document.getElementById('play-btn');
const playSelect = document.getElementById('play-selector');
const popup = document.getElementById('popup');
const popupBg = document.getElementById('popupbg');
const popupX = document.getElementById('popupkryds');
const logo = document.getElementById("logo");
let mobileDepth = 0;

// Prep audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer;
let musicBuffer;
let musicSource;
let musicPlaying = false;
let musicStartTime = 0;
let musicOffset = 0;
let currentTrackName = 'success.mp3';





//=============================
// I N I T I A L I S E R I N G
//=============================

// Afgør device
function isMobile() {
  return window.innerWidth <= 600;
}



// Mobil: Navigationsdybde
function setMobileDepth(depth) {
  if (!isMobile()) return;
  mobileDepth = depth;
  if (depth > 0) {
    backArrow.classList.remove('inactive');
  } else {
    backArrow.classList.add('inactive');
  }
}



// Mobil init: Nulstil til menu
function initMobileView() {
  if (isMobile()) {
    document.querySelector('.menu').classList.add('mobile-active');
    backArrow.style.display = 'inline';
    backArrow.classList.add('inactive');
  }
}



// Mobil: Når siden loades, init
document.addEventListener('DOMContentLoaded', () => {
  initMobileView();
});



// Touch-highlight på links
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('touchstart', () => {
    link.classList.add('touched');
  });
  
  link.addEventListener('touchend', () => {
    link.classList.remove('touched');
  });
});





//=====================
// N A V I G A T I O N
//=====================

// Hent items
function hentItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item, a'));
}



// Header
document.getElementById('header-title').addEventListener('click', () => {
  menu.forEach(m => m.classList.remove('active'));
  layout.classList.remove('images-only');
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



// Tilbage-pil
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



// Menu-navigation
menu.forEach(item => {
  item.addEventListener('click', () => {
    menu.forEach(m => m.classList.remove('active'));
    item.classList.add('active');
    const key = item.dataset.target;
    visSubmenu(key);
  });
});



// Hent billeder når menupunkt åbens
function preloadBilleder(key) {
  const template = document.getElementById(`data-${key}`);
  if (!template) return;
  
  template.content.querySelectorAll('item images img').forEach(img => {
    const el = new Image();
    el.src = img.getAttribute('src');
  });
}



// Submenu-navigation
function visSubmenu(key) {
  submenu.innerHTML = "";
  
  preloadBilleder(key);

  hentItems(key).forEach(item => {
    if (item.tagName === 'A') {
      const el = item.cloneNode(true);
      el.textContent = item.getAttribute('name');
      submenu.appendChild(el);
    } else {
      const el = document.createElement('p');
      el.textContent = item.getAttribute('name');
      el.onclick = () => {
      visIndhold(item, el)};
      submenu.appendChild(el);
    }
  });

  if (isMobile()) {
    document.querySelector('.menu').classList.remove('mobile-active');
    document.querySelector('.submenu').classList.add('mobile-active');
    setMobileDepth(1);
  }
}



// Vis indhold
function visIndhold(item, el) {
  document.querySelectorAll('.submenu p').forEach(p => p.classList.remove('active'));
  el.classList.add('active');

  const imagesOnly = item.hasAttribute('images-only');

  if (imagesOnly) {
    content.innerHTML = '';
    layout.classList.add('images-only');
  } else {
    content.innerHTML = item.innerHTML;
    layout.classList.remove('images-only');
  }

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
}





//===========
// A U D I O
//===========

// Dui-lyd
const resumeAudio = async () => {
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
};



// Væk audioctx ved første interaktion
window.addEventListener('click', resumeAudio, { once: true });
window.addEventListener('touchstart', resumeAudio, { once: true });
window.addEventListener('mousedown', resumeAudio, { once: true });
window.addEventListener('keydown', resumeAudio, { once: true });

fetch('lyd/DuiB.mp3')
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => { clickBuffer = buffer; });

logo.addEventListener('click', afspilDui);

function afspilDui() {
  if (logo.classList.contains('animating')) return;
  if (!clickBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const source = audioCtx.createBufferSource();
  source.buffer = clickBuffer;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.25;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}



// Musikafspilning
fetch('lyd/success.mp3')
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => { musicBuffer = buffer; });

playBtn.addEventListener('click', () => {
  if (!musicBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (musicPlaying) {
    musicOffset = (audioCtx.currentTime - musicStartTime) % musicBuffer.duration;
    musicSource.stop();
    musicSource = null;
    musicPlaying = false;
    playBtn.textContent = '▶︎';
    document.getElementById('play-text').textContent = 'play';
  } else {
    musicSource = audioCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(audioCtx.destination);
    musicSource.start(0, musicOffset);
    musicStartTime = audioCtx.currentTime - musicOffset;
    musicPlaying = true;
    playBtn.textContent = '◼︎';
    document.getElementById('play-text').textContent = currentTrackName;
  }
});





//=============================
// U S E R   I N T E R F A C E
//=============================

// Musikselector
playSelect.addEventListener('click', () => {
  popup.classList.add('visible');
  popupBg.classList.add('visible');
})

popupX.addEventListener('click', () => {
  popup.classList.remove('visible');
  popupBg.classList.remove('visible');
})

function loadOgAfspil(filePath, trackName) {
  if (musicSource) {
    musicSource.stop();
    musicSource = null;
    musicPlaying = false;
  }
  musicOffset = 0;

  playBtn.textContent = '⋯';
  playBtn.classList.add('inactive');
  document.getElementById('play-text').textContent = "loading...";

  currentTrackName = trackName;

  fetch(filePath)
    .then(res => res.arrayBuffer())
    .then(data => audioCtx.decodeAudioData(data))
    .then(buffer => {
      musicBuffer = buffer;
      musicSource = audioCtx.createBufferSource();
      musicSource.buffer = musicBuffer;
      musicSource.loop = true;
      musicSource.connect(audioCtx.destination);
      musicSource.start(0, 0);
      musicStartTime = audioCtx.currentTime;
      musicPlaying = true;
      playBtn.classList.remove('inactive');
      playBtn.textContent = '◼︎';
      document.getElementById('play-text').textContent = currentTrackName;
    });
}

document.querySelectorAll('.musik-valg').forEach(el => {
  el.addEventListener('click', () => {
    loadOgAfspil(el.dataset.src, el.textContent);
    popup.classList.remove('visible');
    popupBg.classList.remove('visible');
  });
});



// Logoanimation
window.addEventListener("load", () => {

  // 1. Find slutpositionen (Target) mens logoet stadig er 12px i headeren
  const rect = logo.getBoundingClientRect();
  const endX = rect.left + (rect.width / 2);
  const endY = rect.top + (rect.height / 2);
  
  // 2. Find midten af skærmen (Start)
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;

  // 3. Forbered logoet til animation
  logo.classList.add("animating");
  logo.style.width = "120px";
  logo.style.height = "120px";
  
  // Eksplicit sæt ankerpunktet til midten (vigtigt for præcision)
  logo.style.offsetAnchor = "center";

  // 4. Definer stien
  const swingX1 = window.innerWidth * 0.2; 
  const swingY1 = window.innerHeight * 0.2;
  const swingX2 = window.innerWidth * 0.8; 
  const swingY2 = window.innerHeight * 0;

  const path = `path("M ${startX} ${startY} C ${startX + swingX1} ${startY + swingY1}, ${endX + swingX2} ${endY + swingY2}, ${endX} ${endY}")`;
  logo.style.offsetPath = path;

  // 5. Start-tilstand (før brugeren gør noget)
  logo.style.offsetDistance = "0%";
  logo.style.transform = "scale(1)";

  function startIntro() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, startIntro);
    });

    // 6. Kør animationen - BEMÆRK: Ingen translate her!
    const animation = logo.animate(
      [
        { 
          offsetDistance: "0%", 
          transform: "scale(1)",
        },
        { 
          offsetDistance: "100%",
          transform: "scale(0.1)",
        }
      ], 
      {
        duration: 2500,
        easing: "cubic-bezier(0.6, 0, 0.8, 0.3)", 
        fill: "forwards"
      }
    );

    animation.onfinish = () => {
      try {
        animation.commitStyles();
      } catch (e) {
        logo.style.transform = "scale(0.1)";
      }
      animation.cancel();

      // Ryd op og lad CSS overtage
      logo.classList.remove("animating");
      logo.style.offsetPath = "none";
      logo.style.offsetDistance = "";
      logo.style.offsetAnchor = "";
      logo.style.width = "";
      logo.style.height = "";
      logo.style.transform = "";
      
      afspilDui();
    };
  }

  ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, startIntro);
  });
});