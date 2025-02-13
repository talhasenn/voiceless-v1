const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "join") {
            if (!clients[data.channel]) clients[data.channel] = [];
            clients[data.channel].push(ws);
        }

        // Broadcast WebRTC messages (offer/answer/ICE candidates)
        if (["offer", "answer", "candidate"].includes(data.type)) {
            clients[data.channel].forEach(client => {
                if (client !== ws) client.send(JSON.stringify(data));
            });
        }
    });

    ws.send('Welcome to the WebSocket server!');
});

// Ensure localStream is initialized
let localStream;

async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        console.log("Microphone access granted.");
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

startMedia();