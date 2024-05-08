const express = require('express');
const path = require('path');


const gameRouter = express.Router();

gameRouter.use(express.static(path.join(__dirname, '..', '..', 'public', 'gameView')));

//gameRouter.get('/', getGameController);



module.exports = gameRouter; 