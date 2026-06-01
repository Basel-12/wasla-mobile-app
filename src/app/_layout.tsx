import OfflineScreen from '@/components/OfflineScreen';
import { configureGoogleSignIn } from '@/features/auth/utils/google-signin';
import '@/i18n/i18n';
import { initializeLanguage } from '@/i18n/i18n';
import { useNotificationListeners } from '@/services/notifications.listener';
import { StorageService } from '@/services/storage.service';
import { StorageKeys } from '@/utils/constants';
import {
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    useFonts,
} from '@expo-google-fonts/cairo';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Href, router, SplashScreen, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../../global.css';

SplashScreen.preventAutoHideAsync();
configureGoogleSignIn();
export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const { t } = useTranslation();
    const [initialRoute, setInitialRoute] = useState<Href | undefined>(
        undefined,
    );
    const [online, setOnline] = useState<boolean>(true);
    const prevOnlineRef = useRef<boolean | null>(null);
    const [fontsLoaded, fontError] = useFonts({
        Cairo_400Regular,
        Cairo_600SemiBold,
        Cairo_700Bold,
    });

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        networkMode: 'offlineFirst',
                    },
                },
            }),
    );

    //listen to notifications
    useNotificationListeners();

    useEffect(() => {
        if (!fontsLoaded && !fontError) return;
        const init = async () => {
            try {
                await initializeLanguage();
                const onboardingCompleted = await StorageService.getItem(
                    StorageKeys.ONBOARDING_COMPLETED,
                    false,
                );
                setInitialRoute(
                    onboardingCompleted ? '/(auth)/login' : '/(onboarding)',
                );
            } catch (error) {
                console.error('Initialization error:', error);
                setInitialRoute('/(onboarding)');
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        };
        init();
    }, [fontsLoaded, fontError]);

    useEffect(() => {
        if (isReady && initialRoute) {
            router.replace(initialRoute);
        }
    }, [isReady, initialRoute]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            if (state.isInternetReachable === null) return;

            const isOnline = !!(state.isConnected && state.isInternetReachable);

            // NetInfo fired but nothing changed — bail out completely
            if (prevOnlineRef.current === isOnline) return;

            const isFirstDetermination = prevOnlineRef.current === null;
            prevOnlineRef.current = isOnline;

            setOnline(isOnline);

            // Don't show toast on initial load — only on actual transitions
            if (isFirstDetermination) return;

            Toast.show({
                type: isOnline ? 'success' : 'error',
                text1: t(isOnline ? 'app.online.title' : 'app.offline.title'),
                text2: t(
                    isOnline
                        ? 'app.online.description'
                        : 'app.offline.description',
                ),
                visibilityTime: 4000,
            });
        });

        return () => unsubscribe();
    }, []);

    const toastConfig = {
        success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
            <View className="bg-white border-l-4 border-green-500 rounded-xl px-4 py-3 mx-4 shadow-md">
                {text1 && (
                    <Text
                        style={{ fontFamily: 'Cairo_700Bold' }}
                        className="text-gray-900"
                    >
                        {text1}
                    </Text>
                )}
                {text2 && (
                    <Text
                        style={{ fontFamily: 'Cairo_400Regular' }}
                        className="text-gray-500 text-sm"
                    >
                        {text2}
                    </Text>
                )}
            </View>
        ),
        error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
            <View className="bg-white border-l-4 border-red-500 rounded-xl px-4 py-3 mx-4 shadow-md">
                {text1 && (
                    <Text
                        style={{ fontFamily: 'Cairo_700Bold' }}
                        className="text-gray-900"
                    >
                        {text1}
                    </Text>
                )}
                {text2 && (
                    <Text
                        style={{ fontFamily: 'Cairo_400Regular' }}
                        className="text-gray-500 text-sm"
                    >
                        {text2}
                    </Text>
                )}
            </View>
        ),
    };

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <SafeAreaProvider>
                    <GestureHandlerRootView
                        style={{ flex: 1, backgroundColor: '#f6f6f8' }}
                    >
                        <StatusBar
                            backgroundColor="#f6f6f8"
                            barStyle="dark-content"
                            translucent={false}
                        />
                        <View style={{ flex: 1, backgroundColor: '#f6f6f8' }}>
                            {isReady && (
                                <Stack screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="(onboarding)" />
                                    <Stack.Screen name="(auth)" />
                                    <Stack.Screen name="(app)" />
                                    <Stack.Screen name="notifications" />
                                    <Stack.Screen name="scanner" />
                                    <Stack.Screen name="(profileEditors)" />
                                    <Stack.Screen name="+not-found" />
                                </Stack>
                            )}
                        </View>
                        {!online && (
                            <View style={StyleSheet.absoluteFill}>
                                <OfflineScreen />
                            </View>
                        )}
                    </GestureHandlerRootView>
                    <Toast
                        config={toastConfig}
                        position="bottom"
                        visibilityTime={2500}
                    />
                </SafeAreaProvider>
            </QueryClientProvider>
        </>
    );
}
