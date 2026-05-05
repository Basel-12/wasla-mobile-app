import CustomHeader from "@/components/CustomHeader";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import AvatarPicker from "../components/AvatarPicker";
import ProfileCard from "../components/card";
import { useImagePicker } from "../hooks/useImagePicker";

export default function ProfileScreen() {
	const { t } = useTranslation();
	const [avatar, setAvatar] = useState<string | null>(null);
	const [sheetVisible, setSheetVisible] = useState(false);
	const { openGallery, openCamera } = useImagePicker((uri) => {
		setAvatar(uri);
		setSheetVisible(false);
	});
	console.log(avatar);
	const insets = useSafeAreaInsets();
	return (
		<SafeAreaView className="flex-1">
			<CustomHeader
				title={t("profile.title")}
				showBackButton={false}
				onBackPress={() => router.back()}
			/>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					flexGrow: 1,
					flexDirection: "column",
					gap: 16,
					padding: 16,
					paddingBottom: insets.bottom,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* profile picture */}
				<View className="flex-row items-center justify-center w-full">
					<View className="relative w-32 h-32">
						<Image
							source={
								avatar
									? avatar // expo-image accepts string URI directly
									: require("../../../../assets/images/profile.jpg") // relative static path
							}
							style={{
								width: 128,
								height: 128,
								borderRadius: 64,
								borderWidth: 1,
								borderColor: "#eab308",
								backgroundColor: "white",
							}}
							contentFit="cover"
							cachePolicy="none"
						/>
						<TouchableOpacity
							className="absolute -bottom-4 right-0 bg-white rounded-full p-1"
							onPress={() => setSheetVisible(true)}
						>
							<EvilIcons name="pencil" size={24} color="black" />
						</TouchableOpacity>
					</View>
				</View>
				<View className="flex-1 gap-6">
					<ProfileCard
						icon={
							<Ionicons
								name="person-outline"
								size={24}
								color="#63677E"
							/>
						}
						data={t("profile.name")}
						showEditIcon={true}
						onPress={() => {}}
					/>
					<ProfileCard
						icon={
							<Ionicons
								name="mail-outline"
								size={24}
								color="#63677E"
							/>
						}
						data={t("profile.email")}
						showEditIcon={true}
						onPress={() => {}}
					/>
					<ProfileCard
						icon={
							<Ionicons
								name="call-outline"
								size={24}
								color="#63677E"
							/>
						}
						data={t("profile.phone")}
						showEditIcon={true}
						onPress={() => {}}
					/>
					<ProfileCard
						icon={
							<Ionicons
								name="globe-outline"
								size={24}
								color="#63677E"
							/>
						}
						data={t("profile.language")}
						showEditIcon={true}
						onPress={() => {}}
					/>
					<ProfileCard
						icon={
							<MaterialIcons
								name="logout"
								size={24}
								color="#63677E"
							/>
						}
						data={t("profile.logout")}
						showEditIcon={false}
						onPress={() => {}}
					/>
				</View>
			</ScrollView>
			<AvatarPicker
				visible={sheetVisible}
				onClose={() => setSheetVisible(false)}
				onCamera={openCamera}
				onGallery={openGallery}
			/>
		</SafeAreaView>
	);
}
