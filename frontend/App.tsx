import React from 'react';
import { SafeAreaView } from 'react-native';
import MainDashboard from './src/screens/MainDashboard';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainDashboard />
    </SafeAreaView>
  );
};

export default App;