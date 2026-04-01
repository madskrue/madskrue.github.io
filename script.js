const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const content = document.getElementById('content');
const imageCol = document.getElementById('image-col');

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

document.addEventListener('DOMContentLoaded', preloadImages);

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
      };
      submenu.appendChild(el);
    }
  });
}

menu.forEach(item => {
  item.addEventListener('click', () => {
    menu.forEach(m => m.classList.remove('active'));
    item.classList.add('active');
    const key = item.dataset.target;
    showSubmenu(key);
  });
});

const clickSound = new Audio('lyd/DuiB.mp3');
clickSound.load();

const logo = document.querySelector('header img');
logo.addEventListener('click', () => {
  clickSound.currentTime = 0;
  clickSound.play();
});

document.getElementById('header-title').addEventListener('click', () => {
  menu.forEach(m => m.classList.remove('active'));
  submenu.innerHTML = "";
  content.innerHTML = "";
  imageCol.innerHTML = "";
});
