// components/ImagePickerSheet.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ImagePickerSheetProps {
	visible: boolean;
	onClose: () => void;
	onCamera: () => void;
	onGallery: () => void;
}

export default function AvatarPicker({
	visible,
	onClose,
	onCamera,
	onGallery,
}: ImagePickerSheetProps) {
	const { t } = useTranslation();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableOpacity
				className="flex-1 bg-black/40"
				onPress={onClose}
			/>
			<View className="bg-white rounded-t-3xl p-6 gap-4">
				<Text className="text-lg font-bold text-center">
					{t("profile.changePhoto")}
				</Text>

				<View className="flex-row gap-4 items-center justify-between">
					<TouchableOpacity
						className="bg-primary rounded-2xl p-4 items-center flex-1"
						onPress={onCamera}
					>
						<Ionicons
							name="camera-outline"
							size={24}
							color="white"
						/>
						<Text className="text-white font-semibold">
							{t("profile.takePhoto")}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className="bg-secondary/20 rounded-2xl p-4 items-center "
						onPress={onGallery}
					>
						<Ionicons
							name="image-outline"
							size={24}
							color="black"
						/>
						<Text className="text-black font-semibold">
							{t("profile.chooseFromGallery")}
						</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					className="p-4 items-center bg-Tertiary rounded-2xl w-1/2 mx-auto"
					onPress={onClose}
				>
					<Text className="text-white font-semibold">
						{t("profile.cancel")}
					</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
}
