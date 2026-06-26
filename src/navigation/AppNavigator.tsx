import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';

// Screens
import HomeScreen from '@/screens/HomeScreen';
import RestaurantsScreen from '@/screens/RestaurantsScreen';
import RestaurantMenuScreen from '@/screens/RestaurantMenuScreen';
import CartScreen from '@/screens/CartScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import OrderTrackingScreen from '@/screens/OrderTrackingScreen';
import OrderDetailsScreen from '@/screens/OrderDetailsScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import AccountScreen from '@/screens/AccountScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import AddressesScreen from '@/screens/AddressesScreen';
import DeliveryRequestScreen from '@/screens/DeliveryRequestScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import AboutScreen from '@/screens/AboutScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Restaurants: undefined;
  RestaurantMenu: { restaurantId: string; restaurantName: string };
  Cart: undefined;
  Checkout: { restaurantId: string; restaurantName: string; deliveryFee: number };
  OrderTracking: { orderId: string };
  OrderDetails: { orderId: string };
  Login: undefined;
  Register: undefined;
  Addresses: undefined;
  DeliveryRequest: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Colors
const PRIMARY = '#1B4332';
const LIGHT_GREEN = '#52B788';
const TEXT_SECONDARY = '#888888';

function TabBarIcon({ focused, Icon, label }: { focused: boolean; Icon: any; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Icon size={22} color={focused ? PRIMARY : TEXT_SECONDARY} strokeWidth={focused ? 2.5 : 1.5} />
      <Text style={[styles.tabLabel, { color: focused ? PRIMARY : TEXT_SECONDARY, fontWeight: focused ? '700' : '400' }]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  const cartCount = useStore(s => s.getCartCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} Icon={Home} label="الرئيسية" />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} Icon={ClipboardList} label="طلباتي" />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabBarIcon focused={focused} Icon={ShoppingBag} label="السلة" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} Icon={User} label="حسابي" />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="DeliveryRequest" component={DeliveryRequestScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Restaurants" component={RestaurantsScreen} />
            <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: -6,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
