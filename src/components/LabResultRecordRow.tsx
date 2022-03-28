import React from 'react'
import { Text, View, FlatList, StyleSheet} from 'react-native'
import { RecordEntry } from '../types'
import { useTranslation } from '../services/i18n/i18nUtils'
import { Table, TableWrapper, Cell, Row} from 'react-native-table-component'
import FontStyle from '../utils/FontStyleHelper'
import { BaseResponse } from '../types'
import { toCamel } from '../utils/utils'
import LabTestSVG from '../../assets/img/verificationresult/labResultIcon.svg'




export const getResultTitle = ( windowWidth: number, responseData: BaseResponse ):any => {
    const { t } = useTranslation()
    const getResultCode = ( responseData: BaseResponse ): string => {
      let resultStr = "UNKNOWN"
      let resultkey = "UNKNOWN"
      let entry = responseData.recordEntries ?? []
      if( entry.length > 0 && entry[0].observationResult  ) {
        resultStr =  entry[0].codableConseptLabel
        resultKey =  [entry[0].codableConseptKey, entry[0].codableConseptCode].join("_")
      }
      console.log("LabResultKey: " + resultKey )
      return t( `LabResult.${resultKey}`, resultStr )
    }

    const getResultTitle = ( responseData: BaseResponse ): string => {
      let resultStr = "UNDEFINED";
      let resultkey = "UNKNOWN"
      let entry = responseData.recordEntries ?? []
      if( entry.length > 0 && entry[0].systemName  ) {
        resultStr =  entry[0].systemName
        resultKey = [entry[0].systemKey, entry[0].systemCode].join("_")
      }
      return t( `LabResult.Title_${resultKey}`, resultStr )
    }

    const imageWidth = windowWidth / 3;
    console.log( 'imageWidth = ' + imageWidth );
    console.log("getResultTitle: get lab Result " + JSON.stringify( responseData ))
    const fieldTitle = (<View style={styles.titleRow}> 
      <Text style={styles.testTitle} >{getResultTitle( responseData) }</Text>
      </View>);
    const fieldResult = ( <View style={ [styles.titleRow, styles.tagContainer] }>
        <View key="1"  style={styles.tag}>
          <Text style={styles.tagContent}>{ getResultCode(responseData) }</Text>
        </View>
        <View key="2"  style={styles.tag}>
          <Text  style={styles.tagContent}>{ t("LabResult.tagCovid19","COVID-19") }</Text>
        </View>
      </View>);
    return ( <View style={ styles.topTitleContainer }>
      <View style={ [{ width:imageWidth }]}>
        <LabTestSVG width={ imageWidth } height={ imageWidth }/>
      </View>
      <View style={styles.topTitleContent}>
        <View style={styles.titleTable}>
          {fieldTitle}
          {fieldResult}
        </View>
      </View>
    </View> );
}

export default ( { recordEntries } : RecordEntry[] | any) => {
  const { t } = useTranslation()
  
  const displayField = 
    [
     {
       'propName': 'status'
     },
     { 'propName':'securityCode'
     },
     {
       'propName': 'performer'
     }
    ];

  function cellAdapter( field:any, data: any ):any[]{
    return [
      <View key="1">
        <Text
          style={ [
                  styles.fieldTitle,
                  FontStyle.OpenSans_400Regular
                ] }>
          {  t(`Result.Lab.${field.propName}`,field.propName ) }
        </Text>
      </View>,
      <View>
        <Text
           style={ [
                  styles.fieldValue,
                  styles.increaseFont,
                  FontStyle.OpenSans_700Bold
                ] }
          >{  data[field.propName] }
        </Text>
      </View>
    ]
  }

  function recordAdapter( data:any ) {
    const { securityCode, performer, observationDate, systemName, index } = data
    return (
         displayField.map(( field:any, key:any ) => {
          return (  
            <View key={key}>
              { cellAdapter(field, data ) }
            </View> )
        })
    )
  }


  return  ( 
    <View>
      <View style={ styles.divider } />

      { recordEntries.map((entry:any, key: any )=>{
         return recordAdapter( entry)
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    width:"100%",
    alignContent:'space-around',
    flexDirection: 'row'
  },
  testTitle: {
    fontSize: 24,
    color: "#1F2025"
  },
  titleTable: {
    width: "100%",
    height:"100%",
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    justifyContent: 'space-evenly',
    alignContent:'space-around',
  },
  titleRow: {
    flexShrink:1,
    justifyContent: 'space-evenly',
    width: "100%",
    alignItems:"center",
  },
  tag: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 5,
    flexShrink:1,
    alignContent: "space-between",
    justifyContent: "space-evenly",
    color: '#FFFFFF',
    backgroundColor: '#4D72B5'
  },
  tagContent: {
    ...FontStyle.Poppins_700Bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  topTitleContent: {
    flex:1,
  },
  topTitleContainer: {
    flexDirection: 'row',
    flex:1
  },
  tableStyle: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fieldValue: {
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#484848',
  },
  fieldTitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6A6A6C',
  },
  itemContainer: {
    width: ""
  },
  itemHalf: {
    width: "100%"
  },
  itemFull: {
    width: "50%"
  },
  increaseFont: {
    fontSize: 16,
  },
  divider: {
    borderBottomColor: '#C6C6C6',
    borderBottomWidth: 1,
    width: '100%',
    marginTop: 14,
    marginBottom: 14,
  },

})
