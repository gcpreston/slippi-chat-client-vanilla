const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Ports, ConnectionStatus, ConnectionEvent } = require('@slippi/slippi-js');
const { SlpLiveStream, SlpRealTime } = require('@vinceau/slp-realtime');
const { Socket } = require('phoenix-channels');

const { UserData } = require('./data');

const SLIPPI_ADDRESS = '127.0.0.1';
const SLIPPI_PORT = Ports.DEFAULT;
const CONNECTION_TYPE = 'dolphin';

const SOCKET_URL = 'ws://127.0.0.1:4000/socket';

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
      sandbox: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Initialize Slippi streams
  const livestream = new SlpLiveStream(CONNECTION_TYPE);
  const realtime = new SlpRealTime();
  realtime.setStream(livestream);

  livestream.connection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
    if (status === ConnectionStatus.DISCONNECTED) {
      mainWindow.webContents.send('slippi-disconnected');
    }
  });

  // Slippi stream events
  realtime.game.start$.subscribe((payload) => {
    const players = payload.players;
    mainWindow.webContents.send('slippi-game-started', players);
  });

  realtime.game.end$.subscribe((_payload) => {
    mainWindow.webContents.send('slippi-game-ended');
  });

  // Renderer events
  ipcMain.handle('get-client-code', () => UserData.readData('client-code'));
  ipcMain.on('set-client-code', (_event, newCode) => UserData.writeData('client-code', newCode));

  ipcMain.handle('get-client-token', () => UserData.readData('client-token'));
  ipcMain.on('set-client-token', (_event, newToken) => UserData.writeData('client-token', newToken));

  // TODO: Avoid crashing via double connect on page refresh

  ipcMain.on('slippi-connect', () => {
    mainWindow.webContents.send('slippi-connecting');
    livestream.start(SLIPPI_ADDRESS, SLIPPI_PORT)
      .then(() => {
        mainWindow.webContents.send('slippi-connected');
      })
      .catch(() => {
        mainWindow.webContents.send('slippi-connection-failed');
      });
  });

  ipcMain.handle('phoenix-connect', () => {
    const clientToken = UserData.readData('client-token');

    if (clientToken) {
      // Initialize Phoenix channel
      const topic = 'clients';
      const socket = new Socket(SOCKET_URL, { params: { client_token: clientToken } });
      const channel = socket.channel(topic, {});

      mainWindow.webContents.send('phoenix-connecting');
      socket.connect();

      return new Promise((resolve, reject) => {
        channel.join()
        .receive('ok', (resp) => {
          console.log('Joined successfully, reply:', resp);
          UserData.writeData('client-code', resp.connect_code);
          resolve(resp);
        })
        .receive('error', (resp) => {
          console.log('Unable to join:', resp);
          mainWindow.webContents.send('phoenix-connection-failed');
          reject(resp);
        });
      });
    }
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
