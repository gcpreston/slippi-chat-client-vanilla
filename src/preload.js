// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  connectToSlippi: () => ipcRenderer.send('slippi-connect'),

  onSlippiConnecting: (callback) => ipcRenderer.on('slippi-connecting', callback),
  onSlippiConnected: (callback) => ipcRenderer.on('slippi-connected', callback),
  onSlippiDisconnected: (callback) => ipcRenderer.on('slippi-disconnected', callback),
  onSlippiConnectionFailed: (callback) => ipcRenderer.on('slippi-connection-failed', callback),
  onSlippiGameStarted: (callback) => ipcRenderer.on('slippi-game-started', callback),
  onSlippiGameEnded: (callback) => ipcRenderer.on('slippi-game-ended', callback),

  connectToPhoenix: () => ipcRenderer.invoke('phoenix-connect'),

  onPhoenixConnecting: (callback) => ipcRenderer.on('phoenix-connecting', callback),
  onPhoenixConnected: (callback) => ipcRenderer.on('phoenix-connected', callback),
  onPhoenixConnectionFailed: (callback) => ipcRenderer.on('phoenix-connection-failed', callback),

  getClientCode: async () => await ipcRenderer.invoke('get-client-code'),
  setClientCode: (newCode) => ipcRenderer.send('set-client-code', newCode),

  getClientToken: async () => await ipcRenderer.invoke('get-client-token'),
  setClientToken: (newToken) => ipcRenderer.send('set-client-token', newToken)
});
