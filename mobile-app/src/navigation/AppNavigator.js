import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, User } from 'lucide-react-native';
import { getColors } from '../theme/colors';
import { navigationRef } from './navigationRef';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ShippingAddressScreen from '../screens/ShippingAddressScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ComparisonScreen from '../screens/ComparisonScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStackNav = createNativeStackNavigator();

// ─── Auth Stack (Login / Register) ───
const AuthStack = () => (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
        <AuthStackNav.Screen name="Login" component={LoginScreen} />
        <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
);

// ─── App Stacks (Authenticated) ───
const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} />
    </Stack.Navigator>
);

const CartStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
);

const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
    </Stack.Navigator>
);

const CartBadge = ({ count }) => {
    const COLORS = getColors();
    if (count === 0) return null;
    return (
        <View style={{
            position: 'absolute',
            right: -8,
            top: -4,
            backgroundColor: COLORS.danger,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
        }}>
            <Text style={{ color: COLORS.white, fontSize: 10, fontWeight: '800' }}>
                {count > 9 ? '9+' : count}
            </Text>
        </View>
    );
};

// ─── Loading Screen ───
const LoadingScreen = () => {
    const COLORS = getColors();
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.black} />
        </View>
    );
};

const AppNavigator = () => {
    const COLORS = getColors();
    const { itemCount } = useCart();
    const { t } = useLanguage();
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <NavigationContainer ref={navigationRef}>
                <LoadingScreen />
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? (
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: COLORS.card,
                            borderTopColor: COLORS.border,
                            borderTopWidth: StyleSheet.hairlineWidth,
                            height: 85,
                            paddingTop: 8,
                            paddingBottom: 28,
                        },
                        tabBarActiveTintColor: COLORS.black,
                        tabBarInactiveTintColor: COLORS.textSecondary,
                        tabBarLabelStyle: {
                            fontSize: 11,
                            fontWeight: '600',
                            marginTop: 2,
                        },
                    }}
                >
                    <Tab.Screen
                        name="HomeTab"
                        component={HomeStack}
                        options={{
                            tabBarLabel: t('home.exploreTitle'),
                            tabBarIcon: ({ color, size }) => (
                                <Home size={size - 2} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="CartTab"
                        component={CartStack}
                        options={{
                            tabBarLabel: t('cart.title'),
                            tabBarIcon: ({ color, size }) => (
                                <View>
                                    <ShoppingCart size={size - 2} color={color} />
                                    <CartBadge count={itemCount} />
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="ProfileTab"
                        component={ProfileStack}
                        options={{
                            tabBarLabel: t('profile.title'),
                            tabBarIcon: ({ color, size }) => (
                                <User size={size - 2} color={color} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
