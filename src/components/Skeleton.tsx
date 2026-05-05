import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface SkeletonProps {
	width?: number | `${number}%`;
	height?: number;
	borderRadius?: number;
	style?: ViewStyle;
}

export default function Skeleton({
	width = "100%",
	height = 16,
	borderRadius = 8,
	style,
}: SkeletonProps) {
	const opacity = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, []);

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: "#E0E0E0",
					opacity,
				},
				style,
			]}
		/>
	);
}
