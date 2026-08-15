import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, View } from 'react-native'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { colors } from './src/theme/colors'
import HomeScreen from './src/screens/HomeScreen'
import EventDetailScreen from './src/screens/EventDetailScreen'
import WatchScreen from './src/screens/WatchScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import VodCatalogScreen from './src/screens/VodCatalogScreen'
import VodDetailScreen from './src/screens/VodDetailScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import MyEventsScreen from './src/screens/MyEventsScreen'
import AdminScreen from './src/screens/AdminScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Eventos' }} />
      <Tab.Screen name="Catalog" component={VodCatalogScreen} options={{ title: 'Catálogo' }} />
      <Tab.Screen name="Purchases" component={MyEventsScreen} options={{ title: 'Mis eventos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  )
}

function RootNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="VodDetail" component={VodDetailScreen} options={{ title: '' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="VodDetail" component={VodDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="Watch" component={WatchScreen} options={{ title: '' }} />
          {user.role === 'admin' && (
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Administración' }} />
          )}
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}
