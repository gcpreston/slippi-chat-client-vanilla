const playerCodeInput = document.getElementById('player-code-input');
const playerCodeForm = document.getElementById('player-code-form');
const clientCode = document.getElementById('client-code');
const changeCodeButton = document.getElementById('change-code');
const phoenixStatus = document.getElementById('phoenix-status');
const retryPhoenixButton = document.getElementById('phoenix-retry');
const slippiStatus = document.getElementById('slippi-status');
const retrySlippiButton = document.getElementById('slippi-retry');
const gameStatus = document.getElementById('game-status');

function initializeSlippiConnection() {
  window.electronAPI.connectToSlippi();
  retrySlippiButton.style.visibility = 'hidden';
}

function initializePhoenixConnection() {
  window.electronAPI.connectToPhoenix();
  retryPhoenixButton.style.visibility = 'hidden';
}

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

retrySlippiButton.addEventListener('click', () => {
  initializeSlippiConnection();
})

const formatPlayer = (player) => `${player.displayName} (${player.connectCode})`
const formatPlayers = (players) => {
  if (players.length === 0 || !players[0].displayName) {
    return 'local';
  } else {
    return players.map(formatPlayer).join(', ');
  }
};

// Slippi connection events
window.electronAPI.onSlippiConnecting(() => {
  slippiStatus.innerHTML = 'Connecting...';
  gameStatus.innerHTML = 'No game';
});
  
window.electronAPI.onSlippiConnected((_event, value) => {
  slippiStatus.innerHTML = 'Slippi connected.';
  console.log('connect!', value);
});

window.electronAPI.onSlippiDisconnected((_event, value) => {
  slippiStatus.innerHTML = 'Slippi disconnected.';
  console.log('disconnect :(', value);
});

window.electronAPI.onSlippiConnectionFailed(() => {
  slippiStatus.innerHTML = 'Connection failed.';
  retrySlippiButton.style.visibility = 'visible';
});

// Slippi game events
window.electronAPI.onSlippiGameStarted((_event, value) => {
  gameStatus.innerHTML = `Current game: ${formatPlayers(value)}`
});

window.electronAPI.onSlippiGameEnded(() => {
  gameStatus.innerHTML = 'No game';
});

// Phoenix connection events
window.electronAPI.onPhoenixConnecting(() => {
  phoenixStatus.innerHTML = 'Phoenix connecting...';
});
  
window.electronAPI.onPhoenixConnected(() => {
  phoenixStatus.innerHTML = 'Phoenix connected.';
});

window.electronAPI.onPhoenixConnectionFailed(() => {
  phoenixStatus.innerHTML = 'Phoenix connection failed.';
  retryPhoenixButton.style.visibility = 'visible';
});

initializeClientCode();
initializeSlippiConnection();
initializePhoenixConnection();
