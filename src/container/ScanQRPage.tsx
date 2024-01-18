import React, { useState, useEffect, ReactElement } from 'react'
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions'
import { Platform, View, StyleSheet, Animated, Easing, Alert, useWindowDimensions, PixelRatio } from 'react-native'
import { useNetInfo } from '@react-native-community/netinfo'
import BarCodeScanner from '../components/BarCodeScanner'
import AppClickableImage from '../components/customImage'
import NotificationOverlay from '../components/notificationOverlay'
import { BaseResponse, ErrorCode } from 'parser-sdk'
import { Props,  } from '../types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from '../services/i18n/i18nUtils'
import MarkerLayerSVG from '../../assets/img/scanqr/markerlayer.svg'
import { InvalidError } from 'parser-sdk'
import { RecordType } from '../../libs/shc-verifier-plugin/src/services/fhir/fhirTypes'
import { ModuleService } from '../services/module/ModuleService'

const images = {
  leftCaret: require('../../assets/img/verificationresult/left-caret.png'),
  loading: require('../../assets/img/error/loading.png'),
  switchCamera: require('../../assets/img/scanqr/switch-camera.png'),
}

const isAndroid = Platform.OS?.toLowerCase() === 'android'
const cameraPermissionType = (isAndroid)? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA

interface markerPosition {
  left: number
  top: number
  width: number
  height: number
}

