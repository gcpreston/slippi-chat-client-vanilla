const tokenInput = document.getElementById('client-token-input');
const tokenForm = document.getElementById('client-token-form');
const clientCode = document.getElementById('client-code');
const changeTokenButton = document.getElementById('change-token');
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
  phoenixStatus.innerHTML = 'Phoenix connecting...'
  retryPhoenixButton.style.visibility = 'hidden';

  window.electronAPI.connectToPhoenix()
    .then(
      (resp) => {
        console.log('connect', resp);
        phoenixStatus.innerHTML = 'Phoenix connected.';
        clientCode.innerHTML = resp.connect_code;
        tokenForm.style.visibility = 'hidden';
        changeTokenButton.style.visibility = 'visible';
      },
      (_error) => {
        phoenixStatus.innerHTML = 'Phoenix connection failed.';
        retryPhoenixButton.style.visibility = 'visible';
      }
    );
}

tokenForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newToken = tokenInput.value;
  window.electronAPI.setClientToken(newToken);
  // clientCode.innerHTML = newCode;
  tokenForm.style.visibility = 'hidden';
  changeTokenButton.style.visibility = 'visible';
});

changeTokenButton.addEventListener('click', () => {
  tokenForm.style.visibility = 'visible';
  changeTokenButton.style.visibility = 'hidden';
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

initializeSlippiConnection();
initializePhoenixConnection();
