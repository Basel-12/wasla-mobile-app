import { Text, TouchableOpacity, View } from "react-native";

interface SectionProps {
	title: string;
	viewAll?: boolean;
	viewAllText?: string;
	onViewAllPress?: () => void;
	children?: React.ReactNode;
	viewAllDisabled?: boolean;
}

export default function Section({
	title,
	viewAll = false,
	viewAllText = "View All",
	onViewAllPress,
	children,
	viewAllDisabled = false,
}: SectionProps) {
	return (
		<View className="gap-4">
			<View className="flex-row items-center justify-between">
				<Text className="text-lg font-bold">{title}</Text>
				{viewAll && (
					<TouchableOpacity
						onPress={onViewAllPress}
						disabled={viewAllDisabled}
					>
						<Text
							className={`text-sm ${viewAllDisabled ? "text-gray-500" : "text-primary"}`}
						>
							{viewAllText}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{children}
		</View>
	);
}
