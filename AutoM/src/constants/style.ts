import { StyleSheet } from "react-native"

export const Colors = {
    dark: '#020202',
    midDark: '#1f1f1f',
    light: '#f8f8f8',
    neutral: '#c2c2c2',
    danger: '#FF6B6B',
    green: '#00FF00'
}

export const PredefinedStyles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    verticallyCenter: {
        flex: 1,
        justifyContent: "center",
    },
    fullHeight: {
        flex: 1
    },
    darkBackground: {
        backgroundColor: Colors.dark
    },
    lightBackground: {
        backgroundColor: Colors.light
    },
    lightText: {
        color: Colors.light
    },

    view: {
        paddingTop: 10,
        marginBottom: 10,
        gap: 8
    }
})