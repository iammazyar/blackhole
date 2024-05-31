import io from 'socket.io-client';
import { Application, Container } from 'pixi.js';
import { Galaxy } from './player/galaxy';
import { BlackHole } from './blackhole/blackhole';
import { Template } from './template/template';
import { totalWidth, totallHeight, width, height } from './constants';
import { gsap } from "gsap";

document.getElementById("Leaderboard").style.display = 'none';
const canvas = document.getElementById("gameCanvas");
//'https://localhost:3000'
const socket = io();

let gameScene, template, app, blackhole,
    topVerticalGridAxis, positionRefiner, scaleCoherent, players,
    myPosition, velocity;



topVerticalGridAxis = 0.5;//the height of screen in glsl is in a range of -0.5 to 0.5 at first. we use this variable to change the zooming of the gamescene if the player gets too big 
positionRefiner = 1.0;

scaleCoherent = {
    value: 1
};
    
players = {};

myPosition = {
    x:0,
    y:0
};

velocity = {
    x:0,
    y:0
};

gameScene = new Container();
gameScene.pivot.set(totalWidth/2 - width/2, totallHeight/2 - height/2);
function distanceCalculator(x1, y1, x2, y2){
    return Math.hypot(x2-x1, y2-y1);
}

function refinePosition(myPosition, otherPosition){
    const position = {};
    position.x = otherPosition.x - myPosition.x;
    position.y = otherPosition.y - myPosition.y;
    return position;
}

function loadApp(){

    topVerticalGridAxis = 0.5;//the height of screen in glsl is in a range of -0.5 to 0.5 at first. we use this variable to change the zooming of the gamescene if the player gets too big 
    positionRefiner = 1.0;

    scaleCoherent = {
        value: 1
    };
    
    players = {};

    myPosition = {
        x:0,
        y:0
    };

    velocity = {
        x:0,
        y:0
    };

    gameScene = new Container();
    gameScene.pivot.set(totalWidth/2 - width/2, totallHeight/2 - height/2);
    app = new Application(
        {   
            view: canvas,
            width: innerWidth,
            height: innerHeight,
            transparent: true, 
            antialias: true,
        }
    );
    app.renderer.view.style.position = 'absolute';
    app.stage.addChild(gameScene);
    document.body.appendChild(app.view);   
    
}

function gameLoop(delta) {
    template.update();
    blackhole.update();
    for(const id in players){
        players[id].update();
    }
    
    const dist = distanceCalculator(myPosition.x/positionRefiner, myPosition.y/positionRefiner, 0, 0);
    if(dist < 7.8*blackhole.radius + 2.6*players[socket.id].radius){
        
        gsap.to(scaleCoherent, {
            value: 8,
            duration: 0.015*100*2,
            ease: "power4"
        });
       
        positionRefiner = 1/scaleCoherent.value;
        template.updateScale(scaleCoherent.value);
        blackhole.updateScale(scaleCoherent.value);
        //topVerticalGridAxis = 0.5*scaleCoherent.value;
        for(const user in players){
            players[user].updateScale(scaleCoherent.value);
        }
    }
    else if(2.6*players[socket.id].radius/height > 2*topVerticalGridAxis ){

        const po = Math.floor(2.6*players[socket.id].radius/height);
        gsap.to(scaleCoherent, {
            value: Math.pow(2.0, po),
            duration: 0.015*100*2,
            ease: "power4"
        });
        positionRefiner = 1/scaleCoherent.value;
        template.updateScale(scaleCoherent.value);
        blackhole.updateScale(scaleCoherent.value);
        topVerticalGridAxis = 0.5*scaleCoherent.value;
        for(const user in players){
            players[user].updateScale(scaleCoherent.value);
        }
    }
    else{
        gsap.to(scaleCoherent, {
            value: 1,
            duration: 0.015*100*2,
            ease: "power4"
        });
        positionRefiner = 1/scaleCoherent.value;
        template.updateScale(scaleCoherent.value);
        blackhole.updateScale(scaleCoherent.value);
        topVerticalGridAxis = 0.5*scaleCoherent.value;
        for(const user in players){
            players[user].updateScale(scaleCoherent.value);
        }
    }
}

