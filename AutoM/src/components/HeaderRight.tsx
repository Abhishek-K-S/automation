import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'
import CustomText from './CustomText'
import { Colors } from '../constants/style'
import { StackNavigationProp } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'

type propType = StackNavigationProp<{ChangeDomain: undefined}>

const HeaderRight = () => {
    const nav = useNavigation<propType>()
    nav.pop
  return (
    [...(nav.getState().routes)].pop()?.name === "ChangeDomain"? 
    <></>:

    <TouchableOpacity style={style.button} onPress={()=>nav.navigate('ChangeDomain')}>
        <CustomText>Change domain</CustomText>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
    button: {
        padding: 10,
        width: 130,
        backgroundColor: Colors.midDark,
    }
})

export default HeaderRight