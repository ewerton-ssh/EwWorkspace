const { ipcRenderer } = require('electron');

function actBtn(e) {
  ipcRenderer.send(e);
}

const calculateLayoutSize = () => {
  const sidebarContainer = document.querySelector('.sidebar');
  const buttonTagName = sidebarContainer.getElementsByTagName('button');
  const appKeys = Array.from(buttonTagName).map((button) => button.id);
  const windowWidth = document.documentElement.clientWidth;
  const windowHeight = document.documentElement.clientHeight - 30;

  function switchApp(button) {
    appKeys.forEach(key => {
      const webviewDOM = document.querySelector(`#webview${key}`);
      
      if (webviewDOM) {
        webviewDOM.style.display = `webview${button}` === webviewDOM.id ? '' : 'none';
      }
    });
  };

  appKeys.forEach((buttons) => {
    if (buttons === 'addShortcut') {
      return;
    };
    document.querySelector(`#${buttons}`).onclick = () => switchApp(buttons);
  });

  appKeys.forEach(key => {
    const webviewDOM = document.querySelector(`#webview${key}`);
      if (webviewDOM) {
        webviewDOM.style.width = windowWidth + 'px';
        webviewDOM.style.height = windowHeight + 'px';
      }
  });

  const updateIconNotification = (webviewId, iconId, notifiedIconPath, defaultIconPath) => {
    const webview = document.getElementById(webviewId);
    webview.addEventListener('page-title-updated', (event) => {
      const title = event.title;
      const match = title.match(/\((\d+)\)/);
      const notification = match ? parseInt(match[1], 10) : 0;
      document.getElementById(iconId).src = notification >= 1 ? notifiedIconPath : defaultIconPath;
    });
  };
  
  updateIconNotification('webviewGmail', 'gmailIcon', './components/Sidebar/icons/gmailNotified.png', './components/Sidebar/icons/gmail.png');
  updateIconNotification('webviewWhatsapp', 'whatsappIcon', './components/Sidebar/icons/whatsappNotified.png', './components/Sidebar/icons/whatsapp.png');  
};

window.addEventListener("DOMContentLoaded", () => {

  window.onresize = calculateLayoutSize;

  document.querySelector("#minimizeBtn").onclick = () => actBtn("minimizeApp");
  document.querySelector("#maximizeBtn").onclick = () => actBtn("maximizeApp");
  document.querySelector("#closeBtn").onclick = () => actBtn("closeApp");

  document.querySelector("#addShortcut").onclick = openModal;
  
  document.querySelector("#closeModal").onclick = closeModal;

  document.getElementById('addShortcutForm').addEventListener('submit', saveShortcut);

  document.getElementById('limitExceededModalAccept').addEventListener('submit', closeExceededModal);

  calculateLayoutSize();
});

function openModal() {
  document.getElementById('addShortcutModal').style.display = 'block';
};

function closeModal() {
  document.getElementById('addShortcutModal').style.display = 'none';
};

function saveShortcut(event) {
  event.preventDefault();
  
  const name = document.getElementById('shortcutName').value;
  const link = document.getElementById('shortcutLink').value;

  ipcRenderer.send('saveShortcut', { name, link });

  window.onresize = calculateLayoutSize;

  closeModal();
};

function closeExceededModal(event){
  event.preventDefault()
  document.getElementById('limitExceededModal').style.display = 'none';
};

module.exports = { calculateLayoutSize };