import { PropsWithChildren } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PredefinedStyles } from '../constants/style'

const CustomView = (prop: PropsWithChildren) => {
  return (
    <View style={[style.gap, PredefinedStyles.darkBackground]}>
      {prop.children}
    </View>
  )
}

const style = StyleSheet.create({
    gap: {
        paddingHorizontal: '3%',
        paddingTop: 10,
        marginBottom: 10,
        gap: 8
    }
})

export default CustomView