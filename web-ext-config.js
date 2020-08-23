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
      'https://sonash-kibana.dev.soluto.npr.aws.asurion.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-4h,mode:quick,to:now))&_a=(columns:!(_source),index:AWfq8r7CEXT7aK6X1o5n,interval:auto,query:(match_all:()),sort:!(\'@timestamp\',desc))',
      'about:debugging',
    ],
  },
  ignoreFiles: [ 'package-lock.json' ],
};
