import { PropsWithChildren } from 'react'
import { View, Text } from 'react-native'
import { PredefinedStyles } from '../constants/style'

const CustomText = (prop: PropsWithChildren<{medium?:boolean}>) => {
  return (
    <Text style={[PredefinedStyles.lightText, {fontSize: prop?.medium?22: 16}]}>{prop.children}</Text>
  )
}

export default CustomText