const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
// npm i the above
module.exports = {
  entry: {
    main:  './src/index.js'
  },
  output: {

    path: path.join(__dirname, 'dist'),
    publicPath: '',
    filename: '[name].js'
  },
  mode: 'development',
  target: 'web',
  devtool: '#source-map',
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false

        }
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',{"targets": { node: "10" }}],
              ],
              "plugins": [
                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                ["@babel/plugin-syntax-dynamic-import"],
              ],
            }
        }
      },
      {
        // Loads the javacript into html template provided.
        // Entry point is set below in HtmlWebPackPlugin in Plugins
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            //options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
       test: /\.(png|svg|jpg|gif)$/,
       use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/html/index.html",
      filename: "./index.html",
      excludeChunks: [ 'server' ]
    }),
    //fileName of service account json matches serviceAccount def in js
    // bin/confs.sh  gets 'min.js' files (3) from git submodule
    new CopyWebpackPlugin([
      { from: 'src/js/service-account.json', to: ''},
      { from: 'src/js/service-account.json', to: '../functions'},
      { from: 'configs/encoderWorker.min.js', to: ''},
      { from: 'configs/encoderWorker.min.wasm', to: ''},
      { from: 'configs/recorder.min.js', to: ''}
]),

  ]
}
