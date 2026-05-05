import i18n from "@/i18n/i18n";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { Text } from "react-native";

interface Props {
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
	} | null;
	time: string;
	onClose: () => void;
}

export default function NotificationDetailSheet({
	notification,
	onClose,
	time,
}: Props) {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const detailedTime = new Date(time).toLocaleString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	const handleSheetChanges = useCallback((index: number) => {
		if (index === -1) onClose();
	}, []);

	if (!notification) return null;

	const title =
		notification.title_translations[i18n.language as "en" | "ar"] ??
		notification.title;

	const body =
		notification.body_translations[i18n.language as "en" | "ar"] ??
		notification.body;

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={0}
			snapPoints={["40%", "70%"]}
			enablePanDownToClose
			onClose={onClose}
			onChange={handleSheetChanges}
		>
			<BottomSheetView className="flex-1 p-6 gap-4">
				<Text className="text-xl font-bold">{title}</Text>
				<Text className="text-gray-500 text-sm">{body}</Text>
				<Text className="text-xs text-gray-400">
					{detailedTime}
				</Text>
			</BottomSheetView>
		</BottomSheet>
	);
}
