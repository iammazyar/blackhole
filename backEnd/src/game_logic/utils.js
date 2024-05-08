const { height } = require('../constants')


function distanceCalculator(x1, y1, x2, y2){
    return Math.hypot(x2-x1, y2-y1);
} 

function velocityCalculator(x1, y1, x2, y2){
    const angle = Math.atan2(
        y2 - y1,
        x2 - x1
    );
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
    return velocity;
}

async function starterPosition(){
    const radius = Math.random()*(height/2-50);
    if(radius < 2925) return starterPosition();
    const teta = (Math.random()-0.5)*Math.PI;
    return {x: radius*Math.cos(teta), y: radius*Math.sin(teta)}
}

module.exports = { distanceCalculator, velocityCalculator, starterPosition };