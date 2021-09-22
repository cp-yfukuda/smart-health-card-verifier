import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Animated, Easing, Alert } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Device from 'expo-device'
import { ErrorCode } from '../services/error'
import { Props } from '../types'
import AppClickableImage from '../components/customImage'
import NotificationOverlay from '../components/notificationOverlay'

import { validate } from '../services/qr'

const images = {
  leftCaret: require('../../assets/img/verificationresult/left-caret.png'),
  loading: require('../../assets/img/error/loading.png'),
  switchCamera: require('../../assets/img/scanqr/switch-camera.png'),
}

const ScanQRPage = ({ navigation }: Props) => {
  const [hasPermission, setHasPermission] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [spinAnimation, setSpinAnimation] = useState(new Animated.Value(0))
  const [cameraType, setCameraType] = React.useState(BarCodeScanner.Constants.Type.back)

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  useEffect(() => {
    ;(async () => {
      const OS = Device.osName?.toLowerCase()

      if (OS === 'android') {
        const permission = await BarCodeScanner.getPermissionsAsync()

        if (!permission.granted) {
          Alert.alert(
            'Camera Permission',
            'This app uses the camera to scan QR codes with COVID-19 vaccine certificates. This allows verifiers to verify the authenticity of COVID-19 vaccine certificates presented to them.',
            [
              {
                text: 'Cancel',
                onPress: () => navigation.navigate('Welcome'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  const { status } = await BarCodeScanner.requestPermissionsAsync()
                  setHasPermission(status === 'granted')
                },
              },
            ],
            { cancelable: false },
          )
        } else {
          const { status } = await BarCodeScanner.requestPermissionsAsync()
          setHasPermission(status === 'granted')
        }
      } else {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        setHasPermission(status === 'granted')
      }
    })()
  }, [])

  navigation.addListener('focus', () => {
    setScanned(false)
  })

  navigation.addListener('blur', () => {
    setScanned(true)
  })

  if (scanned) {
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    let validationResult = {}

    try {
      setScanned(true)
      validationResult = await validate([data])

      if (!validationResult || validationResult.isValid === 'false') {
        navigation.navigate('Error')
        return
      }

      navigation.navigate({ name: 'VerificationResult', params: { validationResult } })
    } catch (error) {
      if (error.toString() === 'Error: Failed to download issuer JWK set') {
        validationResult.isValid = false

        navigation.navigate({ name: 'VerificationResult', params: { validationResult } })
        return
      }

      if (error === ErrorCode.SERVER_ERROR) {
        navigation.navigate('Welcome')
        alert('Server Error. Please try to scan again.')

        return
      }

      navigation.navigate('Error')
    }
  }

  const { isInternetReachable } = useNetInfo()

  const showCamera = hasPermission && isInternetReachable && !scanned

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        {/* TODO: Cover scenario when camera permissions disallowed later.
            NOTE: The below shows our modal behind system's modal. */}
        {!hasPermission && <NotificationOverlay type={'noCameraAccess'} navigation={navigation} />}

        {isInternetReachable === false && (
          <NotificationOverlay type={'noInternetConnection'} navigation={navigation} />
        )}

        {scanned && (
          <Animated.Image
            style={[styles.spinner, { transform: [{ rotate: spin }] }]}
            source={images.loading}
          />
        )}

        {showCamera && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            type={cameraType}
          >
            <View style={styles.backButtonContainer}>
              <AppClickableImage
                styles={styles.leftCaretImage}
                source={images.leftCaret}
                onPress={() => navigation.navigate('Welcome')}
              />
            </View>

            <View style={styles.switchCameraContainer}>
              <AppClickableImage
                styles={styles.switchCameraImage}
                source={images.switchCamera}
                onPress={() => {
                  setCameraType(
                    cameraType === BarCodeScanner.Constants.Type.back
                      ? BarCodeScanner.Constants.Type.front
                      : BarCodeScanner.Constants.Type.back,
                  )
                }}
              />
            </View>
          </BarCodeScanner>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#F3F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '100%',
  },
  backButtonContainer: {
    marginTop: '15%',
    height: 40,
    paddingLeft: 20,
    paddingTop: 20,
  },
  spinner: {
    maxHeight: 55,
    maxWidth: 55,
  },
  leftCaretImage: {
    width: 12,
    height: 19,
  },
  switchCameraContainer: {
    position: 'absolute',
    right: 50,
    bottom: 60,
  },
  switchCameraImage: {
    width: 48,
    height: 41,
  },
})

export default ScanQRPage
