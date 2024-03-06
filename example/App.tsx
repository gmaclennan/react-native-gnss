import { StyleSheet, Text, View } from 'react-native';

import * as ReactNativeGnss from 'react-native-gnss';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ReactNativeGnss.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
