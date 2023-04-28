const button = document.getElementById('enter-code');
const input = document.getElementById('player-code-input');
const form = document.getElementById('player-code-form');
const clientCode = document.getElementById('client-code');
const slippiStatus = document.getElementById('slippi-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clientCode.innerHTML = input.value;
});

window.electronAPI.onSlippiConnecting((_event, value) => {
  slippiStatus.innerHTML = 'Connecting...';
  console.log('got connecting event');
});
  
window.electronAPI.onSlippiConnected((_event, value) => {
  slippiStatus.innerHTML = 'Slippi connected.';
  console.log('connect!', value);
});

window.electronAPI.onSlippiDisconnected((_event, value) => {
  slippiStatus.innerHTML = 'Slippi disconnected.';
  console.log('disconnect :(', value);
});

window.electronAPI.connectToSlippi();