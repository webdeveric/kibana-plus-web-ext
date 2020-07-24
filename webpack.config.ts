import * as path from 'path';
import * as webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const isProd: boolean = process.env.NODE_ENV === 'production';

const config: webpack.Configuration = {
  mode: isProd ? 'production' : 'development',
  entry: {
    'kibana-plus': './src/kibana-plus',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'manifest.json'),
          to: path.join(__dirname, 'dist', 'manifest.json'),
        },
      ],
    }),
  ],
};

export default config;
