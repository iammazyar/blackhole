const socket  = require('socket.io');
const fs = require('fs');
const http = require('http');
const app = require('./src/app');
const socketHandler = require('./src/socketHandler');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

function startServer(){

    const io = socket(server, {
        pingInterval: 2000,
        pingTimeout: 5000,
        cors: {
            origin: ["https://iammazyar.github.io","http://localhost:3000"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["polling", "websocket"],
    });

    server.listen(PORT, () => {
        `Listenig on port ${PORT}`
    });

    socketHandler(io);
}

startServer(); 


