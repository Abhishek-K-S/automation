import { View, Text } from 'react-native'
import CustomText from '../components/CustomText'
import { createStackNavigator } from '@react-navigation/stack'
import DeviceList from '../components/DeviceList';
import { Colors, PredefinedStyles } from '../constants/style';

const AuthNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator initialRouteName='Devices' screenOptions={{cardStyle: PredefinedStyles.darkBackground, headerStyle: {backgroundColor: Colors.midDark}, headerTitleStyle: {color: Colors.light}}}>
        <Stack.Screen name='Devices' component={DeviceList}/>
    </Stack.Navigator>
  )
}

export default AuthNavigator