// Hent alt relevant
const layout = document.querySelector('.layout');
const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const tekstKolonne = document.getElementById('tekst-kolonne');
const billedKolonne = document.getElementById('billed-kolonne');
const tilbagePil = document.getElementById('tilbage-pil');
const playKnap = document.getElementById('play-knap');
const musikVaelger = document.getElementById('musik-vaelger');
const popup = document.getElementById('popup');
const popupBg = document.getElementById('popupbg');
const popupX = document.getElementById('popupkryds');
const logo = document.getElementById("logo");
const submenuElementer = new Map();
let mobilModus = erMobil();
let mobilDybde = 0;

// Prep audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer;
let musicBuffer;
let musicSource;
let musicPlaying = false;
let musicStartTime = 0;
let musicOffset = 0;
let aktuelMusik = 'success.mp3';





//=============================
// I N I T I A L I S E R I N G
//=============================

// Find relevant element fra hash
document.addEventListener('DOMContentLoaded', genopretFraHash);
window.addEventListener('hashchange', genopretFraHash);



// Sæt logo klar til animation
window.addEventListener("load", logoStartPosition);



// Når siden loades, init
document.addEventListener('DOMContentLoaded', () => {
  if (erMobil()) {
    const [key, itemSlug] = location.hash.replace('#', '').split('/');
    if (key && itemSlug) {
      tilbagePil.style.display = 'inline';
      // genopretFraHash håndterer resten
    } else {
      nulstilTilMenu();
    }
  }
});



function genopretFraHash() {
  const [key, itemSlug] = location.hash.replace('#', '').split('/');
  if (!key || !itemSlug) return;
  
  document.querySelector('.menu').classList.remove('mobile-active');
  menu.forEach(m => m.classList.remove('active'));
  document.querySelector(`[data-target="${key}"]`)?.classList.add('active');
  visSubmenu(key);

  if (submenuElementer.has(itemSlug)) {
    const { item, el } = submenuElementer.get(itemSlug);
    visIndhold(item, el);
  }
}





//===============================
// M O B I L H Å N D T E R I N G
//===============================



// Afgør device
function erMobil() {
  return window.innerWidth <= 800;
}



// Mobil init: Nulstil til menu
function nulstilTilMenu() {
    document.querySelector('.menu').classList.add('mobile-active');
    tilbagePil.style.display = 'inline';
    tilbagePil.classList.add('inactive');
}



// Mobil: Navigationsdybde
function saetMobilDybde(depth) {
  if (!erMobil()) return;
  mobilDybde = depth;
  if (depth > 0) {
    tilbagePil.classList.remove('inactive');
  } else {
    tilbagePil.classList.add('inactive');
  }
}



// Automatisk toggle af mobil/desktop-modus ved ændring af skærmbredde
window.addEventListener('resize', () => {
  const mobilNu = erMobil();
  if (mobilNu === mobilModus) return;
  mobilModus = mobilNu;
  if (mobilNu) {
    aktiverMobilModus();
  } else {
    deaktiverMobilModus();
  }
});



function aktiverMobilModus() {
  tilbagePil.style.display = 'inline';
  genopretFraHash(); // genskaber klasser og mobilDybde via visSubmenu/visIndhold
  
  // Hvis intet indhold er aktivt, vis menu
  if (mobilDybde === 0) {
    document.querySelector('.menu').classList.add('mobile-active');
    tilbagePil.classList.add('inactive');
  }
}

function deaktiverMobilModus() {
  document.querySelector('.menu').classList.remove('mobile-active');
  document.querySelector('.submenu').classList.remove('mobile-active');
  tekstKolonne.classList.remove('mobile-active');
  billedKolonne.classList.remove('mobile-active');
  tilbagePil.style.display = 'none';
  mobilDybde = 0;
  genopretFraHash(); // genskaber aktive klasser og understrегninger
}





//=====================
// N A V I G A T I O N
//=====================

function lavSlug(str) {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}



// Hent items
function hentItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item'));
}



// Header
document.getElementById('header-titel').addEventListener('click', () => {
  location.hash = '';
  menu.forEach(m => m.classList.remove('active'));
  layout.classList.remove('images-only');
  submenu.innerHTML = "";
  tekstKolonne.innerHTML = "";
  billedKolonne.innerHTML = "";
  saetMobilDybde(0);

  if (erMobil()) {
    document.querySelector('.submenu').classList.remove('mobile-active');
    tekstKolonne.classList.remove('mobile-active');
    billedKolonne.classList.remove('mobile-active');
    document.querySelector('.menu').classList.add('mobile-active');
  }
});



