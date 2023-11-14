const path = require('path');
const pak_sdk =  require('./libs/parser-sdk/package.json');
const pak_shc =  require('./libs/shc-verifier-plugin/package.json');
const pak_shl =  require('./libs/shl-viewer-plugin/package.json');
const jws_utils =  require('./libs/jws-utils/package.json');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    "@babel/plugin-proposal-export-namespace-from",
    [
      'module-resolver',
      {
        extensions: ['.json','.tsx', '.ts', '.js', '.json', '.d.ts'],
        alias: {
          "~": "./src",
          [pak_sdk.name]: path.join(__dirname, 'libs', pak_sdk.name),
          [pak_shc.name]: path.join(__dirname, 'libs', pak_shc.name),
          [pak_shl.name]: path.join(__dirname, 'libs', pak_shl.name),
          [jws_utils.name]: path.join(__dirname, 'libs', jws_utils.name),
        },
      },
    ],
  ],
};
