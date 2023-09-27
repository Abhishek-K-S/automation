import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import DeviceList from '../screens/DeviceList';
import { Colors, PredefinedStyles } from '../constants/style';
import HeaderRight from '../components/HeaderRight';
import NonAuth from '../screens/NonAuth';
import PumpDeviceView from '../screens/PumpDeviceView';

const AuthNavigator = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator initialRouteName='Devices' screenOptions={{
      cardStyle: PredefinedStyles.darkBackground,
      headerRight: ()=>(<HeaderRight/>),
      headerStyle: {
        backgroundColor: Colors.midDark
      }, 
      headerTintColor: Colors.light,
      cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
      headerTitleStyle: {
        color: Colors.light
      }}}>
        <Stack.Screen name='ChangeDomain' component={NonAuth}/>
        <Stack.Screen name='Devices' component={DeviceList}/>
        <Stack.Screen name='OperateDevice' component={PumpDeviceView}/>
    </Stack.Navigator>
  )
}

export default AuthNavigator