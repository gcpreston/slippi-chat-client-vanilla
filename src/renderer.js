const button = document.getElementById('enter-code');
const input = document.getElementById('player-code-input');
const clientCode = document.getElementById('client-code');
const slippiStatus = document.getElementById('slippi-status');

button.addEventListener('click', () => {
  // clientCode.innerHTML = input.value;
  console.log('hello');
  clientCode.innerHTML = 'wow';
});

// TOOD: Use preload to expose what is needed
// https://stackoverflow.com/questions/44391448/electron-require-is-not-defined/57049268#57049268
const { ipcRenderer } = require('electron');

ipcRenderer.on('slippi-connected', () => {
    console.log('slippi connected');
    // slippiStatus.innerHTML = 'Slippi connected.';
  });
  
  ipcRenderer.on('slippi-disconnected', () => {
    console.log('slippi disconnect');
    // slippiStatus.innerHTML = 'Slippi disconnected.';
  });
  