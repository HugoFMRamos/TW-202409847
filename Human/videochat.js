
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const myIdSpan = document.getElementById('my-id');
const idFriendInput = document.getElementById('id-friend');
const btnCall = document.getElementById('btn-call');

let myId = null;
let streamLocal = null;
let pc; // PeerConnection
let ws; // Signaling WebSocket
        
// STUN configuration (Necessary to find the "paths")
const stunConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
    };

// Connect to our signaling server
// Connect to the WebSocket server. What is the correct URL?
ws = new WebSocket('ws://localhost:8080/')

ws.onopen = () => {
    console.log('Connected to the signaling server');
};

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    // What do we do when we receive each type of message?
    switch (data.type) {
        case 'your-id':
            myId = data.id;
            myIdSpan.textContent = myId;
            startMedia(); // Only turn on the camera after you have ID
            break;
        case 'offer': // Someone is calling us.
            // Which function should we call?
            handleOffer(data.payload, data.senderId);

            break;
        case 'answer': // Our offer was accepted
            // Which function should we call?
            handleAnswer(data.payload);

            break;
        case 'ice-candidate': // Recebemos um caminho de rede
            // Which function should we call?
            handleIceCandidate(data.payload);

            break;
    }
};

// Utility function for sending messages via WebSocket.
function sendSignal(targetId, type, payload) {
    ws.send(JSON.stringify({
        targetId: targetId,
        type: type,
        payload: payload
    }));
}

// Start Camera
    async function startMedia() {
        streamLocal = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = streamLocal;
}

// Create Peer Connection 
function createPeerConnection() {
    // How do we initialize the main WebRTC object that will manage the entire P2P connection?
    pc = new RTCPeerConnection(stunConfig);

    // What to do when the other peer sends us their video
    pc.ontrack = (event) => {
        // Remote video/audio has arrived! What do we do with it?
        remoteVideo.srcObject = event.streams[0];

        console.log('Remote track received');
    };

    // What to do when WebRTC encounters a path (ICE Candidate)?
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            // Our browser found a "path" (candidate)
            // We need to send this "path" to the other peer
            sendSignal(idFriendInput.value, 'ice-candidate', event.candidate);
            
        }
    };

    // Add our video to the link so the other person can see it
    streamLocal.getTracks().forEach(track => {
        pc.addTrack(track, streamLocal);
    });
}
        
// LOGIC OF THE CALLER (Call Button)

btnCall.addEventListener('click', async () => {
    console.log('Calling:', idFriendInput.value);
    
    createPeerConnection();

    // Create "Offer"
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send the offer to the other peer
    sendSignal(idFriendInput.value, 'offer', offer);
});

// LOGIC OF THE PERSON RECEIVING THE CALL

async function handleOffer(offer, senderId) {
    console.log('Receiving an offer from:', senderId);
    // If we receive an offer, we save the friend's ID
    idFriendInput.value = senderId; 
    
    createPeerConnection();
    
    // We are RECEIVING a call. We need 4 steps:

    // 1. Define the "Offer" we received as the "remote description"
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // 2. Create the "Response" (Answer)
    const answer = await pc.createAnswer();

    // 3. Define the "Response" as our "local description"
    await pc.setLocalDescription(answer);

    // 4. Send the Response back to the "caller"
    sendSignal(senderId, 'answer', answer);
}

// LOGIC OF THE CALLER (Upon receiving the answer)

async function handleAnswer(answer) {
    console.log('Answer received');
    // Our "Offer" has been accepted!
    // Define the response we received
    await pc.setRemoteDescription(new RTCSessionDescription(answer));

}

// LOGIC OF BOTH (Upon receiving network paths)

async function handleIceCandidate(candidate) {
    console.log('ICE candidate received');
    try {
        // We received a "path" (candidate) from the other peer
        // Add the network path to our connection
        await pc.addIceCandidate(new RTCIceCandidate(candidate));

    } catch (e) {
        console.error('Error adding ICE candidate', e);
    }
}