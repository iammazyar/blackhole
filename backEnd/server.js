const socket  = require('socket.io');
const fs = require('fs');
const https = require('https');
const app = require('./src/app');
const socketHandler = require('./src/socketHandler');

const PORT = process.env.PORT || 3000;

const server = https.createServer({
    key: fs.readFileSync('dev_key.pem'),
    cert: fs.readFileSync('dev_cert.pem')
}, app);

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


