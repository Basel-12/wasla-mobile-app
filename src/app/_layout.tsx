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
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
		</>
	);
}
