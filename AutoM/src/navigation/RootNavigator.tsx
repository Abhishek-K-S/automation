import { NavigationContainer } from '@react-navigation/native'
import AuthNavigator from './AuthNavigator';
import NonAuth from '../screens/NonAuth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import React from 'react';
import { RemoteServer, getSavedDomain } from '../storage/storage';
import { changeDomain } from '../store/domainReducer';
import CustomView from '../components/CustomView';
import { Image, View } from 'react-native';
import { PredefinedStyles } from '../constants/style';
import CrazyHeading from '../components/CrazyHeading';
import { connectToSocket } from '../utils/socket';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';

export default function RootNavigator(): JSX.Element{
  const isAuth = useSelector((state:RootState)=>state.domain.auth) !== null
  const [loading, setLoading] = React.useState<boolean>(true);
  const [savedUrl, setSavedUrl] = React.useState<string|null>(null)

  console.log('auth has changed', isAuth)

  const disp = useDispatch()
  React.useEffect(()=>{
      RemoteServer.getSavedUrl().then(val=>{
        if(val && val.length) {
          setSavedUrl(val);
          connectToSocket(val, ()=>{
            getSavedDomain().then(val=>{
                if(val) disp(changeDomain(val))
                setTimeout(()=>setLoading(false), 100)
            })
          })
        }
        else{
          setLoading(false)
        }
      })
  }, [])

  const removeAuth = () =>{
    disp(changeDomain({domainName: "", auth: ""}))
    setLoading(false)
  }
  
  return loading? 
    <View style={PredefinedStyles.center}> 
        <CrazyHeading>LOADING...</CrazyHeading>
        {savedUrl && <CustomText>Connecting: {savedUrl}</CustomText>}
        <View style={{maxHeight: 60, marginTop: 30}}>
          <CustomButton text='Change Domain' type='neutral' handler={removeAuth}></CustomButton>
        </View>
    </View>
   :
  (
    <NavigationContainer>
      {isAuth? <AuthNavigator/>: <NonAuth/>}
    </NavigationContainer>
  )
}