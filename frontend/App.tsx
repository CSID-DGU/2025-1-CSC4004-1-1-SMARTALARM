import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainDashboard from './src/screens/MainDashboard';
import AlarmSetupPage from './src/screens/AlarmSetupPage';  // 알람 셋업 페이지 추가

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainDashboard">
        <Stack.Screen name="MainDashboard" component={MainDashboard} />
        <Stack.Screen name="AlarmSetupPage" component={AlarmSetupPage} />  {/* 연결 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
