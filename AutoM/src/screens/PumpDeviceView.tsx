import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import CustomText from '../components/CustomText'
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { socketEmit } from '../utils/socket'
import { WithAuth, WithoutAuth, socketEndpoints } from '../shared/constants'
import CustomView from '../components/CustomView'
import CrazyHeading from '../components/CrazyHeading'
import { Colors, PredefinedStyles } from '../constants/style'
import CustomButton from '../components/CustomButton'
import { useSelector } from 'react-redux'
import { getAuthSelector } from '../utils/utils'
import { socketListener } from '../utils/socketEventListener'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import useSocketRequestGenerator from '../utils/SocketRequestGenerator'
import useSocketListenToInfo from '../utils/SocketListenToInfo'

type propType = StackNavigationProp<{Devices: undefined}>

const Control = () => {
    const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device
    const nav = useNavigation<propType>();

    const socketRequestGenerator = useSocketRequestGenerator(device);
    const [deviceStatus, lastUpdate] = useSocketListenToInfo(device, {
        runningState: false,
        phase: 0,
        voltage: [0, 0, 0],
        time: 0,
        _id: device, 
        manual: false
    })

    React.useEffect(()=>{
        if(typeof device !== 'string'){
            nav.navigate('Devices')
        }
        else{
            socketGetInfo();
        }
    }, [])

    const socketGetInfo = () =>{
        socketEmit(socketRequestGenerator(socketEndpoints.getInfo))
    }

    const socketStartImmediate  = () =>{
        if( !deviceStatus.runningState)
            socketEmit(socketRequestGenerator(socketEndpoints.startImmediate));
    }

    const socketStopImmediate = () =>{
        if(deviceStatus.runningState)
            socketEmit(socketRequestGenerator(socketEndpoints.stopImmediate))
    }

  return (
    <View style={[style.relative, PredefinedStyles.fullHeight, PredefinedStyles.darkBackground]}>
        <CustomView>
            <CrazyHeading color={deviceStatus?.runningState?Colors.green: Colors.danger}>{deviceStatus?.runningState?'Running': 'Stopped'}</CrazyHeading>
            <CustomText medium>{deviceStatus.phase} Phases</CustomText>
            <CustomText></CustomText>
            <CustomText>Voltage readings:</CustomText>
            <View style={style.gap}>
                <CustomText medium>{deviceStatus.voltage[0]} volts</CustomText>
                <CustomText medium>{deviceStatus.voltage[1]} volts</CustomText>
                <CustomText medium>{deviceStatus.voltage[2]} volts</CustomText>
            </View>
            <CustomText>Last Updated:</CustomText>
            <CustomText medium>{lastUpdate}</CustomText>
            <CustomText></CustomText>
            <CustomText>Device:</CustomText>
            <CustomText medium>{device}</CustomText>
            <CustomText></CustomText>
            <CustomText>Session:</CustomText>
            <CustomText medium>{deviceStatus.manual?"Manual operation": "From app"}</CustomText>
            <CustomText></CustomText>
            <CustomText>{"<----  "}Swipe left for Logs {" <----"}</CustomText>
        </CustomView>
        <View style={style.bottom}>
            {deviceStatus.runningState?
                <CustomButton type='danger' text='Stop' handler={socketStopImmediate}/>
                :
                <CustomButton type='good' text='Start' handler={socketStartImmediate}/>
            }
            <CustomButton type='neutral' text='Sync' handler={socketGetInfo}/>
        </View>
    </View>
  )
}

const style = StyleSheet.create({
    grayBackground: {
        backgroundColor: Colors.midDark
    },
    gap: {
        gap: 10,
        paddingHorizontal: '2%',
        marginBottom: 30
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
    },
    errorText: {
        fontSize: 20,
        color: Colors.danger,
        fontWeight: '600'
    },
    normalText: {
        fontSize: 20,
        color: Colors.light,
        fontWeight: '600'
    },
    flatlistItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: Colors.neutral,
        marginBottom: 10,
    },
    scrollable: {
        overflow: 'scroll',
        height: '85%'
    },
    flatlistItemDummy:{
        height: 120
    }
})



type LogsPayload = {
    _id: string,
    isError: boolean,
    outcome: string,
    time: string
}

function Logs() {
    const focus = useIsFocused();
    const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device

    const authObject = useSelector(getAuthSelector)

    const [logData, setLogData] = React.useState<LogsPayload[]>([])
    const [pageno, setPageno] = React.useState<number>(1)
    const requestGenerator = useSocketRequestGenerator(device)

    useEffect(()=>{
        if(focus && logData.length == 0){
            loadLogs();
        }
    }, [focus])

    useEffect(()=>{
        socketListener.addListener(socketEndpoints.receiveLogs, function (data: WithoutAuth<LogsPayload|LogsPayload[]>){
            if(Array.isArray(data.payload)){
                console.log('new payload received', data.payload)
                let newLogs = data.payload.map(entry=>{
                    return {
                        ...entry,
                        time: formatTime(entry.time)
                    }
                })
                setPageno(pn=>pn+1)
                setLogData(pre=>[...pre, ...newLogs])
            }
            else if(data.payload){
                let newLog = data.payload
                newLog.time = formatTime(newLog.time)
                setLogData(pre=>[ newLog, ...pre])
            }
        })
        return ()=>{
            socketListener.removeAllListeners(socketEndpoints.receiveLogs);
        }
    },[])

    function formatTime(time: string|number){
        return new Date(time).toLocaleString('en-in');
    }

    function loadLogs(){
        let req = requestGenerator(socketEndpoints.getLogs) as any
        req.payload = {offset: pageno}

        socketEmit(req);
    }

    console.log('log screen rendered \n', focus)
    return (
        <View style={[PredefinedStyles.fullHeight, PredefinedStyles.darkBackground]}>
            <CustomView>
                <CrazyHeading>Logs</CrazyHeading>
                <View style={style.scrollable}>
                    <CustomText></CustomText>
                    <FlatList
                        data={logData}
                        renderItem={(item)=>(
                        <View key={item.item._id} style={style.flatlistItem}>
                            <CustomText>{item.item.time}</CustomText>
                            <Text style={item.item.isError?style.errorText: style.normalText}>{item.item.outcome}</Text>
                        </View>)}
                    />
                </View>
                <CustomButton text='Load more if available' type='neutral' handler={loadLogs} full />
            </CustomView>
        </View>
    );
}

function PumpDeviceView() {
    const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device
    const Tab = createMaterialTopTabNavigator();
    return (
        <Tab.Navigator initialRouteName='control'
        screenOptions={{
            swipeEnabled: true,
            tabBarStyle: {
                display: 'none'
            }, 
        }}>
            <Tab.Screen name="control" component={Control} initialParams={{device}}/>
            <Tab.Screen name="logs" component={Logs} initialParams={{device}}/>
        </Tab.Navigator>
    );
}

export default PumpDeviceView