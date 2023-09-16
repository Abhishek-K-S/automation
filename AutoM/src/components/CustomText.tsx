import { PropsWithChildren } from 'react'
import { View, Text } from 'react-native'
import { PredefinedStyles } from '../constants/style'

const CustomText = (prop: PropsWithChildren) => {
  return (
    <Text style={[PredefinedStyles.lightText, {fontSize: 16}]}>{prop.children}</Text>
  )
}

export default CustomText