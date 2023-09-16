import { StyleSheet, View, Text } from 'react-native'
import { Colors, PredefinedStyles } from '../constants/style'
import CustomView from './CustomView'
import CustomText from './CustomText'
import { TextInput } from 'react-native'
import React from 'react'
import CrazyHeading from './CrazyHeading'
import CustomButton from './CustomButton'
import { useDispatch } from 'react-redux'
import { changeDomain } from '../store/domainReducer'
import { changeSavedDomain } from '../storage/storage'

const NonAuth = () => {

    const [domain, setDomain] = React.useState<string>('');

    const disp = useDispatch()

    const saveDomain = ()=>{
        if(domain.length > 0){
            changeSavedDomain(domain)
            disp(changeDomain(domain));
        }
    }

    return (
        <View style={PredefinedStyles.verticallyCenter}>
            <CustomView>
                <CrazyHeading>Enter your domain name to connect to your server...</CrazyHeading>
            </CustomView>
            <CustomView>
                <CustomText>Domain Name :</CustomText>
                <TextInput style={style.textInput} onChangeText={(e)=> setDomain(e)} value={domain} placeholder='Enter domain name here'/>
                <Text style={{color: Colors.danger}}>(i) domain name is case sensitive</Text>
            </CustomView>
            <CustomView>
                <CustomButton text='Continue' type={domain.length > 0 ?'good': 'neutral'} handler={saveDomain}/>
            </CustomView>
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