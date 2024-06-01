const { velocityCalculator, distanceCalculator } = require('./utils')

class War { 

    constructor(roomName, blackHole){
        this.name = roomName;
        this.blackHole = blackHole;
        this.serverPlayers = [];
        this.clientPlayers = {};
        this.maximumRadius = 0;
        this.maximumDensity = 0;
    }

    forceCalculator(player1, player2){
        const speedCoefficient = player1.speedCoefficientCalculator.speedCoefficient;
        const r1 = player1.radiusCalculator.radius;
        const p1 = player1.powerCalculator.power;
        const x1 = player1.positionCalculator.x;
        const y1 = player1.positionCalculator.y;

        const r2 = player2.radiusCalculator.radius;
        const p2 = player2.powerCalculator.power;
        const x2 = player2.positionCalculator.x;
        const y2 = player2.positionCalculator.y;

        const dist = distanceCalculator(x1, y1, x2, y2);
        const velocity = velocityCalculator(x1, y1, x2, y2);

        const powerRatio = p2 / (p1 + p2);
        const normalDist = 1 - Math.max(0, (7.8*r2+2.6*r1 - dist) / (7.8*r2+2.6*r1));
        const force = speedCoefficient * powerRatio * (1.5 * Math.exp(-0.4*3*normalDist)) * (r1 / this.maximumRadius);
        return {x:force*velocity.x, y:force*velocity.y};
    }

    async updatePlayer(player){
        
        player.update();
        // after update the players properties then we update the players object that we send to all clients
        this.clientPlayers[player.id].x = player.positionCalculator.x;
        this.clientPlayers[player.id].y = player.positionCalculator.y;
        this.clientPlayers[player.id].radius = player.radiusCalculator.radius;
        this.clientPlayers[player.id].level = player.levelCalculator.level;
        this.clientPlayers[player.id].power = player.powerCalculator.power;
    }

    async conditionCheck(){
        this.blackHole.update(this.maximumRadius, this.maximumDensity);
        this.maximumDensity = 0
        this.maximumRadius = 0
        for(let i = this.serverPlayers.length - 1; i >= 0; i--){
            const player1 = this.serverPlayers[i];
            this.maximumRadius = Math.max(player1.radiusCalculator.radius, this.maximumRadius);
            this.maximumDensity = Math.max(player1.densityCalculator.density, this.maximumDensity);
            await this.updatePlayer(player1);

            const distToBlackHole = distanceCalculator(player1.positionCalculator.x, player1.positionCalculator.y, this.blackHole.x, this.blackHole.y);
            if(distToBlackHole < 7.8*this.blackHole.radiusCalculator.radius + 2.6*player1.radiusCalculator.radius){
                const force = this.forceCalculator(player1, this.blackHole);
                player1.velocityCalculator.updateForceVelocity(force)
            }
            if(distToBlackHole < this.blackHole.radiusCalculator.radius + player1.radiusCalculator.radius){
                console.log("hit")
                this.serverPlayers.splice(i, 1);
                delete this.clientPlayers[player1.id];
                continue;
            }
            for(let j=i-1; j >= 0; j--){
                const player2 = this.serverPlayers[j];
                const dist = distanceCalculator(player1.positionCalculator.x, player1.positionCalculator.y, 
                                                player2.positionCalculator.x, player2.positionCalculator.y);
                const maxR1R2 = Math.max(player1.radiusCalculator.radius, player2.radiusCalculator.radius)
                const minR1R2 = Math.min(player1.radiusCalculator.radius, player2.radiusCalculator.radius)
                
                if(dist < 2.6*minR1R2 + 7.8*maxR1R2){
    
                    const force1 = this.forceCalculator(player1, player2);
                    const force2 = this.forceCalculator(player2, player1);
                    player1.velocityCalculator.updateForceVelocity(force1);
                    player2.velocityCalculator.updateForceVelocity(force2);
                    
                if(dist < maxR1R2){
                    if( player2.radiusCalculator.radius / player1.radiusCalculator.radius > 1.05 ){

                        player2.radiusCalculator.radius += player1.radiusCalculator.radius;
                        this.serverPlayers.splice(i, 1);
                        delete this.clientPlayers[player1.id];                       
                        break;
                    }
                    else if(player1.radiusCalculator.radius / player2.radiusCalculator.radius > 1.05){
                        player1.radiusCalculator.radius += player2.radiusCalculator.radius;
                        this.serverPlayers.splice(j, 1);
                        delete this.clientPlayers[player2.id];
                        continue;                             
                    }
                    else {
                        if(player2.levelCalculator.level / player1.levelCalculator.level > 1){
                            player2.radiusCalculator.radius += player1.radiusCalculator.radius;
                            this.serverPlayers.splice(i, 1);
                            delete this.clientPlayers[player1.id];                       
                            break;
                        }
                        else if(player1.levelCalculator.level / player2.levelCalculator.level > 1){
                            player1.radiusCalculator.radius += player2.radiusCalculator.radius;
                            this.serverPlayers.splice(j, 1);
                            delete this.clientPlayers[player2.id];
                            continue;   
                        }
                        else{
                            const angle = Math.random()*2*Math.PI;
                            player1.positionCalculator.x += 9*player2.radiusCalculator.radius*Math.cos(angle);
                            player1.positionCalculator.y += 9*player2.radiusCalculator.radius*Math.sin(angle);
                            player2.positionCalculator.x += 9*player1.radiusCalculator.radius*Math.cos(angle);
                            player2.positionCalculator.y += 9*player1.radiusCalculator.radius*Math.sin(angle);
                            //break;
                            //player2.x += 300*Math.cos(angle)
                        }
                    }
                }
                    
                }
            }
        }
        return true;
    }
}

module.exports = {
    War
}