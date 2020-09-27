const path = require('path');

require('dotenv').config();

const startUrl = [ 'about:devtools-toolbox?type=extension&id=%7Bbbef878a-de01-414f-b2fe-fd736c32caa1%7D' ];

if ( process.env.KIBANA_URL ) {
  startUrl.push( process.env.KIBANA_URL );
}

module.exports = {
  verbose: true,
  sourceDir: path.join(__dirname, 'dist'),
  artifactsDir: path.join(__dirname, 'build'),
  build: {
    overwriteDest: true,
  },
  run: {
    startUrl,
  },
  ignoreFiles: [ 'package-lock.json' ],
};
