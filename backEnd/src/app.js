const express = require('express');
const cors = require('cors');
const helmet = require('helmet');


const gameRouter = require('./routes/game/game.route');

const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
    //crossOriginResourcePolicy: false
}));

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*'
}));
app.use(express.json());


app.use('/', gameRouter);

// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'mainView', 'index.html'));
// });

module.exports = app;
 
