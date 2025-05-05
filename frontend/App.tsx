import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainDashboard from './src/screens/MainDashboard';
import AlarmSetup from './src/screens/AlarmSetup';
import LocationPreferences from './src/screens/LocationPreferences';

export type RootStackParamList = {
  MainDashboard: undefined;
  AlarmSetup: undefined;
  LocationPreferences: undefined;
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainDashboard">
        <Stack.Screen name="MainDashboard" component={MainDashboard} />
        <Stack.Screen name="AlarmSetup" component={AlarmSetup} />
        <Stack.Screen
          name="LocationPreferences"
          component={LocationPreferences}
          options={{ title: 'Location & Preferences' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
