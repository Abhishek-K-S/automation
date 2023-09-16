import { SafeAreaView} from 'react-native';
import { PredefinedStyles } from './src/constants/style';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import Store from './src/store/store';
import React from 'react';
import { getSavedDomain } from './src/storage/storage';
import { changeDomain } from './src/store/domainReducer';

export default function App() {
  return (
      <>
        <StatusBar style='light' translucent={false}/>
        <SafeAreaView style={[PredefinedStyles.fullHeight, PredefinedStyles.darkBackground]} >
          <Provider store={Store}>
            <RootNavigator/>
          </Provider>
        </SafeAreaView>
      </>
  );
}
