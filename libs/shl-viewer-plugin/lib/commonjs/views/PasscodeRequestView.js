"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const PasscodeRequestView = _ref => {
  let {
    onEntered,
    onCancel
  } = _ref;
  const [passCode, setPasscode] = (0, _react.useState)('');
  const [error, setError] = (0, _react.useState)('');
  const handlePasscodeChange = text => {
    setPasscode(text);
    console.info(`changed == ${text}`);
    setError(''); // Clear error message when the user starts typing
  };

  const handleSubmit = () => {
    if (passCode.trim() === '') {
      setError('Please enter a passcode.');
    } else {
      onEntered(passCode.trim());
    }
  };
  const _onCancel = () => {
    onCancel();
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.description
  }, "Enter 6 digit number"), /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, {
    style: styles.input,
    placeholder: "Enter passcode",
    keyboardType: "numeric",
    secureTextEntry: true,
    value: passCode,
    onChangeText: handlePasscodeChange
  }), error ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.error
  }, error) : null, /*#__PURE__*/_react.default.createElement(_reactNative.Button, {
    title: "Submit",
    onPress: handleSubmit
  }), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    onPress: _onCancel,
    style: styles.cancelButton
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cancelButtonText
  }, "Cancel")));
};
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '80%',
    textAlign: 'center'
  },
  description: {
    fontSize: 20
  },
  error: {
    color: 'red',
    marginBottom: 10
  },
  cancelButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'blue'
  },
  cancelButtonText: {
    color: 'blue',
    textDecorationLine: 'underline'
  }
});
var _default = PasscodeRequestView;
exports.default = _default;
//# sourceMappingURL=PasscodeRequestView.js.map