import React, { PropsWithChildren } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface LoaderProps {
  visible: boolean;
}

const Loader = ({ visible }: PropsWithChildren<LoaderProps>): JSX.Element => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Loader;
