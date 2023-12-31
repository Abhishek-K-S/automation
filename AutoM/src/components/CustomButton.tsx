import { View, Text, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { TouchableOpacity } from 'react-native'
import { Colors } from '../constants/style'

type ButtonEmiter = {text: string, type: 'danger'|'good'|'neutral', handler: ()=>void, full?: boolean}

const CustomButton = (props: PropsWithChildren & ButtonEmiter) => {
  return (
    <TouchableOpacity style={[style.default, style[props.type], props.full?{maxWidth: '98%'}:{}]} onPress={props.handler}><Text style={[style[props.type], {fontSize: 22}]}>{props.text}</Text></TouchableOpacity>
  )
}

const style = StyleSheet.create({
    default: {
        padding: 15,
        borderRadius: 8,
        width: 'auto',
        maxWidth: '49%',
        borderWidth: 4,
        flex: 1,
        minHeight: 63,
        flexDirection:'row',
        justifyContent: 'center'
    },
    danger: {
        color: Colors.danger,
        borderColor: Colors.danger,
        fontWeight: '600',
    },
    good: {
        color: Colors.green,
        borderColor: Colors.green,
        fontWeight: '600',
    },
    neutral: {
        color: Colors.neutral,
        borderColor: Colors.neutral,
        fontWeight: '600',
    }
})

export default CustomButton