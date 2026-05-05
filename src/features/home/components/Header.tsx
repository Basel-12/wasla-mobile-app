import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export default function Header() {
	const { t } = useTranslation();
	return (
		<View className="bg-bgGrey p-4 rounded-b-3xl flex-row items-center justify-between">
			{/* profile image */}
			<View className=" flex-row items-center gap-2">
				{/* image */}
				<View className="w-14 h-14 rounded-full bg-white items-center justify-center">
					{/* <Image  */}
					<Ionicons name="person" size={24} color="black" />
				</View>
				{/* name */}
				<View className="items-center gap-1 justify-center">
					<Text className="text-sm text-gray-500">
						{t("home.header.welcome")}
					</Text>
					<Text className="text-lg font-bold">John Doe</Text>
				</View>
			</View>

			{/* notification icon */}
			<View>
				<TouchableOpacity
					onPress={() => router.push("/notifications")}
				>
					<Ionicons
						name="notifications-outline"
						size={24}
						color="black"
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}
