import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabItem from "./TabItem";

export default function FloatingTabBar({
	state,
	descriptors,
	navigation,
}: any) {
	const insets = useSafeAreaInsets();
	console.log(state.routes);
	const { t } = useTranslation();

	return (
		<View
			className="bg-white rounded-full p-2 w-[90%] mx-auto absolute z-10"
			style={{
				bottom: insets.bottom + 16,
				left:'5%',
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 8 },
				shadowOpacity: 0.12,
				shadowRadius: 16,
				elevation: 10,
			}}
		>
			<BlurView
				intensity={60}
				style={{
					padding: 3,
				}}
			>
				<View className="flex-row items-center justify-between px-6">
					{state.routes.map((route: any, index: number) => {
						// const { options } = descriptors[route.key];
						const isFocused = state.index === index;

						const icons: Record<string, any> = {
							"(home)": "home",
							"(scan)/index": "scan",
							"(profile)": "person",
						};

						const labels: Record<string, string> = {
							"(home)": t("tabs.home"),
							"(scan)/index": t("tabs.scan"),
							"(profile)": t("tabs.profile"),
						};

						const label = labels[route.name];

						const onPress = () => {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});
							if (!isFocused && !event.defaultPrevented) {
								navigation.navigate(route.name);
							}
						};

						return (
							<TabItem
								key={route.key}
								onPress={onPress}
								isFocused={isFocused}
								iconName={icons[route.name]}
								label={label}
							/>
						);
					})}
				</View>
			</BlurView>
		</View>
	);
}
