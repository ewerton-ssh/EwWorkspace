const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

const createBrowserWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, './src/assets/gmail.ico'),
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      nativeWindowOpen: true,
      devTools: true,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, './src/preload.js'),
    }
  });

  mainWindow.loadFile(path.join(__dirname, './src/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.maximize();

  return mainWindow;
};

const createMenu = () => {
  const template = [
    {
      label: 'Sair',
      click: (menuItem, browserWindow) => {
        if (browserWindow) {
          browserWindow.close();
        }
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createMenu();

  mainWindow = createBrowserWindow();

  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({ role: 'copy', label: 'Copiar' }));
  contextMenu.append(new MenuItem({ role: 'paste', label: 'Colar' }));
  contextMenu.append(new MenuItem({ role: 'selectAll', label: 'Selecionar Tudo' }));
  contextMenu.append(new MenuItem({
    label: 'Imprimir',
    click: () => {
      mainWindow.webContents.print({ printBackground: true });
    }
  }));
  contextMenu.append(new MenuItem({
    label: 'Abrir em navegador externo',
    click: (menuItem, browserWindow, event) => {
      const webview = browserWindow.webContents.executeJavaScript('document.querySelector("webview").getURL()');
      webview.then(url => {
        require('electron').shell.openExternal(url);
      });
    }
  }));

  app.on('web-contents-created', (event, contents) => {
    contents.on('context-menu', (e, params) => {
      contextMenu.popup({
        window: BrowserWindow.fromWebContents(contents),
        x: params.x,
        y: params.y
      });
    });
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createBrowserWindow();
  }
});

ipcMain.on('minimizeApp', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

let maximized = true;

ipcMain.on('maximizeApp', () => {
    if(maximized === true){
      mainWindow.unmaximize();
      maximized = false;
    } else {
      mainWindow.maximize();
      maximized = true;
    }
});

ipcMain.on('closeApp', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
