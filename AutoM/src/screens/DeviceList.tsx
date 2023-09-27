import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import CustomView from '../components/CustomView'
import CustomText from '../components/CustomText'
import CrazyHeading from '../components/CrazyHeading'
import { FlatList } from 'react-native'
import { Colors, PredefinedStyles } from '../constants/style'
import { socketEmit } from '../utils/socket'
import { MicroServices, WithAuth, WithoutAuth, socketEndpoints } from '../shared/constants'
import { useSelector } from 'react-redux'
import { getAuthSelector } from '../utils/utils'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import CustomButton from '../components/CustomButton'
import { socketListener } from '../utils/socketEventListener'
// import { getRequestObj } from '../utils/utils'

type deviceList = {
  [key: number]: string[]
}

type propType = StackNavigationProp<{OperateDevice: {device: string}}>

const DeviceList = () => {
  const [devices, setDevices] = React.useState<deviceList>({0:[]});

  const authSelector = useSelector(getAuthSelector)

  React.useEffect(()=>{
    socketListener.addListener(socketEndpoints.deviceList, (data: WithoutAuth<string[]>)=>{
      if(data.service !== undefined && Array.isArray(data.payload)){
        let newList = {...devices};

        console.log('getting new ilst', newList)
        newList[data.service] = data.payload
        setDevices(newList)
      }
    })

    getList();

    return ()=>{
      socketListener.removeAllListeners(socketEndpoints.deviceList);
    }
  }, [])

  const getList = () =>{
    let request = {
      auth: authSelector.auth||'', 
      domain: authSelector.domain||'',
      payload: null, 
      endPoint: socketEndpoints.getDeviceList,
      service: MicroServices.PUMP
    }
    socketEmit(request)
  }

  const nav = useNavigation<propType>()

  const handleClick = (device: string)=>{
    nav.navigate('OperateDevice', {device})
  }

  const DrawItem = ({item}:{item: string}) => (
    <TouchableOpacity style={style.deviceinfo} onPress={()=>handleClick(item)}>
      <Image style={style.icon} source={require('../../assets/icons_fan.png')}/>
      <Text style={style.devicetext}>{item}</Text>
    </TouchableOpacity>
)

  return (
    <View style={[PredefinedStyles.fullHeight, style.relative]}>

      <CustomView>
        <CrazyHeading>Pump</CrazyHeading>
        {
          devices[0].length ?
          <FlatList
          data={devices[0]}
          renderItem={DrawItem}
          keyExtractor={(item, i)=>String(i)}
          /> : 
          <CustomText>No devices found</CustomText>
        }
      </CustomView>
      <View style={style.bottom}><CustomButton text='Refresh' type='neutral'full handler={getList}/></View>
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