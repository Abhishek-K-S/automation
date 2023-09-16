import { NavigationContainer } from '@react-navigation/native'
import AuthNavigator from './AuthNavigator';
import NonAuth from '../components/NonAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import React from 'react';
import { getSavedDomain } from '../storage/storage';
import { changeDomain } from '../store/domainReducer';

export default function RootNavigator(): JSX.Element{
  const isAuth = useSelector((state:RootState)=>state.domain.domainName) !== null

  const disp = useDispatch()
  React.useEffect(()=>{
      getSavedDomain().then(val=>{
          if(val) disp(changeDomain(val))
      })
  }, [])
  
  return (
    <NavigationContainer>
      {isAuth? <AuthNavigator/>: <NonAuth/>}
    </NavigationContainer>
  )
}