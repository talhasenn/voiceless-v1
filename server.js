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
