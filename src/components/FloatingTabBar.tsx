import IonIcon from "@expo/vector-icons/Ionicons"; // or any icon lib you use
import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingTabBar({
	state,
	descriptors,
	navigation,
}: any) {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.wrapper, { bottom: insets.bottom + 16 }]}>
			<BlurView intensity={60} tint="dark" style={styles.blur}>
				<View style={styles.tabRow}>
					{state.routes.map((route: any, index: number) => {
						const { options } = descriptors[route.key];
						const isFocused = state.index === index;

						const icons: Record<string, any> = {
							"(home)/index": "home",
							"(profile)/index": "person",
						};

						const labels: Record<string, string> = {
							"(home)/index": "Home",
							"(profile)/index": "Profile",
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
							<Pressable
								key={route.key}
								onPress={onPress}
								style={styles.tab}
								accessibilityRole="button"
								accessibilityState={
									isFocused ? { selected: true } : {}
								}
							>
								{/* Active pill background */}
								{isFocused && (
									<View style={styles.activePill} />
								)}

								<IonIcon
									name={icons[route.name]}
									size={22}
									color={
										isFocused
											? "#5140E8"
											: "rgba(255,255,255,0.5)"
									}
								/>
								<Text
									style={[
										styles.label,
										{
											color: isFocused
												? "#5140E8"
												: "rgba(255,255,255,0.5)",
										},
									]}
								>
									{label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</BlurView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		left: 24,
		right: 24,
		borderRadius: 28,
		overflow: "hidden",
		// Shadow
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 12,
	},
	blur: {
		borderRadius: 28,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.12)",
	},
	tabRow: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "rgba(20,20,30,0.4)", // fallback on Android where blur is weaker
	},
	tab: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		gap: 4,
		borderRadius: 20,
		overflow: "hidden",
	},
	activePill: {
		position: "absolute",
		inset: 0,
		backgroundColor: "rgba(81,64,232,0.12)",
		borderRadius: 20,
	},
	label: {
		fontSize: 11,
		fontFamily: "Cairo_600SemiBold",
	},
});
