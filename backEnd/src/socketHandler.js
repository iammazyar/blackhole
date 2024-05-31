const { distanceCalculator, velocityCalculator, starterPosition } = require('./game_logic/utils')
const { isMainThread, workerData, Worker } = require('worker_threads');
const { Player, BlackHole } = require('./game_logic/player');
const { height } = require('./constants');
const { War } = require('./game_logic/war')

const ROOMS = {}


module.exports = function(io){
    ROOMS['test_room'] = new War('test', new BlackHole(0, 0))
    io.on('connection', socket => {
        let player;
        socket.on('initGame', async (name) => {
            const position = await starterPosition();
            player = new Player(socket.id, position.x, position.y);
            ROOMS['test_room'].serverPlayers.push(player);
            ROOMS['test_room'].clientPlayers[socket.id] = {
                name: name,
                x: position.x,
                y: position.y,
                color: player.color,
                radius: player.radiusCalculator.radius,
                level: player.levelCalculator.level,
                power: player.powerCalculator.power
            };
            socket.emit('clientPlayer', ROOMS['test_room'].clientPlayers[socket.id]);
        });

        socket.on('velocity', data => {
            if(player.velocityCalculator.mouseVelocity){
                data.x /= Math.hypot(data.x, data.y)
                data.y /= Math.hypot(data.x, data.y)
                player.velocityCalculator.updateMouseVelocity(data);
            }
        });
        
        socket.on('disconnect', (reason) => {
            console.log(reason, socket.id);
            const index = ROOMS['test_room'].serverPlayers.findIndex((p) => {
                return p.id === socket.id;
            });
        
            if(index >= 0){
                ROOMS['test_room'].serverPlayers.splice(index, 1);
                delete ROOMS['test_room'].clientPlayers[socket.id]
            } 
            io.emit('updatePlayers', ROOMS['test_room'].clientPlayers)
        })
    });
    setInterval(async () => {
        if(ROOMS['test_room'].serverPlayers.length){
            await ROOMS['test_room'].conditionCheck();
            io.emit('updatePlayers', ROOMS['test_room'].clientPlayers);
        }  
    }, 15);
}
