import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainMenuScreen from '../screens/MainMenuScreen';
import MaskSelectionScreen from '../screens/MaskSelectionScreen';
import GameScreen from '../screens/GameScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreditsScreen from '../screens/CreditsScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  MainMenu: undefined;
  MaskSelection: undefined;
  Game: { maskId: string };
  Settings: undefined;
  Credits: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen 
          name="MaskSelection" 
          component={MaskSelectionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen}
          options={{ animation: 'fade_from_bottom' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="Credits" 
          component={CreditsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

