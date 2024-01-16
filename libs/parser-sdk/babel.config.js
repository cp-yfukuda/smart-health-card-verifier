module.exports = {
  presets: ['@babel/preset-env',
            'module:metro-react-native-babel-preset',
            ],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./"],
        extensions: ['.tsx', '.d.ts','.ts', '.js', '.json'],
        alias: {
          "test": "./__test__",
          "~": "./src",
          "parser-sdk": "./src/index"
        }
      }
    ]
  ]
}
