import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
	interpolateColor,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INACTIVE_COLOR = "rgb(109,114,128)";
const ACTIVE_COLOR = "#FFFFFF";

export default function TabItem({ isFocused, onPress, iconName, label }: any) {
	const progress = useSharedValue(isFocused ? 1 : 0);

	useEffect(() => {
		progress.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
	}, [isFocused]);


	const pillStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			["rgba(0,0,0,0)", "#5140E8"],
		),
		transform: [{ scale: 0.96 + progress.value * 0.04 }],
		borderRadius: 999,
	}));

	const labelStyle = useAnimatedStyle(() => ({
		color: interpolateColor(
			progress.value,
			[0, 1],
			[INACTIVE_COLOR, ACTIVE_COLOR],
		),
		opacity: progress.value,
		width: progress.value * 52,
		overflow: "hidden",
		marginLeft: 8,
	}));

	return (
		<AnimatedPressable
			onPress={onPress}
			style={[
				{
					flexDirection: "row",
					paddingHorizontal: 12,
					paddingVertical: 6,
					alignItems: "center",
				},
				pillStyle,
			]}
		>
			{/* Regular Ionicons — color driven from JS state via useAnimatedReaction */}
			<Ionicons
				name={iconName}
				size={22}
				color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
			/>
			<Animated.Text numberOfLines={1} style={labelStyle}>
				{label}
			</Animated.Text>
		</AnimatedPressable>
	);
}
