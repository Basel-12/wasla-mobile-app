import i18n from "@/i18n/i18n";
import { Text, View } from "react-native";

interface NotificationCardProps {
	notification: {
		title: string;
		body: string;
		id: number;
		title_translations: {
			en: string;
			ar: string;
		};
		body_translations: {
			en: string;
			ar: string;
		};
	};
	time: string;
}

export default function NotificationCard({
	notification,
	time,
}: NotificationCardProps) {
	const diffMs = Date.now() - new Date(time).getTime();

	const MS = 1000;
	const MIN = 60 * MS;
	const HOUR = 60 * MIN;
	const DAY = 24 * HOUR;

	const { value, unit } =
		diffMs < MIN
			? { value: Math.floor(diffMs / MS), unit: "s" }
			: diffMs < HOUR
				? { value: Math.floor(diffMs / MIN), unit: "m" }
				: diffMs < DAY
					? { value: Math.floor(diffMs / HOUR), unit: "h" }
					: { value: Math.floor(diffMs / DAY), unit: "d" };
	return (
		<View className="w-full  border border-gray-200 rounded-2xl p-6 flex-row items-baseline justify-between">
			<View className="flex-row items-baseline justify-start  gap-2">
				{/* icon */}
				<View className="w-2 h-2 rounded-full bg-primary"></View>
				{/* text  */}
				<View className="items-start justify-center gap-2">
					<Text className="text-lg font-bold">
						{notification.title_translations[
							i18n.language as keyof typeof notification.title_translations
						] ?? notification.title}
					</Text>
					<Text className="text-xs text-gray-500 text-center ">
						{notification.body_translations[
							i18n.language as keyof typeof notification.body_translations
						].slice(0, 40) ?? notification.body.slice(0, 40)}
						...
					</Text>
				</View>
			</View>
			{/* time */}
			<Text className="text-sm text-gray-500">
				{value} {unit} ago
			</Text>
		</View>
	);
}
