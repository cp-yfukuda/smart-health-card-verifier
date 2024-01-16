/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useRef, useEffect, Suspense } from 'react'
import { ModuleService } from '~/services/module/ModuleService' 
import remoteConfig from '~/models/RemoteConfig'
import LoadingSpinner from '~/components/LoadingSpinner'
import type { SHCVerifierOption, SHCVerifierType } from 'shc-verifier-plugin'
import type { ParserInitOption } from 'parser-sdk'
import { getIssuerData } from "~/helpers/getIssuerData"
import { getAcceptedVaccineCodes, 
        getSystemCodeLabel, 
        getAcceptedSystemCode,
        isAcceptedLabResult,
        getVaccineCodesHash,
       } from '~/helpers/getFHIRCodes'
import { useTranslation } from '../services/i18n/i18nUtils'


interface ModuleDataType{
  isLoaded: boolean
}

// Declaring the state object globally.

const defaultState: ModuleDataType = {
  isLoaded: false 
}

const moduleContext = React.createContext({
  ...defaultState
})

export const useModuleContext = ()=>{
  return useContext( moduleContext )
}


export function getProvider () {
  interface Props {
    children: React.ReactNode
  }

  const Provider = ({ children }: Props): JSX.Element =>  {
    const [ state, setState ] = useState( defaultState )
    const moduleService = ModuleService.getModuleService()
    const { t } = useTranslation();
    const parserOption  = {
      useLegacy: remoteConfig.useLegacy,
      getIssuer: async (verifierKey: string, issuer: string)=> {
        return getIssuerData( verifierKey, issuer)
      },
      getAcceptedVaccineCodes: getAcceptedVaccineCodes,
      getAcceptedSystemCode: getAcceptedSystemCode, 
      isAcceptedLabResult: isAcceptedLabResult,
      getSystemCodeLabel: getSystemCodeLabel,
      getVaccineCodesHash: getVaccineCodesHash,
    } as ParserInitOption

    const option: SHCVerifierType = {
      shc: parserOption,
      getTranslationFunction: ()=> t
    }


    useEffect( ()=>{
      moduleService.initialize( option )
      .then( ()=> {
          setState({
            ...state,
            isLoaded: true
          })
        })
    }, [])

    return  (
        ( state.isLoaded )? 
        (
          <moduleContext.Provider value={ { ...state } } >
            { 
              ( state.isLoaded ) && children
            }
          </moduleContext.Provider>
        ):(
          < LoadingSpinner enabled={ true } /> 
        )                 

    )
  }
  return [ Provider ] as const 
}
