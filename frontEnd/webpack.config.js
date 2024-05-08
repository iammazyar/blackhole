const path = require('path');
//const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        path.join(__dirname, 'asset/js/index.js')
    ],

    output: {
        path: path.join(__dirname, '..', 'backEnd/src/public/gameView'),
        filename: 'bundle.gameView.js'
    },

    devServer: {
        static: path.join(__dirname, '..', 'backEnd/src/public'),
        port: 3000
    },

    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            
        ]
    }
}/* {
    test: /\.js/,
    exclude: /node_modules/,
    use: ['eslint-loader']
} */