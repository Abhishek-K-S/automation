import { View, Text, StyleSheet } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { Colors, PredefinedStyles } from '../constants/style'

const CrazyHeading = (prop: PropsWithChildren<{color?: string}>) => {
  return (
    <Text style={[PredefinedStyles.lightText, style.text, {color: prop.color?prop.color: Colors.light}]}>{prop.children}</Text>
  )
}

const style = StyleSheet.create({
    text: {
        fontSize: 48,
        fontWeight: '600'
    }
})

export default CrazyHeading