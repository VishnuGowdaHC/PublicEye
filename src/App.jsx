import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./auth/login";
import RegisterScreen from "./auth/register";
import HomeScreen from "./screens/home";
import MyReportsScreen from "./screens/myreports";
import ProfileScreen from "./screens/profile";
import CreateProfile from "./auth/createProfile";
import { AuthProvider, useAuth } from "../tools/contexts/auth";
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReportForm from "../tools/components/ReportForm";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDoc, doc } from "firebase/firestore";
import { firebaseAuth, db } from "../firebaseConfig"; // Add your path
import { onSnapshot } from "firebase/firestore";
import  LoadingScreen  from "../tools/components/LoadingScreen"


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6', 
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          paddingBottom: insets.bottom > 0 ? insets.bottom / 2 : 10,
          paddingTop: 8,
          height: 65 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyReports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="MyReports" 
        component={MyReportsScreen}
        options={{ tabBarLabel: 'My Reports' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postLoginDelay, setPostLoginDelay] = useState(false); // <-- NEW

  // Existing Firestore user profile check
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        setHasProfile(snapshot.exists());
        setLoading(false);
      },
      (error) => {
        console.error('Error checking profile:', error);
        setHasProfile(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2-second post-login delay
  useEffect(() => {
    if (user) {
      setPostLoginDelay(true);
      const timer = setTimeout(() => {
        setPostLoginDelay(false);
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    } else {
      setPostLoginDelay(false);
    }
  }, [user]);


  if (user && !loading && postLoginDelay) {
    return <LoadingScreen />;
  }

 
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Normal navigation flow
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          hasProfile ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="ReportForm" component={ReportForm} />
            </>
          ) : (
            <>
              <Stack.Screen name="CreateProfile" component={CreateProfile} />
              <Stack.Screen name="ProfileLoading" component={LoadingScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}