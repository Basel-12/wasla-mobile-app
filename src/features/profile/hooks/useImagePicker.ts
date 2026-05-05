import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker(onImageSelected: (uri: string) => void) {
	const openGallery = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission required",
				"Please allow access to your photos.",
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: false,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			onImageSelected(result.assets[0].uri);
		}
	};

	const openCamera = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission required",
				"Please allow access to your camera.",
			);
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			onImageSelected(result.assets[0].uri);
		}
	};

	return { openGallery, openCamera };
}
