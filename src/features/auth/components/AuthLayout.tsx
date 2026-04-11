import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	const insets = useSafeAreaInsets();
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-bgGrey"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<View className="flex-1 px-6">{children}</View>

			<View className="py-3">
				<Text className="text-center text-sm text-gray-500">
					&copy; {new Date().getFullYear()} SignBridge. All rights
					reserved.
				</Text>
			</View>
		</KeyboardAvoidingView>
	);
};
