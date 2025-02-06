const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let clients = {}; // Store connected clients per channel

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

    ws.on("close", () => {
        for (const channel in clients) {
            clients[channel] = clients[channel].filter(client => client !== ws);
        }
    });
});
