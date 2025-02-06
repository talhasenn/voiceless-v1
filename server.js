const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
   
    console.log(`received: ${message}`);
    ws.send('Message received');
  });

  ws.send('Welcome to the WebSocket server!');
});