// Tilbage-pil
tilbagePil.addEventListener('click', () => {
  if (mobilDybde === 2) {
    location.hash = '';
    tekstKolonne.classList.remove('mobile-active');
    billedKolonne.classList.remove('mobile-active');
    document.querySelector('.submenu').classList.add('mobile-active');
    saetMobilDybde(1);
  } else if (mobilDybde === 1) {
    document.querySelector('.submenu').classList.remove('mobile-active');
    document.querySelector('.menu').classList.add('mobile-active');
    saetMobilDybde(0);
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
  submenuElementer.clear();
  preloadBilleder(key);

  hentItems(key).forEach(item => {
    const el = document.createElement('p');
    el.textContent = item.getAttribute('name');
    el.onclick = () => {
      location.hash = `${key}/${lavSlug(item.getAttribute('name'))}`;
      visIndhold(item, el);
    };
    submenu.appendChild(el);
    submenuElementer.set(lavSlug(item.getAttribute('name')), { item, el });
  });

  if (erMobil()) {
    document.querySelector('.menu').classList.remove('mobile-active');
    document.querySelector('.submenu').classList.add('mobile-active');
    saetMobilDybde(1);
  }
}



// Vis indhold
function visIndhold(item, el) {
  document.querySelectorAll('.submenu p').forEach(p => p.classList.remove('active'));
  el.classList.add('active');

  visTekst(item);
  visBilleder(item);

  if (erMobil()) {
    document.querySelector('.submenu').classList.remove('mobile-active');
    tekstKolonne.classList.add('mobile-active');
    billedKolonne.classList.add('mobile-active');
    saetMobilDybde(2);
  }
}

function visTekst(item) {
  const imagesOnly = item.hasAttribute('images-only');
  tekstKolonne.innerHTML = imagesOnly ? '' : item.innerHTML;
  layout.classList.toggle('images-only', imagesOnly);
}

function visBilleder(item) {
  const images = Array.from(item.querySelectorAll('images img'));
  billedKolonne.innerHTML = images.map(img =>
    `<img src="${img.getAttribute('src')}" alt="${item.getAttribute('name')}">` +
    (img.getAttribute('caption')
      ? `<p class="image-caption">${img.getAttribute('caption')}</p>`
      : '')
  ).join('');
}





//===========
// A U D I O
//===========

// Audio-initiatlisering
function resumeOnce() {
  audioCtx.resume();
  ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt =>
    window.removeEventListener(evt, resumeOnce)
  );
}

['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt =>
  window.addEventListener(evt, resumeOnce)
);



// Dui-lyd
fetch('lyd/DuiB.mp3')
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => { clickBuffer = buffer; })
  .catch(console.error);

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
  .then(buffer => { musicBuffer = buffer; })
  .catch(console.error);

playKnap.addEventListener('click', () => {
  if (!musicBuffer) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (musicPlaying) {
    musicOffset = (audioCtx.currentTime - musicStartTime) % musicBuffer.duration;
    musicSource.stop();
    musicSource = null;
    musicPlaying = false;
    playKnap.textContent = '▶︎';
    document.getElementById('play-text').textContent = 'play';
  } else {
    musicSource = audioCtx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(audioCtx.destination);
    musicSource.start(0, musicOffset);
    musicStartTime = audioCtx.currentTime - musicOffset;
    musicPlaying = true;
    playKnap.textContent = '◼︎';
    document.getElementById('play-text').textContent = aktuelMusik;
  }
});





//=============================
// U S E R   I N T E R F A C E
//=============================

// Musikselector
musikVaelger.addEventListener('click', () => {
  popup.classList.add('visible');
  popupBg.classList.add('visible');
})

popupX.addEventListener('click', () => {
  popup.classList.remove('visible');
  popupBg.classList.remove('visible');
})

function hentOgAfspil(filePath, trackName) {
  if (musicSource) {
    musicSource.stop();
    musicSource = null;
    musicPlaying = false;
  }
  musicOffset = 0;

  playKnap.textContent = '⋯';
  playKnap.classList.add('inactive');
  document.getElementById('play-text').textContent = "loading...";

  aktuelMusik = trackName;

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
      playKnap.classList.remove('inactive');
      playKnap.textContent = '◼︎';
      document.getElementById('play-text').textContent = aktuelMusik;
    })
    .catch(console.error);
}

document.querySelectorAll('.musik-valg').forEach(el => {
  el.addEventListener('click', () => {
    hentOgAfspil(el.dataset.src, el.textContent);
    popup.classList.remove('visible');
    popupBg.classList.remove('visible');
  });
});



// Logoanimation
function logoStartPosition () {
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

  ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, logoAnimation);
  });
}

function logoAnimation() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
    window.removeEventListener(evt, logoAnimation);
  });

  // 6. Kør animationen
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
      duration: 2000,
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