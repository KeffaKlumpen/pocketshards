import { Peer } from "./peerjs/peerjs.min.js";

const peerConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:free.expressturn.com:3478',
            username: '000000002108492650',
            credential: 'pGblr6Sgj6o6mLOJjl9QckoJlWY=',
        }
    ],
    debug: 2
}

export class PeerMesh extends EventTarget {
    constructor() {
        super();
        this.peer = null;
        this.connections = new Map(); // Store open DataConnections: peerId -> connection
    }

    createLobby() {
        this.peer = new Peer(peerConfig);

        this.peer.on('open', (id) => {
            console.log(`My peer ID is: ${id}`);

            this.peer.on('connection', (conn) => {
                this.#setupConnection(conn);
            });
        });
    }

    joinMesh(entryId) {
        this.peer = new Peer(peerConfig);

        this.peer.on('open', (id) => {
            console.log(`My peer ID is: ${id}`);

            this.peer.on('connection', (newConn) => {
                this.#setupConnection(newConn);
            });

            const entryConn = this.peer.connect(entryId);
            this.#setupConnection(entryConn);
        });
    }

    disconnect() {
        if (!this.peer) return;

        this.connections.forEach(conn => {
            conn.close();
        });
        this.connections.clear();

        this.peer.disconnect();
        this.peer.destroy();

        this.#emitPeerUpdate();
    }

    #setupConnection(newConn) {
        if (this.connections.has(newConn.peer)) return;

        this.connections.set(newConn.peer, newConn);

        newConn.on('open', () => {
            console.log(`Connected directly to: ${newConn.peer}`);

            this.#broadcast({
                type: 'MESH_SYNC',
                peers: Array.from(this.#peerList())
            });
            this.#emitPeerUpdate();
        });

        newConn.on('data', (data) => {
            if (data && data.type === 'MESH_SYNC') {
                this.#handleMeshSync(data.peers);
            }
        });

        newConn.on('close', () => {
            console.log(`Connection closed with: ${newConn.peer}`);
            this.connections.delete(newConn.peer);
            this.#emitPeerUpdate();
        });

        newConn.on('error', (err) => {
            console.error(`Connection error with ${newConn.peer}:`, err);
            this.connections.delete(newConn.peer);
            this.#emitPeerUpdate();
        });
    }

    #handleMeshSync(receivedPeers) {
        let discoveredNewPeer = false;

        console.log("Recieved peerList", receivedPeers);

        receivedPeers.forEach(peerId => {
            // Don't connect if already known, and only connect to younglins
            if (peerId < this.peer.id && !this.connections.has(peerId)) {
                console.log(`Discovered new peer via mesh sync: ${peerId}`);

                var outConn = this.peer.connect(peerId);
                this.#setupConnection(outConn);
                discoveredNewPeer = true;
            }
        });

        if (discoveredNewPeer) {
            this.#broadcast({
                type: 'MESH_SYNC',
                peers: this.#peerList(),
            });
        }
    }

    // 5. Helper to broadcast arbitrary data to every node in the mesh
    #broadcast(data) {
        this.connections.forEach(conn => {
            if (conn.open) {
                conn.send(data);
            }
        });
    }

    #peerList() {
        return [...this.connections.keys(), this.peer.id];
    }

    #emitPeerUpdate() {
        this.dispatchEvent(new CustomEvent('peerchange', {
            detail: { peers: Array.from(this.connections.keys()) }
        }));
    }
}

function updateUrlParams() {
    const url = new URL(window.location.href);
    const peerIds = connectedPeers.map(conn => conn.peer);

    // Inkludera även ditt eget ID i listan om det finns
    if (myPeerId) {
        peerIds.unshift(myPeerId);
    }

    url.searchParams.set("peers", peerIds.join(","));
    window.history.replaceState({}, "", url.toString());
}
