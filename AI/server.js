// server.js — run with `node server.js`
// npm install ws
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

// rooms mapping: roomId -> array of sockets
const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch (e) { return; }
    const { type, room, payload } = data;
    if (!room) return;

    rooms[room] = rooms[room] || [];

    if (type === 'join') {
      ws.room = room;
      rooms[room].push(ws);
      // notify existing peers someone joined
      rooms[room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'peer-joined' }));
        }
      });
    } else {
      // forward signaling message (offer/answer/candidate) to the other peers
      rooms[room].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type, payload }));
        }
      });
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter((c) => c !== ws);
      if (rooms[ws.room].length === 0) delete rooms[ws.room];
    }
  });
});

console.log('Signaling server running on ws://localhost:3000');