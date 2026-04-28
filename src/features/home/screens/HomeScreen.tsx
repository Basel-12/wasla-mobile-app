import { ScrollView, View } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import Header from "../components/Header";
import Notifications from "../components/Notifications";
import QuickActions from "../components/QuickActions";

export default function HomeScreen() {
	const insets = useSafeAreaInsets();
	return (
		<View className="flex-1">
			<SafeAreaView edges={["top"]} className="bg-bgGrey flex-0" />
			<SafeAreaView
				className="flex-1 bg-white"
				edges={["left", "right", "bottom"]}
			>
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
		</View>
	);
}
