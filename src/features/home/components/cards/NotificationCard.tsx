import { Text, View } from "react-native";

export default function NotificationCard() {
	return (
		<View className="w-full  border border-gray-200 rounded-2xl p-4 flex-row items-baseline justify-between">
			<View className="flex-row items-baseline gap-2">
				{/* icon */}
				<View className="w-2 h-2 rounded-full bg-primary"></View>
				{/* text  */}
				<View className="items-center justify-center gap-1">
					<Text className="text-md font-bold">
						Notification Title
					</Text>
					<Text className="text-xs text-gray-500">
						Notification Description
					</Text>
				</View>
			</View>
			{/* time */}
			<Text className="text-sm text-gray-500">2 min ago</Text>
		</View>
	);
}
