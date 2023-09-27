import { View, Text, StyleSheet, FlatList } from 'react-native'
import React, { PropsWithChildren, useEffect } from 'react'
import CustomText from '../components/CustomText'
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { socketEmit } from '../utils/socket'
import { MicroServices, WithAuth, WithoutAuth, socketEndpoints, socketEvents } from '../shared/constants'
import { updatedStatus } from '../shared/endCommConstants'
import CustomView from '../components/CustomView'
import CrazyHeading from '../components/CrazyHeading'
import { Colors, PredefinedStyles } from '../constants/style'
import CustomButton from '../components/CustomButton'
import { useSelector } from 'react-redux'
import { getAuthSelector } from '../utils/utils'
import { socketListener } from '../utils/socketEventListener'
import { MaterialTopTabNavigationProp, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

type propType = StackNavigationProp<{Devices: undefined}>

type TabNavigatorParams = {
    StackScreen: { dev: string };
};

type TabChildProp = {
    route: RouteProp<TabNavigatorParams, 'StackScreen'>;
};


const Control = () => {
    const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device
    // console.log('props are ', route)
    // const device = route.params.dev
    const nav = useNavigation<propType>();
    const deviceInitialState:updatedStatus = {
        runningState: false,
        phase: 0,
        voltage: [0, 0, 0],
        time: 0,
        _id: device
    }
    const authObject = useSelector(getAuthSelector)
    
    
    const [deviceStatus, setDeviceStatus] = React.useState<updatedStatus>(deviceInitialState)
    const [lastUpdate, setLastUpdate] = React.useState<string>('N/A');

    React.useEffect(()=>{
        if(typeof device !== 'string'){
            nav.navigate('Devices')
        }
        else{
            socketListener.addListener(socketEndpoints.info, (data:WithoutAuth<updatedStatus>)=>{
                console.log('got payload at pump view', data?.payload, typeof data.payload=='string', data.device)
                if(data?.payload && data.device == device){
                    console.log("all matching");
                    setDeviceStatus(data.payload)
                    let upDate = new Date(data.payload.time);
                    setLastUpdate(`${upDate.toLocaleTimeString()}`)
                }
                    
            })
            socketGetInfo();

            return ()=>{
                console.log('destructuring');
                socketListener.removeAllListeners(socketEndpoints.info);
            }
        }
    }, [])

    const getRequestObj = (endPoint: string):WithAuth => {
        return {
            auth: authObject.auth || '',
            domain: authObject.domain || '',
            endPoint,
            service: MicroServices.PUMP,
            device
        }
    }

    const socketGetInfo = () =>{
        socketEmit(getRequestObj(socketEndpoints.getInfo))
    }

    const socketStartImmediate  = () =>{
        if( !deviceStatus.runningState)
            socketEmit(getRequestObj(socketEndpoints.startImmediate));
    }

    const socketStopImmediate = () =>{
        if(deviceStatus.runningState)
            socketEmit(getRequestObj(socketEndpoints.stopImmediate))
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
}[]

function Logs() {
    const focus = useIsFocused();
    const device = useRoute<RouteProp<{params: {device: string}}>>().params?.device

    const authObject = useSelector(getAuthSelector)

    const [logData, setLogData] = React.useState<LogsPayload>([])
    const [pageno, setPageno] = React.useState<number>(1)

    useEffect(()=>{
        if(focus && logData.length == 0){
            loadLogs();
        }
    }, [focus])

    useEffect(()=>{
        socketListener.addListener(socketEndpoints.receiveLogs, function (data: WithoutAuth<LogsPayload>){
            if(data.payload?.length){
                console.log('new payload received', data.payload)
                let newLogs = data.payload.map(entry=>{
                    return {
                        ...entry,
                        time: new Date(entry.time).toLocaleString('en-in')
                    }
                })
                setPageno(pn=>pn+1)
                setLogData(pre=>[...pre, ...newLogs])
            }
        })
        return ()=>{
            socketListener.removeAllListeners(socketEndpoints.receiveLogs);
        }
    },[])

    

    const getRequestObj = (endPoint: string):WithAuth => {
        return {
            auth: authObject.auth || '',
            domain: authObject.domain || '',
            endPoint,
            service: MicroServices.PUMP,
            device
        }
    }

    function loadLogs(){
        let req = getRequestObj(socketEndpoints.getLogs)
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
                    <CustomButton text='Load more if available' type='neutral' handler={loadLogs} full />
                    <View key="dummy" style={style.flatlistItemDummy}>
                        <CustomText></CustomText>
                        <Text ></Text>
                    </View>
                </View>
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