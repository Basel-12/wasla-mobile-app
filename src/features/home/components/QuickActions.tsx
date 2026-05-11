import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import ActionCard from "./cards/ActionCard";
import Section from "./Section";
import { router } from "expo-router";

export default function QuickActions() {
	const { t } = useTranslation();
	const quickActions = [
		{
			icon: "camera",
			title: t("home.quickActions.camera"),
			description: t("home.quickActions.cameraDescription"),
            iconColor: "#15AA96",
			onPress: () => {},
		},
		{
			icon: "heart",
			title: t("home.quickActions.favorites"),
			description: t("home.quickActions.favoritesDescription"),
            iconColor: "#ED4181",
			onPress: () => {},
		},
		{
			icon: "settings",
			title: t("home.quickActions.settings"),
			description: t("home.quickActions.settingsDescription"),
            iconColor: "#5140E8",
			onPress: () => router.push('/(profileEditors)/language'),
		},
	];
	return (
		<Section
			title={t("home.quickActions.title")}
			viewAll={false}
			viewAllText={t("home.quickActions.viewAll")}
			onViewAllPress={() => {}}
		>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				// contentContainerStyle={{ paddingRight: 8 }}
			>
				<View className="flex-row items-stretch justify-between gap-4 flex-nowrap">
					{quickActions.map((action) => (
						<ActionCard
							key={action.icon}
							icon={action.icon}
							iconColor={action.iconColor}
							title={action.title}
							description={action.description}
							onPress={action.onPress}
						/>
					))}
				</View>
			</ScrollView>
		</Section>
	);
}
