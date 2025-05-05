import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainDashboard from './src/screens/MainDashboard';
import AlarmSetup from './screens/AlarmSetup';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainDashboard">
        <Stack.Screen name="MainDashboard" component={MainDashboard} />
        <Stack.Screen name="AlarmSetup" component={AlarmSetup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
