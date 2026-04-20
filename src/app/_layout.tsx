import "@/i18n/i18n";
import { initializeLanguage } from "@/i18n/i18n";
import {
	Cairo_400Regular,
	Cairo_600SemiBold,
	Cairo_700Bold,
	useFonts,
} from "@expo-google-fonts/cairo";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../../global.css";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
	const [isReady, setIsReady] = useState(false);
	const [fontsLoaded, fontError] = useFonts({
		Cairo_400Regular,
		Cairo_600SemiBold,
		Cairo_700Bold,
	});
	useEffect(() => {
		if (!fontsLoaded && !fontError) return;
		const init = async () => {
			await initializeLanguage();
			setIsReady(true);
			await SplashScreen.hideAsync();
			// router.replace("/(onboarding)" as Href);
		};
		init();
	}, [fontsLoaded, fontError]);

	if (!isReady) {
		return null;
	}
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

	return (
		<>
			<View style={{ flex: 1, backgroundColor: "#f6f6f8" }}>
				<StatusBar backgroundColor="#f6f6f8" barStyle="dark-content" />
				<SafeAreaProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="(onboarding)" />
						<Stack.Screen name="(auth)" />
					</Stack>
				</SafeAreaProvider>
			</View>
			<Toast config={toastConfig} position="bottom" />
		</>
	);
}
