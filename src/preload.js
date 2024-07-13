const { ipcRenderer } = require('electron');

ipcRenderer.on('loadShortcut', (event, shortcut) => {
  const sidebarContainer = document.querySelector('.sidebar');
  const webviewContainer = document.querySelector('.webview-container');

  if (shortcut.type === 'reload') {
    const button = document.getElementById(`${shortcut.name}`);
    sidebarContainer.removeChild(button);
    const webview = document.getElementById(`webview${shortcut.name}`);
    webviewContainer.removeChild(webview);
  } else if (shortcut.type === 'exceeded') {
    document.getElementById('limitExceededModal').style.display = 'block';
  } else {
    const url = new URL(shortcut.link);
    const domain = url.hostname;
    const faviconUrl = `https://api.faviconkit.com/${domain}/64`;

    sidebarContainer.innerHTML += `
    <button id='${shortcut.name}' class='removable'>
      <img src='${faviconUrl}' alt="${shortcut.name}" class="icon" />
      <span class="tooltip">${shortcut.name}</span>
    </button>`;
    webviewContainer.innerHTML += `
    <webview allowpopups 
      id="webview${shortcut.name}" 
      src="${shortcut.link}" 
      style="width:100%; display:none;" 
      useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36">
    </webview>`;
  }

  const buttonTagName = sidebarContainer.getElementsByTagName('button');
  const appKeys = Array.from(buttonTagName).map((button) => button.id);

  function switchApp(button) {
    appKeys.forEach(key => {
      const webviewDOM = document.querySelector(`#webview${key}`);
      
      if (webviewDOM) {
        webviewDOM.style.display = `webview${button}` === webviewDOM.id ? '' : 'none';
      }
    });
  }

  appKeys.forEach((buttons) => {
    if (buttons === 'addShortcut') {
      return;
    }
    const buttonElement = document.querySelector(`#${buttons}`);
    buttonElement.onclick = () => switchApp(buttons);
    buttonElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (buttonElement.classList.value !== 'removable') {
        return;
      };
      showDeleteShortcutContext(event, buttons);
    });
  });

  document.querySelector("#addShortcut").onclick = openModal;

  function openModal() {
    document.getElementById('addShortcutModal').style.display = 'block';
  }

  function showDeleteShortcutContext(event, buttonId) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.display = 'block';

    document.getElementById('print-id').onclick = () => {
      ipcRenderer.send('deleteShortcut', buttonId);
      contextMenu.style.display = 'none';
    };

    document.addEventListener('click', () => {
      contextMenu.style.display = 'none';
    }, { once: true });
  }

  calculateLayoutSize();
});