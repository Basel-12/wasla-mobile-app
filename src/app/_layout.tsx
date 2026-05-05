import "@/i18n/i18n";
import { initializeLanguage } from "@/i18n/i18n";
import { useNotificationListeners } from "@/services/notifications.listener";
import { StorageService } from "@/services/storage.service";
import { StorageKeys } from "@/utils/constants";
import {
	Cairo_400Regular,
	Cairo_600SemiBold,
	Cairo_700Bold,
	useFonts,
} from "@expo-google-fonts/cairo";
import { Href, router, SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
	const [isReady, setIsReady] = useState(false);
	const [initialRoute, setInitialRoute] = useState<Href | undefined>(
		undefined,
	);
	const [fontsLoaded, fontError] = useFonts({
		Cairo_400Regular,
		Cairo_600SemiBold,
		Cairo_700Bold,
	});

	//listen to notifications
	useNotificationListeners();

	useEffect(() => {
		if (!fontsLoaded && !fontError) return;
		const init = async () => {
			await initializeLanguage();
			const onboardingCompleted = await StorageService.getItem(
				StorageKeys.ONBOARDING_COMPLETED,
				false,
			);
			setInitialRoute(
				onboardingCompleted ? "/(auth)/login" : "/(onboarding)",
			);
			setIsReady(true);
			await SplashScreen.hideAsync();
		};
		init();
	}, [fontsLoaded, fontError]);

	useEffect(() => {
		if (isReady && initialRoute) {
			router.replace(initialRoute);
		}
	}, [isReady, initialRoute]);

	const toastConfig = {
		success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
			<View className="bg-white border-l-4 border-green-500 rounded-xl px-4 py-3 mx-4 shadow-md">
				{text1 && (
					<Text
						style={{ fontFamily: "Cairo_700Bold" }}
						className="text-gray-900"
					>
						{text1}
					</Text>
				)}
				{text2 && (
					<Text
						style={{ fontFamily: "Cairo_400Regular" }}
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
						style={{ fontFamily: "Cairo_700Bold" }}
						className="text-gray-900"
					>
						{text1}
					</Text>
				)}
				{text2 && (
					<Text
						style={{ fontFamily: "Cairo_400Regular" }}
						className="text-gray-500 text-sm"
					>
						{text2}
					</Text>
				)}
			</View>
		),
	};

	if (!isReady) {
		return (
			<SafeAreaProvider>
				<StatusBar
					backgroundColor="#f6f6f8"
					barStyle="dark-content"
					translucent={false}
				/>
			</SafeAreaProvider>
		);
	}

	return (
		<>
			<SafeAreaProvider>
				<GestureHandlerRootView
					style={{ flex: 1, backgroundColor: "#f6f6f8" }}
				>
					<StatusBar
						backgroundColor="#f6f6f8"
						barStyle="dark-content"
						translucent={false}
					/>
					<View style={{ flex: 1, backgroundColor: "#f6f6f8" }}>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(onboarding)" />
							<Stack.Screen name="(auth)" />
							<Stack.Screen name="(app)" />
							<Stack.Screen name="notifications" />
							<Stack.Screen name="+not-found" />
						</Stack>
					</View>
				</GestureHandlerRootView>
				<Toast
					config={toastConfig}
					position="bottom"
					visibilityTime={2500}
				/>
			</SafeAreaProvider>
		</>
	);
}
