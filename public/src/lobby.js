

const createLobbyBtn = document.getElementById("createLobbyBtn");
const lobbyInput = document.getElementById("roomName");
createLobbyBtn.onclick = () => {
    const lobbyId = crypto.randomUUID();
    // Skicka hosten till spelsidan med ett nyskapats lobbyId
    window.location.href = `game.html?lobbyId=${lobbyId}`;
}

const joinBtn = document.getElementById("joinBtn");
const joinInput = document.getElementById("entryPeer");
joinBtn.onclick = () => {
    window.location.href = `game.html?entryPeer=${joinInput.value}`;
}
