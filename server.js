const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let clients = {}; // Store connected clients per channel

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle messages from clients
    console.log(`received: ${message}`);
    ws.send('Message received');
  });

  ws.send('Welcome to the WebSocket server!');
});
