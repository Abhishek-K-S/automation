import AsyncStorage from "@react-native-async-storage/async-storage"
import { storage } from "../constants/vars"


//Domain is who is  under the network, ex kenaje1
export const getSavedDomain = async () =>{
    let domainName = await AsyncStorage.getItem(storage.domainName)
    let auth = await AsyncStorage.getItem(storage.auth)
    if(auth && domainName) return {auth, domainName};
    return null;
}

export const changeSavedDomain = (domainName: string, auth: string) => {
    AsyncStorage.setItem(storage.domainName, domainName)
    AsyncStorage.setItem(storage.auth, auth)
}

//just holds the url of the tunnel server
export const RemoteServer = {
    saveNewUrl : (url: string)=>{
        AsyncStorage.setItem(storage.remoteServerURL, url)
    },

    getSavedUrl: ()=>{
        return AsyncStorage.getItem(storage.remoteServerURL);
    }
}