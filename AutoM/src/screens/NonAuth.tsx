import { StyleSheet, View, Text } from 'react-native'
import { Colors, PredefinedStyles } from '../constants/style'
import CustomView from '../components/CustomView'
import CustomText from '../components/CustomText'
import { TextInput } from 'react-native'
import React from 'react'
import CrazyHeading from '../components/CrazyHeading'
import CustomButton from '../components/CustomButton'
import { useDispatch } from 'react-redux'
import { changeDomain } from '../store/domainReducer'
import { RemoteServer, changeSavedDomain } from '../storage/storage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { WithoutAuth, socketEndpoints, socketEvents } from '../shared/constants'
import { connectToSocket, socketEmit} from '../utils/socket'
import Loader from '../components/Loader'
import { socketListener } from '../utils/socketEventListener'

type propType = StackNavigationProp<{Devices: undefined}>

const NonAuth = () => {

    const [domain, setDomain] = React.useState<string>('');
    const [username, setUsername] = React.useState<string>('');
    const [secret, setSecret] = React.useState<string>('');
    const [loaderVisible, setLoaderVisible] = React.useState<boolean>(false);
    const [remoteUrl, setRemoteUrl] = React.useState<string>("");

    const nav = useNavigation<propType>();

    const disp = useDispatch()

    console.log('domain is', domain)

    React.useEffect(()=>{
        RemoteServer.getSavedUrl().then(val=>{
            if(val) setRemoteUrl(val);
        })
        socketListener.addListener(socketEndpoints.initSuccesss, onAuthSuccess)
        
        return ()=>{
            socketListener.removeAllListeners(socketEndpoints.initSuccesss)
        }
    }, [])


    function onAuthSuccess(data: WithoutAuth){
        console.log('payload is ', data.payload)
        if(typeof data.payload == 'string'){
            //save auth to local adn redux;
            console.log('value is ', domain)
            changeSavedDomain(domain, data.payload)
            disp(changeDomain({domainName: domain, auth: data.payload}));
            if(nav.getState()){
                nav.popToTop();
                nav.replace('Devices')
            }
        }
    }

    const submitHandler = () => {
        if(username && domain && secret&& remoteUrl){
            setLoaderVisible(true);
            setTimeout(()=>setLoaderVisible(false), 5000)
            connectToSocket(remoteUrl, ()=>{
                RemoteServer.saveNewUrl(remoteUrl);
                socketEmit({
                    auth: {
                        username,
                        secret
                    },
                    endPoint: socketEndpoints.init,
                    domain,
                    payload: null
                })
            })
        }
    }

    return (
        <View style={PredefinedStyles.verticallyCenter}>
            <CustomView>
                <CrazyHeading>Lets connect to your Server!...</CrazyHeading>
            </CustomView>
            <CustomView>
                <CustomText>Tunnel server URL :</CustomText>
                <TextInput style={style.textInput} onChangeText={setRemoteUrl} value={remoteUrl} placeholder='Enter tunnel URL here'/>
            </CustomView>
            <CustomView>
                <CustomText>Domain Name :</CustomText>
                <TextInput style={style.textInput} onChangeText={setDomain} value={domain} placeholder='Enter domain name here'/>
            </CustomView>
            <CustomView>
                <CustomText>Username :</CustomText>
                <TextInput style={style.textInput} onChangeText={setUsername} value={username} placeholder='Username'/>
            </CustomView>
            <CustomView>
                <CustomText>secret phrase :</CustomText>
                <TextInput style={style.textInput} onChangeText={setSecret} value={secret} placeholder='secret phrase'/>
            </CustomView>
            <CustomView>
                <Text style={{color: Colors.danger}}>(i) All fields are case sensitive</Text>
                <CustomText>(ii) Wait for 5 seconds before trying again.</CustomText>
            </CustomView>
            <CustomView>
                <CustomButton text='Continue' type={domain.length && username.length && secret.length && remoteUrl.length ?'good': 'neutral'} handler={submitHandler}/>
            </CustomView>
            <Loader visible={loaderVisible}/>
        </View>
    )
}

const style = StyleSheet.create({
    inputContainer: {
        width: '100%'
    },
    textInput: {
        borderColor: Colors.light,
        borderStyle: 'solid',
        borderLeftWidth: 1,
        width: '100%',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        fontSize: 18
    }
})

export default NonAuth