const ScanQRPage = ({ navigation }: Props) => {
  const { t } = useTranslation()
  const [ customViews, setCustomViewsIntenal ] = useState<any[]>([]);
  const [ qrData, setQRData ] = useState<string|null>(null);
  const { height, width }   = useWindowDimensions()
  const [ hasConnection, setHasConnection ] = useState<boolean>( true )
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false)
  const [scanned, setScanned] = useState<boolean>(false)
  const [markerShift, setMarkerShift] = useState<markerPosition>({ left: 0, top: 0, width:width, height:height })
  const [spinAnimation, setSpinAnimation] = useState(new Animated.Value(0))
  const [cameraType, setCameraType] = useState(BarCodeScanner.Constants.Type.back)
  const { isInternetReachable } = useNetInfo()
  const showCamera = hasCameraPermission && isInternetReachable && !scanned

  const insets = useSafeAreaInsets()
  let windowWidth  = 0
  let windowHeight = 0
  const markerLayerHeight: any = 273
  const markerLayerWidth: any  = 127
  let markerLayerOffsetTop  = 0
  let markerLayerOffsetLeft = 0

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })


  const setCustomViews = ( views: ReactElement[] )=> {
    setCustomViewsIntenal( views );
  }

  const updateConnection = ()=>{
    console.log( `isInternetReachable: ${isInternetReachable}` )
    setHasConnection( !( isInternetReachable === false ) )
  }

  const configureMarkerSizes = ( _width: number, _height: number) => {
    windowWidth  = _width
    windowHeight = _height
    let ratio = windowWidth / markerLayerWidth
    let tmpMarkerLayerHeight    = ( markerLayerHeight * ratio )
    let tmpMarkerLayerWidth     = windowWidth

    markerLayerOffsetTop =  (windowHeight - tmpMarkerLayerHeight) / 2
    if ( markerLayerOffsetTop > 0  ) {
      markerLayerOffsetTop = 0 
      ratio = _height / markerLayerHeight
      tmpMarkerLayerWidth     = markerLayerWidth * ratio
      tmpMarkerLayerHeight    = _height
      markerLayerOffsetLeft = ( _width - tmpMarkerLayerWidth ) / 2
    }
    const shiftPosition = { 
      'left': Math.floor(markerLayerOffsetLeft), 
      'top': Math.floor(markerLayerOffsetTop),
      'width': Math.ceil(tmpMarkerLayerWidth),
      'height': Math.ceil(tmpMarkerLayerHeight) }
    setMarkerShift( shiftPosition )
  }
  useEffect(()=> {
    console.info(`customView changed ${customViews.length}`)
  }, [customViews])
  useEffect(() => {
    updateConnection()
  }, [ isInternetReachable ] )


  useEffect(() => {

    configureMarkerSizes(width, height);

    (async () => {
      if ( isAndroid ) {
        var result = await check(cameraPermissionType) 
        if ( result !== RESULTS.GRANTED) {
          Alert.alert(
            t('Scan.CameraPermission', 'Camera Permission'),
            t('Scan.CameraPermissionText', 'Camera Permission Description'),
            [
              {
                text: t('Common.Cancel'),
                onPress: () => navigation.navigate('Welcome'),
                style: 'cancel',
              },
              {
                text: t('Common.OK'),
                onPress: async () => {
                  result = await request( cameraPermissionType )
                  setHasCameraPermission(result === RESULTS.GRANTED)
                },
              },
            ],
            { cancelable: false },
          )
        } else {
          result = await request( cameraPermissionType )
          setHasCameraPermission(result === RESULTS.GRANTED )
        }
      } else {
        result = await request( cameraPermissionType )
        setHasCameraPermission(result === RESULTS.GRANTED)
      }
    })()
  }, [])

  useEffect( () => {
    if( qrData ) {
      validateData( qrData )
    }
  }, [qrData])

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
    setScanned(true)
    setQRData(data)
  }

  const validateData = async ( data: string ) => {
   let validationResult: BaseResponse = {
      isValid: false,
      recordType: RecordType.unknown,
      errorCode:0,
      issuedDate: null,
      issuerData: {
        iss: '',
        logo_uri: '',
        name: '',
        updated_at: 0,
        url: '',
      },
      patientData: {
        dateOfBirth: '',
        names: [],
      },
      recordEntries: [],
    }



    try {
      const parser = await ModuleService.getModuleService().getParser([data])
      if( parser ) {
        validationResult = await parser.validate([data], setCustomViews.bind(this) )
        if ( validationResult  && validationResult.isValid === true ) {
          navigation.navigate({ name: 'ScannedResult', params: { validationResult } })
          return
        }
      }
      navigation.navigate('Error')
      return 

    } catch (error: any) {
      console.info("#YF error = " + error )
      if (error instanceof InvalidError) {
        validationResult.isValid = false
        validationResult.errorCode = error.errorCode
        navigation.navigate({ name: 'ScannedResult', params: { validationResult } })
        return
      }

      if (error.toString() === 'Error: Failed to download issuer JWK set') {
        validationResult.isValid = false

        navigation.navigate({ name: 'ScannedResult', params: { validationResult } })
        return
      }

      if (error === ErrorCode.SERVER_ERROR) {
        navigation.navigate('Welcome')
        alert(t('Error.ServerError', 'Server Error Please try to scan again'))

        return
      }

      navigation.navigate('Error')
    }
  }

  const renderAccessError = () => {
    if (!hasCameraPermission)
      return <NotificationOverlay type={ 'noCameraAccess' } navigation={ navigation } />
  }

  return (
    <View style={ styles.container }>
      <View style={ styles.scannerContainer }>
        { renderAccessError() }

        { !hasConnection && (
          <NotificationOverlay type={ 'noInternetConnection' } navigation={ navigation } />
        ) }

        { scanned && (
          <Animated.Image
            style={ [styles.spinner, { transform: [{ rotate: spin }] }] }
            source={ images.loading }
          />
        ) }

        { showCamera && (
          <View style={ styles.viewContainer } >
            <BarCodeScanner
              onBarCodeScanned={ scanned ? undefined : handleBarCodeScanned }
              type={ cameraType }
              styles={ styles.qrScannerContainer }
            />
            <View style={ styles.markerLayerContaier }>
              { ( markerShift.left < 0 ) ?
                ( <MarkerLayerSVG  height={ markerShift.height } width={ markerShift.width } style={ { 'left': markerShift.left } } /> )
                :
                ( <MarkerLayerSVG height={ markerShift.height } width={ markerShift.width } style={ { 'top': markerShift.top } } /> )
              }
            </View>
            <View style={ [styles.backButtonContainer, { top : ( insets.top +  styles.backButtonContainer.top) }] }>
              <AppClickableImage
                styles={ styles.leftCaretImage }
                source={ images.leftCaret }
                onPress={ () => navigation.navigate('Welcome') }
              />
            </View>
            <View style={ styles.switchCameraContainer }>
              <AppClickableImage
                styles={ styles.switchCameraImage }
                source={ images.switchCamera }
                onPress={ () => {
                  setCameraType(
                    cameraType === BarCodeScanner.Constants.Type.back
                      ? BarCodeScanner.Constants.Type.front
                      : BarCodeScanner.Constants.Type.back,
                  )
                } }
              />
            </View>
          </View>

        ) }
        {customViews.length > 0 && <View style={ styles.customViewContainer } >
          { customViews }
          </View> }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  viewContainer: {
    position: 'absolute',
    top: 0,
    left:0,
    width: '100%',
    height: '100%'
  },
  customViewContainer:{
    position: 'absolute',
    top: 0,
    left:0,
    backgroundColor: '#FF0000',
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  qrScannerContainer: {
    flex:1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '100%',
    height: '100%'
  },
  backButtonContainer: {
    position:'absolute',
    top: 20,
    left: 20,
    height: 40,
    paddingLeft: 20,
  },
  markerLayerContaier: {
    position: 'absolute',
    top:0,
    left:0,
    width: '100%',
    height: '100%'
  },
  switchCameraContainer: {
    position: 'absolute',
    right: 50,
    bottom: 60,
  },
  spinner: {
    maxHeight: 55,
    maxWidth: 55,
  },
  leftCaretImage: {
    width: 12,
    height: 19,
  },
  switchCameraImage: {
    width: 48,
    height: 41,
  },
  barCodeScanner: {
    top: 0,
    bottom: 0
  }
})

export default ScanQRPage