socket.on('clientPlayer', clientPlayer => {
    
    myPosition.x = clientPlayer.x * positionRefiner;
    myPosition.y = clientPlayer.y * positionRefiner;
    players[socket.id] = new Galaxy(0, 0, clientPlayer.radius, clientPlayer.color, clientPlayer.level);
    console.log(players)
    blackhole = new BlackHole(-myPosition.x, -myPosition.y, 300);
    template = new Template(-myPosition.x, -myPosition.y);
    gameScene.addChild(players[socket.id].galaxyShader.mesh, players[socket.id].levelUpShader.mesh, template.mesh, blackhole.mesh);
    
    app.ticker.add(gameLoop);

    window.addEventListener("resize", () => {
        app.renderer.resize(width, height);
    });
    
    window.addEventListener("mousemove", (event) => {
    
        let angle = Math.atan2(
            event.y - height/2,
            event.x - width/2
        );
        
        velocity.x = Math.cos(angle);
        velocity.y = Math.sin(angle);
        socket.emit('velocity',velocity);
    })
});

socket.on('updatePlayers', serverPlayers => {
    document.getElementById('playerLabels').innerHTML = "";
    let sortedPlayersbyPower = [];
    for (const id in serverPlayers){
        const serverPlayer = serverPlayers[id];
        sortedPlayersbyPower.push({name:serverPlayer.name, power:serverPlayer.power});

        if(!players[id]){
            const position = refinePosition(myPosition, {x: serverPlayer.x * positionRefiner, y: serverPlayer.y * positionRefiner});
            players[id] = new Galaxy(position.x, position.y, serverPlayer.radius, serverPlayer.color, serverPlayer.level);
            gameScene.addChild(players[id].galaxyShader.mesh);
            gameScene.addChild(players[id].levelUpShader.mesh);
        }else{
            if(id !== socket.id){
                const position = refinePosition(myPosition, {x: serverPlayer.x * positionRefiner, y: serverPlayer.y * positionRefiner});
                gsap.to(players[id], {
                    x: position.x,
                    y: position.y,
                    radius: serverPlayer.radius,
                    duration: 0.015
                });
                players[id].newLevel = serverPlayer.level;
                //players[id].update();
            }
            else{
               
                myPosition.x = serverPlayer.x * positionRefiner;
                myPosition.y = serverPlayer.y * positionRefiner;
                
                gsap.to(players[id], {
                    radius: serverPlayer.radius,
                    duration: 0.015
                });
                players[id].newLevel = serverPlayer.level;
                
                gsap.to(template, {
                    x: -myPosition.x,
                    y: -myPosition.y,
                    duration: 0.015
                });
                gsap.to(blackhole, {
                    x: -myPosition.x,
                    y: -myPosition.y,
                    duration: 0.015
                });
                
            }
        }
    }
    sortedPlayersbyPower.sort((a,b) => {
        return b.power - a.power;
    });
    sortedPlayersbyPower.forEach((player, index) => {
        document.getElementById('playerLabels').innerHTML += `<div>${index+1}-${player.name}</div>`
    });
    for (const id in players) {
        if (!serverPlayers[id]) {
           
            gameScene.removeChild(players[id].galaxyShader.mesh);
            gameScene.removeChild(players[id].levelUpShader.mesh);
            players[id].galaxyShader.mesh.visible = false;
            players[id].levelUpShader.mesh.visible = false;
            delete players[id];
            if(id === socket.id){
                app.ticker.remove(gameLoop)
                document.body.removeChild(app.view);  
                document.getElementById("usernameForm").style.display = 'block';
                document.getElementById("Leaderboard").style.display = 'none';
                window.removeEventListener("resize", () => {
                    app.renderer.resize(width, height);
                });
                
                window.removeEventListener("mousemove", (event) => {
                
                    let angle = Math.atan2(
                        event.y - height/2,
                        event.x - width/2
                    );
                    
                    velocity.x = Math.cos(angle);
                    velocity.y = Math.sin(angle);
                    socket.emit('velocity',velocity);
                })
            }
        }
    }
});

document.getElementById("usernameForm").addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById("usernameInput").value;
    document.getElementById("usernameForm").style.display = 'none';
    document.getElementById("Leaderboard").style.display = 'block';
    loadApp();
    console.log("init")
    socket.emit('initGame', name);
});

