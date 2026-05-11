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
			<SafeAreaView
				className="flex-1 bg-bgGrey"
			>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: insets.bottom + 64,
						// paddingTop: insets.top,
					}}
					showsVerticalScrollIndicator={false}
				>
					<Header />
					<View className="bg-bgGrey flex-1 p-6 gap-4">
						<QuickActions />
						{/* stats cards section  */}
						<Notifications />
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}
