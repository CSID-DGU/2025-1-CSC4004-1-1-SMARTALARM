import React from 'react';
console.log("🔥 App loaded");
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainDashboard from './src/screens/MainDashboard';
import AlarmSetup from './src/screens/AlarmSetup';
import LocationPreferences from './src/screens/LocationPreferences';
import SplashScreen from './src/screens/SplashScreen';
import SignUpLogin from './src/screens/SignUpLogin';
import Settings from './src/screens/Settings';

export type RootStackParamList = {
  MainDashboard: undefined;
  AlarmSetup: undefined;
  LocationPreferences: undefined;
  SplashScreen: undefined;
  SignUpLogin: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="SignUpLogin" component={SignUpLogin} />
        <Stack.Screen name="Settings" component={Settings} />
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
