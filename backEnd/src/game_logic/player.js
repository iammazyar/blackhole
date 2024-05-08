const { width, height } = require('../constants');

class VelocityCalculator {

    constructor(){
        this.forceVelocity = {x: 0, y: 0};
        this.mouseVelocity = {x: 0, y: 0};
        this.totalVelocity = {x: 0, y: 0};
    }
    updateMouseVelocity(mouseVelocity){
        this.mouseVelocity = mouseVelocity;
    }
    updateForceVelocity(forceVelocity){
        this.forceVelocity = forceVelocity;
    }
    updateTotalVelocity(speedCoefficient){
        this.totalVelocity.x = speedCoefficient * this.mouseVelocity.x + this.forceVelocity.x;
        this.totalVelocity.y = speedCoefficient * this.mouseVelocity.y + this.forceVelocity.y;
    }

}

class LevelCalculator {
    constructor(){
        this.level = 1;
    }
    updateLevel(elapsedTime, timeForLevelUp){
        this.level += Math.floor(elapsedTime / (timeForLevelUp[this.level] * 60));
    }

}

class SpeedCalcualCalculator {
    constructor(){
        this.speedCoefficient = undefined;
    }
    updateSpeed(radius){
        this.speedCoefficient = 16 - 15 * radius/(width/4 - 2700/2);
    }

}

class TimeCalculator {

    constructor(){
        this.createdTime = new Date();
        this.elapsedTime = 0;
    }
    updateElapsedTime(){
        this.elapsedTime = ( new Date() - this.createdTime ) / 1000;
    }

}

class ColorCalculator {
    constructor(){
        this.red = undefined;
        this.green = undefined;
        this.blue = undefined;
    }

    color(){
        this.red = Math.random();
        this.green = Math.random();
        this.blue = Math.random();
        if( this.red + this.green + this.blue < 0.05) return this.color();
        return {
            red: this.red,
            green: this.green,
            blue: this.blue
        }
    }

}

class RadiusCalculator {

    constructor(initR){
        this.radius = initR //radius
        this.distToCenter = undefined;
    }
    updateRadius(x, y){
        this.distToCenter = Math.hypot(x, y);
        if(this.distToCenter - this.radius * 2.6 > 2700){
            this.radius += (this.distToCenter - 2700)*0.015/(Math.hypot(width/2, height/2)-2700)/2;   
        }
        else {
            this.radius = Math.max(this.radius - (2700 - this.distToCenter)*0.06/2700, 25/2);   
        }
    }

}

class DensityCalculator {
    constructor(){
        this.density = 1;
    }
    updateDensity(elapsedTime){
        this.density  += Math.sqrt(elapsedTime); 
    }

}

class PowerCalculator {
    constructor(initP){
        this.power = initP;
    }
    updatePower(radius, density){
        this.power = density * Math.pow(radius, 3);
    }

}

class PositionCalculator {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    updatePosition(velocity, radius){
        if(this.x + radius * 2.6 >= width/2 && velocity.x > 0 || 
            this.x - radius * 2.6 <= -width/2 && velocity.x < 0){

            velocity.x = 0;
        }
        if(this.y + radius * 2.6 >= height/2 && velocity.y > 0 ||
            this.y - radius * 2.6 <= -height/2 && velocity.y < 0){
            velocity.y = 0;
        }
        this.x += velocity.x;
        this.y += velocity.y;
    }
}

class Player {
    constructor(id, x, y){
        this.timeForLevelUp = [0, 2, 5, 10, 17, 28, 41, 58, 77, 90]
        this.id = id;
        this.color =  new ColorCalculator().color();
        this.positionCalculator = new PositionCalculator(x, y);
        this.elapsedTimeCalculator = new TimeCalculator();
        this.velocityCalculator = new VelocityCalculator();
        this.speedCoefficientCalculator = new SpeedCalcualCalculator();
        this.radiusCalculator = new RadiusCalculator(25);
        this.densityCalculator = new DensityCalculator();
        this.levelCalculator = new LevelCalculator();
        this.timeCalculator = new TimeCalculator();
        this.powerCalculator =  new PowerCalculator(1);
    }
    
    update(){
        this.elapsedTimeCalculator.updateElapsedTime();
        this.radiusCalculator.updateRadius(this.positionCalculator.x, this.positionCalculator.y);
        this.speedCoefficientCalculator.updateSpeed(this.radiusCalculator.radius);
        this.velocityCalculator.updateTotalVelocity(this.speedCoefficientCalculator.speedCoefficient);
        this.densityCalculator.updateDensity(this.elapsedTimeCalculator.elapsedTime);
        this.powerCalculator.updatePower(this.radiusCalculator.radius, this.densityCalculator.density);
        this.levelCalculator.updateLevel(this.elapsedTimeCalculator.elapsedTime, this.timeForLevelUp);
        this.positionCalculator.updatePosition(this.velocityCalculator.totalVelocity, this.radiusCalculator.radius);
        this.velocityCalculator.updateForceVelocity({x:0, y:0})
    }
}

class BlackHole {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.positionCalculator = new PositionCalculator(x, y)
        this.radiusCalculator = new RadiusCalculator(300);
        this.timeCreated = new Date();
        this.density = 4;
        this.powerCalculator = new PowerCalculator(1);
    }
    updateRadius(maximumRadius){
        this.radiusCalculator.radius = 300 + maximumRadius;
    }
    updateDensity(maximumDensity){
        this.density = 2 * maximumDensity + 0.1;
    }
    updatePower(){
        this.powerCalculator.power = this.density*Math.pow(this.radiusCalculator.radius, 3);
    }
 
    update(maximumRadius, maximumDensity){
        //this.elapsedTimeCalculator();
        this.updateRadius(maximumRadius);
        this.updateDensity(maximumDensity);
        this.updatePower();
    }
}

module.exports = { Player, BlackHole };