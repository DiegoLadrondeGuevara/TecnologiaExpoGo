import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShoppingCart, User } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
);

const CartStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
);

const CartBadge = ({ count }) => {
    if (count === 0) return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
    );
};

const AppNavigator = () => {
    const { itemCount } = useCart();
    const { t } = useLanguage();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    tabBarLabelStyle: styles.tabLabel,
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
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: t('profile.title'),
                        tabBarIcon: ({ color, size }) => (
                            <User size={size - 2} color={color} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
        borderTopWidth: StyleSheet.hairlineWidth,
        height: 85,
        paddingTop: 8,
        paddingBottom: 28,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    badge: {
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
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
});

export default AppNavigator;
