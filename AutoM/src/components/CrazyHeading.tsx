import { View, Text, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { PredefinedStyles } from '../constants/style'

const CrazyHeading = (prop: PropsWithChildren) => {
  return (
    <Text style={[PredefinedStyles.lightText, style.text]}>{prop.children}</Text>
  )
}

const style = StyleSheet.create({
    text: {
        fontSize: 48,
        fontWeight: '600'
    }
})

export default CrazyHeading