const playerCodeInput = document.getElementById('player-code-input');
const playerCodeForm = document.getElementById('player-code-form');
const clientCode = document.getElementById('client-code');
const changeCodeButton = document.getElementById('change-code');
const slippiStatus = document.getElementById('slippi-status');
const gameStatus = document.getElementById('game-status');

playerCodeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newCode = playerCodeInput.value;
  window.electronAPI.setClientCode(newCode);
  clientCode.innerHTML = newCode;
  playerCodeForm.style.visibility = 'hidden';
  changeCodeButton.style.visibility = 'visible';
});

changeCodeButton.addEventListener('click', () => {
  playerCodeForm.style.visibility = 'visible';
  changeCodeButton.style.visibility = 'hidden';
});

const formatPlayer = (player) => `${player.displayName} (${player.connectCode})`
const formatPlayers = (players) => {
  if (players.length === 0 || !players[0].displayName) {
    return 'local';
  } else {
    return players.map(formatPlayer).join(', ');
  }
};

async function initializeClientCode() {
  const currentCode = await window.electronAPI.getClientCode();

  if (currentCode) {
    playerCodeForm.style.visibility = 'hidden';
    changeCodeButton.style.visibility = 'visible';
    clientCode.innerHTML = currentCode;
  } else {
    playerCodeForm.style.visibility = 'visible';
    changeCodeButton.style.visibility = 'hidden';
    clientCode.innerHTML = 'Not set';
  }
}

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

initializeClientCode();
window.electronAPI.connectToSlippi();
