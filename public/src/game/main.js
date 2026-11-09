import { PeerMesh } from "../peerMesh.js";

const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get("lobbyId");
const directEntryPeer = urlParams.get("entryPeer");

document.getElementById("shareLink").onclick = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("entryPeer", peerMesh.peer.id);
    await navigator.clipboard.writeText(shareUrl.toString());
}

const peerListElement = document.getElementById("peerList");
const peerMesh = new PeerMesh();
peerMesh.addEventListener('peerchange', (event) => {
    const freshPeerList = event.detail.peers;
    updatePeerUI(freshPeerList);
});
document.getElementById("disconnectBtn").onclick = () => {
    peerMesh.disconnect();
}

function updatePeerUI(peers) {
    peerListElement.innerHTML = '';

    if (peers.length === 0) {
        const fallback = document.createElement('span');
        fallback.className = 'no-peers-msg';
        fallback.textContent = 'Waiting for peers to join...';
        peerListElement.appendChild(fallback);
        return;
    }

    const fragment = document.createDocumentFragment();

    peers.forEach(peerId => {
        const item = document.createElement('div');
        item.className = 'peer-node';
        item.id = `peer-${peerId}`;
        item.textContent = `🟢 Node: ${peerId}`;
        fragment.appendChild(item);
    });

    peerListElement.appendChild(fragment);
}

async function resolveHostPeerId() {
    if (directEntryPeer) {
        console.log("Använder direkt entryPeer från URL:", directEntryPeer);
        peerMesh.joinMesh(directEntryPeer);
    } else {
        peerMesh.createLobby();
    }
};
resolveHostPeerId();