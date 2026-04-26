import { ScrollView, View } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import Header from "../components/Header";
import QuickActions from "../components/QuickActions";
import Notifications from "../components/Notifications";

export default function HomeScreen() {
	const insets = useSafeAreaInsets();
	return (
		<SafeAreaView className="flex-1 bg-bgGrey">
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: insets.bottom + 32,
					// paddingTop: insets.top,
				}}
			>
				<Header />
				<View className="bg-white flex-1 p-6 gap-4">
					<QuickActions />
					{/* stats cards section  */}
					<Notifications />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
