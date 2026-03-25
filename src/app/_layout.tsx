import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

import { Href, router, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
	useEffect(() => {
		const init = async () => {
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
