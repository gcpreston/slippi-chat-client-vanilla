const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Ports, ConnectionStatus, ConnectionEvent } = require('@slippi/slippi-js');
const { SlpLiveStream, SlpRealTime } = require('@vinceau/slp-realtime');

const SLIPPI_ADDRESS = '127.0.0.1';
const SLIPPI_PORT = Ports.DEFAULT;
const CONNECTION_TYPE = 'dolphin';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const livestream = new SlpLiveStream(CONNECTION_TYPE);
  const realtime = new SlpRealTime();
  realtime.setStream(livestream);

  livestream.connection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
    if (status === ConnectionStatus.DISCONNECTED) {
      mainWindow.webContents.send('slippi-disconnected');
    }
  });

  ipcMain.on('slippi-connect', () => {
    mainWindow.webContents.send('slippi-connecting');
    livestream.start(SLIPPI_ADDRESS, SLIPPI_PORT)
    .then(() => {
      console.log('slippi connected');
      mainWindow.webContents.send('slippi-connected');
    })
    .catch(console.error);
  });

  realtime.game.start$.subscribe((payload) => {
    const players = payload.players;
    mainWindow.webContents.send('slippi-game-started', players);
  });

  realtime.game.end$.subscribe((_payload) => {
    mainWindow.webContents.send('slippi-game-ended');
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
