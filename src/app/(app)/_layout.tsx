import FloatingTabBar from "@/components/FloatingTabBar";
import { Tabs } from "expo-router";

export default function AppLayout() {
	return (
		<Tabs tabBar={(props) => <FloatingTabBar {...props} />}>
			<Tabs.Screen
				name="(home)/index"
				options={{ title: "Home", headerShown: false }}
			/>
			{/* <Tabs.Screen
				name="(profile)/index"
				options={{ title: "Profile" }}
			/> */}
		</Tabs>
	);
}
