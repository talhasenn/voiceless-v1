const socket = new WebSocket("ws://localhost:8080");
const peerConnections = {};
const constraints = { audio: true };
let localStream;

document.getElementById("joinChannel").addEventListener("click", () => {
    const channel = document.getElementById("channelName").value;
    if (channel) joinVoiceChannel(channel);
});

document.getElementById("leaveChannel").addEventListener("click", () => {
    leaveVoiceChannel();
});

async function joinVoiceChannel(channel) {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);

    socket.send(JSON.stringify({ type: "join", channel }));

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        if (data.type === "offer") {
            const peer = createPeerConnection(data.channel);
            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: "answer", answer, channel: data.channel }));
        }

        if (data.type === "answer") {
            await peerConnections[data.channel].setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        if (data.type === "candidate") {
            await peerConnections[data.channel].addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    const peer = createPeerConnection(channel);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: "offer", offer, channel }));

    document.getElementById("status").innerText = `Connected to: ${channel}`;
}

function createPeerConnection(channel) {
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });


    if (localStream) {
        localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    }

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate, channel }));
        }
    };

    peer.ontrack = (event) => {
        console.log("Received remote track:", event.streams[0]);
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);
    };

    peerConnections[channel] = peer;
    return peer;
}

function leaveVoiceChannel() {
    for (const channel in peerConnections) {
        if (peerConnections[channel]) {
            peerConnections[channel].close();
            delete peerConnections[channel];
        }
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    document.getElementById("status").innerText = "Disconnected";
}

function toggleMute() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        }
    }
}
