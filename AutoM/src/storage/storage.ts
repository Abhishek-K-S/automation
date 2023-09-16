import AsyncStorage from "@react-native-async-storage/async-storage"
import { storage } from "../constants/vars"

export const getSavedDomain = async () =>{
    return await AsyncStorage.getItem(storage.domainName)
}

export const changeSavedDomain = (domainName: string) => {
    AsyncStorage.setItem(storage.domainName, domainName)
}