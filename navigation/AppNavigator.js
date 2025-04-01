import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

const FavoritesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarLabel: ({ focused }) => {
          return focused ? (
            <Text style={{ fontSize: 12, color: '#5FAB2F' }}>{route.name}</Text>
          ) : null;
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Favorites') iconName = 'heart-circle-outline';
          return <Ionicons name={iconName} color={focused ? '#5FAB2F' : '#9D9D9D'} size={25} />;
        },
      })}
    >
      <Tab.Screen name="Search" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavoritesStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <BottomTab />
    </NavigationContainer>
  );
};

export default AppNavigator;