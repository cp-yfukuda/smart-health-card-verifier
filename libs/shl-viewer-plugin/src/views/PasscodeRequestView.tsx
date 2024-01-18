import React, { useState } from 'react'
import { View, TextInput, Text, Button, StyleSheet,
  TouchableOpacity } from 'react-native';

type PasscodeRequestViewProp = {
  onEntered:(number: string ) => void 
  onCancel:()=> void
}

const PasscodeRequestView: React.FC<PasscodeRequestViewProp> = ({onEntered, onCancel } ) => {
  const [ passCode, setPasscode ] = useState<string>('')
  const [ error, setError ] = useState<string>('')
  const handlePasscodeChange = (text) => {
    setPasscode(text);
    console.info(`changed == ${text}`)
    setError(''); // Clear error message when the user starts typing
  };

  const handleSubmit = () => {
    if (passCode.trim() === '') {
      setError('Please enter a passcode.');
    } else {
      onEntered( passCode.trim() );
    }
  };
  const _onCancel = ()=> {
    onCancel();
  }
  
  return  <View style={styles.container}>
      <Text style={styles.description}>Enter 6 digit number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter passcode"
        keyboardType="numeric"
        secureTextEntry
        value={passCode}
        onChangeText={handlePasscodeChange}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Submit" onPress={handleSubmit} />
      <TouchableOpacity onPress={_onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

    </View>;
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '80%',
    textAlign: 'center',
  },
  description: {
    fontSize: 20
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  cancelButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'blue',
  },
  cancelButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  }
});

export default PasscodeRequestView;
