import React from 'react'
import useSocketRequestGenerator from '../utils/SocketRequestGenerator'
import useSocketListenToInfo from '../utils/SocketListenToInfo';
import { socketEmit } from '../utils/socket';
import { socketEndpoints } from '../shared/constants';
import CustomView from '../components/CustomView';
import CustomText from '../components/CustomText';
import { RouteProp, useRoute } from '@react-navigation/native';

const DefaultDeviceView = () => {
  const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device
  const socketRequestGenerator = useSocketRequestGenerator(device);
  const [socketInfo, lastUpdate] = useSocketListenToInfo<any>(device, {time: 0})

  React.useEffect(()=>{
    if(!device) return;
    getDeviceInfo();
  }, [])

  const getDeviceInfo = ()=>{
    socketEmit(socketRequestGenerator(socketEndpoints.getInfo));
  }
  return (
    <CustomView>
      {Object.keys(socketInfo).map(key=>{
        return (<CustomView>
          <CustomText medium>{key}</CustomText>
          <CustomText>{socketInfo[key]}</CustomText>
        </CustomView>)

      })}
    </CustomView>
  )
}

export default DefaultDeviceView