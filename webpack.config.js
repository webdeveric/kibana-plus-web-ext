const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'cheap-source-map',
  target: 'web',
  entry: {
    background: './src/background',
    contentScript: './src/contentScript',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    crossOriginLoading: 'anonymous',
  },
  optimization: {
    minimize: isProd,
    runtimeChunk: {
      name: 'runtime',
    },
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        loader: 'file-loader',
        options: {
          name: 'icons/[name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.css' ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new SriPlugin({
      hashFuncNames: [ 'sha256', 'sha384' ],
      enabled: isProd,
    }),
    new HtmlWebpackPlugin({
      showErrors: true,
      chunks: [ 'browser-action' ],
      filename: 'browser-action.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      template: path.resolve(__dirname, 'src', 'templates', 'react.ejs'),
      title: 'Kibana ➕',
    }),
    new HtmlWebpackPlugin({
      showErrors: true,
      chunks: [ 'background' ],
      filename: 'background.html',
      inject: 'head',
      meta: {
        viewport: false,
      },
      title: 'Kibana ➕ background script',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'manifest.json'),
          to: path.join(__dirname, 'dist', 'manifest.json'),
        },
      ],
    }),
    new WebpackAssetsManifest({
      integrity: true,
      entrypoints: true,
      output: 'assets-manifest.json',
      customize(entry, original, manifest, asset) {
        if ( entry.key.endsWith('.map') ) {
          return false;
        }

        return {
          value: {
            size: asset && asset.size(),
            integrity: asset && asset.integrity,
          },
        };
      },
    }),
  ],
};

module.exports = config;
