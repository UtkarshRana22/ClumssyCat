import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './HomeScreen';
import EntryScreen from './EntryScreen';
import { COLORS, FONTS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// "Add" tab never actually renders a screen — pressing it is intercepted
// below to open the Entry modal instead — but Tab.Screen requires some
// component, so this is just a harmless placeholder.
function AddPlaceholder() {
  return null;
}

// Shown once a user is verified, in place of the pre-auth Stack.
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddPlaceholder}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Don't switch to the (blank) Add tab — open the Entry modal
            // on the parent Stack instead.
            e.preventDefault();
            navigation.getParent()?.navigate('Entry');
          },
        })}
      />
    </Tab.Navigator>
  );
}

// Wraps the tab navigator in a Stack so EntryScreen ("New Entry") can be
// presented as a modal on top of the tabs — reachable via
// navigation.navigate('Entry') from any screen inside HomeTabs.
export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      <Stack.Screen
        name="Entry"
        component={EntryScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
