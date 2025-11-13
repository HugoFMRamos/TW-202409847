// server.js
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

console.log('Signaling server running on port 8080');

// We use a Map to link user IDs to your WebSocket.
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected');

    // When a customer calls, they need an ID
    const clientId = uuidv4(); // Function to generate an ID.
    clients.set(clientId, ws);
    
    // Send the clients his own ID
    ws.send(JSON.stringify({ type: 'your-id', id: clientId }));

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Invalid message:', message);
            return;
        }

        // The server's job is ONLY to forward the message
        // for the target client ('targetId')
        
        const targetClient = clients.get(data.targetId);
        
        if (targetClient && targetClient.readyState === 1) { // 1 = OPEN
            console.log(`Redirected "${data.type}" message from ${clientId} to ${data.targetId}`);
            
            // Forward the message, but add the sender
            targetClient.send(JSON.stringify({
                type: data.type,
                payload: data.payload,
                senderId: clientId 
            }));
        } else {
            console.warn(`Client ${data.targetId} not found or not ready.`);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(clientId);
    });
});

// Function to generate IDs
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}