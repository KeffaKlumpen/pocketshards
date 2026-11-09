import { PeerMesh } from "../peerMesh.js";

const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get("lobbyId");
const directEntryPeer = urlParams.get("entryPeer");

document.getElementById("shareLink").onclick = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("entryPeer", peerMesh.peer.id);
    await navigator.clipboard.writeText(shareUrl.toString());
}

const peerMesh = new PeerMesh();
async function resolveHostPeerId() {
    if (directEntryPeer) {
        console.log("Använder direkt entryPeer från URL:", directEntryPeer);
        peerMesh.joinMesh(directEntryPeer);
    } else {
        peerMesh.createLobby();
    }
};
resolveHostPeerId();