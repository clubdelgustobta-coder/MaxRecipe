import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RecipesProvider } from './src/context/RecipesContext';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ChefScreen from './src/screens/ChefScreen';
import LoginScreen from './src/screens/LoginScreen';
import { onAuthChange } from './src/services/firebaseService';
import { APP_URL } from './src/config/appConfig';

const linking = {
    prefixes: [APP_URL, 'http://localhost:8081'],
    config: {
        screens: {
            RecipeList: '',
            RecipeDetail: 'recipe/:code',
            Review: 'preferencias',
            Chef: 'chef',
        },
    },
};

const Stack = createNativeStackNavigator();

function SplashScreen({ onFinish }) {
    const opacity = useRef(new Animated.Value(1)).current;

    const fadeOut = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
        }).start(onFinish);
    };

    // Mínimo 2 segundos de splash; si los datos tardan más esperamos a onReady
    useEffect(() => {
        const timer = setTimeout(fadeOut, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.splash, { opacity }]}>
            <View style={styles.splashLogoBox}>
                <Text style={styles.splashIcon}>🍝</Text>
                <Text style={styles.splashTitle}>Club del Gusto</Text>
                <Text style={styles.splashSub}>Recetario Personal</Text>
            </View>
            <Text style={styles.splashFooter}>© 2009 – 2026</Text>
        </Animated.View>
    );
}

export default function App() {
    const [splashDone, setSplashDone] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [user, setUser] = useState(undefined); // undefined = todavía verificando
    const splashTimerDone = useRef(false);
    const dataLoadDone = useRef(false);

    useEffect(() => {
        const unsub = onAuthChange((u) => setUser(u));
        // Si Firebase no responde en 5s (ej. dominio no autorizado), mostramos login igual
        const fallback = setTimeout(() => setUser(prev => prev === undefined ? null : prev), 5000);
        return () => { unsub(); clearTimeout(fallback); };
    }, []);

    const tryFinish = () => {
        if (splashTimerDone.current && dataLoadDone.current) {
            setSplashDone(true);
        }
    };

    const onSplashTimerDone = () => {
        splashTimerDone.current = true;
        tryFinish();
    };

    const onDataReady = () => {
        dataLoadDone.current = true;
        setDataReady(true);
        tryFinish();
    };

    // Aún verificando sesión con Firebase — no mostramos nada todavía
    if (user === undefined) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <View style={styles.splash} />
            </SafeAreaProvider>
        );
    }

    if (!user) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <LoginScreen />
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <RecipesProvider onReady={onDataReady}>
                {!splashDone && <SplashScreen onFinish={onSplashTimerDone} />}
                {splashDone && (
                    <NavigationContainer linking={linking}>
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="RecipeList" component={RecipeListScreen} />
                            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
                            <Stack.Screen name="Review" component={ReviewScreen} />
                            <Stack.Screen name="Chef" component={ChefScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                )}
            </RecipesProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0f0f1e',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    splashLogoBox: { alignItems: 'center' },
    splashIcon: { fontSize: 72, marginBottom: 20 },
    splashTitle: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 1.5 },
    splashSub: { color: '#888', fontSize: 15, marginTop: 6, letterSpacing: 1 },
    splashFooter: { color: '#444', fontSize: 12, position: 'absolute', bottom: 40 },
});
