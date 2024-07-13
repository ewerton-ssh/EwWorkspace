const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'shortcuts.db');
  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS shortcuts (id INTEGER PRIMARY KEY, name TEXT, link TEXT)");
  });

  ipcMain.on('saveShortcut', (event, shortcut) => {
    db.get("SELECT COUNT(*) AS count FROM shortcuts", (err, row) => {
      if (err) {
        return;
      }
  
      if (row.count < 8) {
        db.run("INSERT INTO shortcuts (name, link) VALUES (?, ?)", [shortcut.name, shortcut.link], function (err) {
          if (err) {
            return;
          }
        });
  
        mainWindow.webContents.send('loadShortcut', shortcut);
      } else {
        mainWindow.webContents.send('loadShortcut', { "type": "exceeded"});
      }
    });
  });

  const createBrowserWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      icon: path.join(__dirname, './src/assets/ewworkspace.ico'),
      frame: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        nativeWindowOpen: true,
        devTools: true,
        contextIsolation: false,
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

  createMenu();

  mainWindow = createBrowserWindow();

  db.all("SELECT * FROM shortcuts", [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      mainWindow.webContents.send('loadShortcut', row);
    });
  });

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

  app.setAppUserModelId('☄️ EwWorkspace');

  ipcMain.on('minimizeApp', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  let maximized = true;

  ipcMain.on('maximizeApp', () => {
    if (maximized === true) {
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

  ipcMain.on('deleteShortcut', (event, shortcutId) => {
    db.run("DELETE FROM shortcuts WHERE name = ?", [shortcutId], function (err) {
      if (err) {
        return;
      } else {
        const reload = {
          "type": "reload",
          "name": `${shortcutId}`
        }
        mainWindow.webContents.send('loadShortcut', reload);
      }
    });
  });

});