// Hent alt relevant
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
let mobileDepth = 0;
let currentTrackName = 'success.mp3';



// Prep audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer;
let musicBuffer;
let musicSource;
let musicPlaying = false;
let musicStartTime = 0;
let musicOffset = 0;



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



// Hent items
function getItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item, a'));
}



// Header
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
    showSubmenu(key);
  });
});



// Hent billeder når menupunkt åbens
function preloadImages(key) {
  const template = document.getElementById(`data-${key}`);
  if (!template) return;
  
  template.content.querySelectorAll('item images img').forEach(img => {
    const el = new Image();
    el.src = img.getAttribute('src');
  });
}



// Submenu-navigation
function showSubmenu(key) {
  submenu.innerHTML = "";
  
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

const logo = document.querySelector('header img');

logo.addEventListener('click', playDui);

function playDui() {
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



// Musikselector
playSelect.addEventListener('click', () => {
  popup.classList.add('visible');
  popupBg.classList.add('visible');
})

popupX.addEventListener('click', () => {
  popup.classList.remove('visible');
  popupBg.classList.remove('visible');
})

function loadAndPlay(filePath, trackName) {
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
    loadAndPlay(el.dataset.src, el.textContent);
    popup.classList.remove('visible');
    popupBg.classList.remove('visible');
  });
});



// Logoanimation
window.addEventListener("load", () => {
  const logo = document.getElementById("logo");

  // 1. Find slutpositionen
  const rect = logo.getBoundingClientRect();

  // 2. Beregn midten af logoet i dets slutposition (Target Center)
  const endX = rect.left + (rect.width / 2);
  const endY = rect.top + (rect.height / 2);
  
  // 3. Find midten af skærmen (Start Center)
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;

  // 4. Aktiver animation mode
  logo.classList.add("animating");

  // FIX: Sæt logoets faktiske størrelse op, mens det er revet ud af layoutet.
  // Dette tvinger browseren til at generere en GPU-tekstur i høj opløsning.
  logo.style.width = "120px";
  logo.style.height = "120px";

  // 5. Tegn stien fra center til center
  const swingX1 = window.innerWidth * 0.2; 
  const swingY1 = window.innerHeight * 0.2;
  const swingX2 = window.innerWidth * 0.8; 
  const swingY2 = window.innerHeight * 0;

  const path = `path("M ${startX} ${startY} C ${startX + swingX1} ${startY + swingY1}, ${endX + swingX2} ${endY + swingY2}, ${endX} ${endY}")`;
  logo.style.offsetPath = path;

  // 6. Kør animationen
  // Vi starter nu 1:1 (hvilket er 120px visuelt) og skalerer NED.
  const animation = logo.animate(
    [
      { 
        offsetDistance: "0%", 
        transform: "scale(1)", 
      },
      { 
        offsetDistance: "50%", 
        transform: "scale(0.4)",
      },
      {
        offsetDistance: "100%",
        transform: "scale(0.1)"
      }
    ], 
    {
      duration: 3000,
      easing: "cubic-bezier(0.6, 0, 0.8, 0.3)", 
      fill: "forwards"
    }
  );

  // 7. Ryd op
  animation.onfinish = () => {
    // 1. Skriv animationens slut-tilstand (scale 0.33 og position) direkte til elementet
    try {
      animation.commitStyles();
    } catch (e) {
      // Backup hvis browseren er gammel:
      logo.style.transform = "scale(0.1)";
    }

    // 2. Stop animationen helt, så den ikke længere "ejer" elementet
    animation.cancel();

    // 3. Fjern klassen og nulstil de ting, der flyttede logoet væk fra headeren
    logo.classList.remove("animating");
    logo.style.offsetPath = "none";
    logo.style.position = ""; // Vigtigt: gå tilbage til 'relative' (fra CSS)
    
    // 4. Nulstil størrelsen og transform, så det passer til 12x12px i din header
    logo.style.width = "";
    logo.style.height = "";
    logo.style.transform = "";
    
    // 5. Force-tjek at det er synligt
    logo.style.opacity = "1";
    logo.style.visibility = "visible";

    playDui();
    
    console.log("Animation færdig - logo nulstillet til header");
  };
});