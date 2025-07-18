/**
 * Navigation - Sistema de navegação principal
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useAppSelector } from '@/store';

// Screens
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { HomeScreen } from '@/screens/main/HomeScreen';
import { PetsScreen } from '@/screens/pets/PetsScreen';
import { AddPetScreen } from '@/screens/pets/AddPetScreen';
import { EditPetScreen } from '@/screens/pets/EditPetScreen';
import { PetDetailScreen } from '@/screens/pets/PetDetailScreen';
import { HealthScreen } from '@/screens/health/HealthScreen';
import { AddHealthRecordScreen } from '@/screens/health/AddHealthRecordScreen';
import { PetHealthHistoryScreen } from '@/screens/health/PetHealthHistoryScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

// Types
import { RootStackParamList, MainTabParamList } from './types';

// Constants
import { COLORS, GLASS_STYLES } from '@/constants/theme';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Tab Navigator com Liquid Glass Design
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Pets':
              iconName = focused ? 'paw' : 'paw-outline';
              break;
            case 'Health':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary.coral,
        tabBarInactiveTintColor: COLORS.system.text.secondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: COLORS.glass.dock,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: COLORS.system.border.light,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Pets" 
        component={PetsScreen}
        options={{ tabBarLabel: 'Pets' }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthScreen}
        options={{ tabBarLabel: 'Saúde' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Avisos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Navigator
 */
const Navigation = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { onboarding } = useAppSelector(state => state.app);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {/* Onboarding - apenas se não foi completado */}
        {!onboarding.completed && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}

        {/* Auth Stack - se não estiver autenticado */}
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          /* Main App Stack - se estiver autenticado */
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="AddPet" component={AddPetScreen} />
            <Stack.Screen name="EditPet" component={EditPetScreen} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} />
            <Stack.Screen name="AddHealthRecord" component={AddHealthRecordScreen} />
            <Stack.Screen name="PetHealthHistory" component={PetHealthHistoryScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;