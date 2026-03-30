const menu = document.querySelectorAll('.menu p');
const submenu = document.getElementById('submenu');
const content = document.getElementById('content');
const imageCol = document.getElementById('image-col');

function getItems(key) {
  const template = document.getElementById(`data-${key}`);
  return Array.from(template.content.querySelectorAll('item, a'));
}

function preloadImages() {
  document.querySelectorAll('item[image]').forEach(item => {
    const img = new Image();
    img.src = item.getAttribute('image');
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
          content.innerHTML = item.innerHTML;
          const img = item.getAttribute('image');
          const caption = item.getAttribute('image-caption');
          if (img) {
              imageCol.innerHTML = `<img src="${img}" alt="${item.getAttribute('name')}">` 
                  + (caption ? `<p class="image-caption">${caption}</p>` : '');
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
  submenu.innerHTML = "";
  content.innerHTML = "";
  imageCol.innerHTML = "";
});
