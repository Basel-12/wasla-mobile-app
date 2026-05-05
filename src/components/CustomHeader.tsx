import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity, View } from "react-native";

interface CustomHeaderProps {
	title: string;
	showBackButton?: boolean;
	onBackPress?: () => void;
}

export default function CustomHeader({
	title,
	showBackButton = true,
	onBackPress,
}: CustomHeaderProps) {
	return (
		<View className={`flex-row items-center  p-4 bg-bgGrey ${showBackButton ? "justify-between" : "justify-center"}`}>
			{showBackButton && (
				<TouchableOpacity
					onPress={onBackPress}
					className="p-2 bg-white rounded-lg"
				>
					<Ionicons name="arrow-back" size={24} color="black" />
				</TouchableOpacity>
			)}

			<Text className="text-2xl font-bold text-center ">{title}</Text>
			{showBackButton && <View className="w-10" />}
		</View>
	);
}
