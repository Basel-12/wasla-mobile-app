import { Dimensions, KeyboardAvoidingView, ScrollView } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	const insets = useSafeAreaInsets();
	const screenHeight = Dimensions.get("window").height;

	return (
		<KeyboardAvoidingView
			behavior="padding"
			style={{
				flex: 1,
				paddingTop: insets.top,
				backgroundColor: "#f6f6f8",
			}}
		>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{
					minHeight: screenHeight,
					justifyContent: "center",
					paddingHorizontal: 24,
					paddingVertical: 32,
					paddingBottom: insets.bottom,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<SafeAreaView>{children}</SafeAreaView>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};
