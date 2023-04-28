const button = document.getElementById('enter-code');
const input = document.getElementById('player-code-input');
const form = document.getElementById('player-code-form');
const clientCode = document.getElementById('client-code');
const slippiStatus = document.getElementById('slippi-status');
const gameStatus = document.getElementById('game-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clientCode.innerHTML = input.value;
});

const formatPlayer = (player) => `${player.displayName} (${player.connectCode})`
const formatPlayers = (players) => {
  if (players.length === 0 || !players[0].displayName) {
    return 'local';
  } else {
    return players.map(formatPlayer).join(', ');
  }
};

window.electronAPI.onSlippiConnecting((_event, value) => {
  slippiStatus.innerHTML = 'Connecting...';
  gameStatus.innerHTML = 'No game';
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

window.electronAPI.onSlippiGameStarted((_event, value) => {
  gameStatus.innerHTML = `Current game: ${formatPlayers(value)}`
});

window.electronAPI.onSlippiGameEnded(() => {
  gameStatus.innerHTML = 'No game';
});

window.electronAPI.connectToSlippi();