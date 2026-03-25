import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
import '@/i18n/i18n';
import { initializeLanguage } from "@/i18n/i18n";
import { Href, router, SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
	const [isReady, setIsReady] = useState(false);
	useEffect(() => {
		const init = async () => {
			await initializeLanguage();
			await SplashScreen.hideAsync();
			router.replace("/(onboarding)" as Href);
		};
		init();
	}, []);

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</SafeAreaProvider>
	);
}
