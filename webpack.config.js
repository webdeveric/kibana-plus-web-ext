const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const WebpackAssetsManifest = require('webpack-assets-manifest');
const ESLintPlugin = require('eslint-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'inline-source-map',
  target: 'web',
  entry: {
    background: './src/background',
    contentScript: './src/contentScript',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    crossOriginLoading: 'anonymous',
    publicPath: '',
  },
  optimization: {
    minimize: false,
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
    new ESLintPlugin({
      emitWarning: true,
      extensions: [ 'js', 'ts' ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new SubresourceIntegrityPlugin({
      hashFuncNames: [ 'sha256', 'sha384' ],
      enabled: isProd,
    }),
    new HtmlWebpackPlugin({
      minify: false,
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
      integrityPropertyName: 'sri',
      entrypoints: true,
      output: 'assets-manifest.json',
      customize(entry, original, manifest, asset) {
        if ( entry.key.endsWith('.map') ) {
          return false;
        }

        return {
          value: {
            size: asset && asset.source.size(),
            integrity: asset && asset.info.sri,
          },
        };
      },
    }),
  ],
};

module.exports = config;
