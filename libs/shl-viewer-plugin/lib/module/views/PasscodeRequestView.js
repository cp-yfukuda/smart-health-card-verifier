import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
const PasscodeRequestView = _ref => {
  let {
    onEntered,
    onCancel
  } = _ref;
  const [passCode, setPasscode] = useState('');
  const [error, setError] = useState('');
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
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.description
  }, "Enter 6 digit number"), /*#__PURE__*/React.createElement(TextInput, {
    style: styles.input,
    placeholder: "Enter passcode",
    keyboardType: "numeric",
    secureTextEntry: true,
    value: passCode,
    onChangeText: handlePasscodeChange
  }), error ? /*#__PURE__*/React.createElement(Text, {
    style: styles.error
  }, error) : null, /*#__PURE__*/React.createElement(Button, {
    title: "Submit",
    onPress: handleSubmit
  }), /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: _onCancel,
    style: styles.cancelButton
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.cancelButtonText
  }, "Cancel")));
};
const styles = StyleSheet.create({
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
export default PasscodeRequestView;
//# sourceMappingURL=PasscodeRequestView.js.map