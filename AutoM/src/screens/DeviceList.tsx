import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import CustomView from '../components/CustomView'
import CustomText from '../components/CustomText'
import CrazyHeading from '../components/CrazyHeading'
import { FlatList } from 'react-native'
import { Colors, PredefinedStyles } from '../constants/style'
import { socketEmit } from '../utils/socket'
import { WithoutAuth, socketEndpoints } from '../shared/constants'
import { useSelector } from 'react-redux'
import { getAuthSelector } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import CustomButton from '../components/CustomButton'
import { socketListener } from '../utils/socketEventListener'
// import { getRequestObj } from '../utils/utils'

type deviceListItem = {deviceId: string, type: string}

type propType = StackNavigationProp<{
  PumpDevice: {device: string}, 
  DefaultDevice: {device: string}
}>

const DeviceList = () => {
  console.log('loading the component\n')
  // const [devices, setDevices] = React.useState<deviceListItem[]>([]);
  const [devices, setDevices] = React.useState<deviceListItem[]>([{deviceId: 'helloooooooooooo', type: "pump"}]);

  const authSelector = useSelector(getAuthSelector)

  React.useEffect(()=>{
    socketListener.addListener(socketEndpoints.deviceList, (data: WithoutAuth<deviceListItem[]>)=>{
      console.log('got the list, ', data)
      if(Array.isArray(data.payload)){
        setDevices(data.payload);
      }
    })

    getList();

    return ()=>{
      console.log('des')
      socketListener.removeAllListeners(socketEndpoints.deviceList);
    }
  }, [])

  const getList = () =>{
    let request = {
      auth: authSelector.auth||'', 
      domain: authSelector.domain||'',
      endPoint: socketEndpoints.getDeviceList,
    }
    socketEmit(request)
  }

  const nav = useNavigation<propType>()

  const handleClick = (device: string, deviceType: string)=>{
    console.log(device, deviceType);
    switch(deviceType){
      case "PUMP": 
        nav.navigate('PumpDevice', {device})
      break;
      default: nav.navigate('DefaultDevice', {device})
    }
  }

  const DrawItem = ({item}:{item: deviceListItem}) => (
    <TouchableOpacity style={style.deviceinfo} onPress={()=>handleClick(item.deviceId, item.type)}>
      <Image style={style.icon} source={item.type == 'PUMP'?require('../../assets/icons_fan.png'):require('../../assets/electricity.png')}/>
      <View>
        <Text style={style.devicetext}>{item.type}</Text>
        <CustomText>{item.deviceId}</CustomText>
      </View>
    </TouchableOpacity>
)

  return (
    <View style={[PredefinedStyles.fullHeight, style.relative]}>

      <CustomView>
        <CrazyHeading>My Devices</CrazyHeading>
        {
          devices.length ?
          <FlatList
          data={devices}
          renderItem={DrawItem}
          keyExtractor={(item, i)=>String(i)}
          /> : 
          <CustomText>No devices found</CustomText>
        }
      </CustomView>
      <View style={style.bottom}><CustomButton text='Refresh' type='neutral' full handler={getList}/></View>
    </View>
  )
}

const style = StyleSheet.create({
  deviceinfo: {
    backgroundColor: Colors.midDark,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.light,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  devicetext:{
    color: Colors.light,
    fontSize: 20
  },
  icon: {
    height: 50, 
    width: 50
  },
  relative: {
    position: 'relative'
  },
  bottom: {
      position: 'absolute',
      bottom: 4,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around'
  }
})

export default DeviceList