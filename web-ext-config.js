const path = require('path');

module.exports = {
  verbose: true,
  sourceDir: path.join(__dirname, 'dist'),
  artifactsDir: path.join(__dirname, 'build'),
  build: {
    overwriteDest: true,
  },
  run: {
    startUrl: [
      'about:devtools-toolbox?type=extension&id=%7Bbbef878a-de01-414f-b2fe-fd736c32caa1%7D',
      'https://sonash-kibana.na.soluto.prd.aws.asurion.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now%2Fd,mode:quick,to:now%2Fd))&_a=(columns:!(_source),index:AWgf2fG2vwdl8RvS0PWT,interval:auto,query:(match_all:()),sort:!(\'@timestamp\',desc))',
    ],
  },
  ignoreFiles: [ 'package-lock.json' ],
};
