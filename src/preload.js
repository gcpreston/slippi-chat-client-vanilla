// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  connectToSlippi: () => ipcRenderer.send('slippi-connect'),

  onSlippiConnecting: (callback) => ipcRenderer.on('slippi-connecting', callback),
  onSlippiConnected: (callback) => ipcRenderer.on('slippi-connected', callback),
  onSlippiDisconnected: (callback) => ipcRenderer.on('slippi-disconnected', callback),
  onSlippiGameStarted: (callback) => ipcRenderer.on('slippi-game-started', callback),
  onSlippiGameEnded: (callback) => ipcRenderer.on('slippi-game-ended', callback),

  getClientCode: async () => await ipcRenderer.invoke('get-client-code'),
  setClientCode: (newCode) => ipcRenderer.send('set-client-code', newCode)  
});