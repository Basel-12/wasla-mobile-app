import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, TouchableOpacity, View } from "react-native";

interface ProfileCardProps {
	icon: React.ReactNode;
	data: string;
	showEditIcon: boolean;
	onPress: () => void;
}

export default function ProfileCard({
	icon,
	data,
	showEditIcon,
	onPress,
}: ProfileCardProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-row items-center justify-between bg-white p-4 rounded-2xl "
			style={{
				shadowColor: "#63677E",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 3.84,
				elevation: 2,
			}}
		>
			<View className="flex-row items-center gap-2">
				{icon}

				<Text className="text-lg font-bold text-gray-500">{data}</Text>
			</View>

			{showEditIcon && (
				<View>
					<FontAwesome name="edit" size={24} color="#63677E" />
				</View>
			)}
		</TouchableOpacity>
	);
}
