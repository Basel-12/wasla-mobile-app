import FloatingTabBar from "@/components/FloatingTabBar";
import { Tabs } from "expo-router";

export default function AppLayout() {
	return (
		<Tabs
			tabBar={(props) => <FloatingTabBar {...props} />}
			screenOptions={{ headerShown: false }}
		>
			<Tabs.Screen
				name="(home)"
				options={{ title: "Home", headerShown: false }}
			/>
			<Tabs.Screen
				name="(scan)/index"
				options={{ title: "Scan", headerShown: false }}
			/>
			<Tabs.Screen
				name="(profile)/index"
				options={{ title: "Profile", headerShown: false }}
			/>
		</Tabs>
	);
}
