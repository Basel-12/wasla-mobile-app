import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
	I18nManager,
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from "react-native";

type CustomButtonProps = {
	onPress?: TouchableOpacityProps["onPress"];
	title: string;
	disabled?: boolean;
	accessibilityLabel?: string;
	fullWidth?: boolean;
	showArrow?: boolean;
};

const ArrowIcon = ({ isRTL }: { isRTL: boolean }) => (
	<Text
		className={`text-white text-2xl ${isRTL ? "mr-3" : "ml-3"}`}
		style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
	>
		→
	</Text>
);

const CustomButton = ({
	onPress,
	title,
	disabled = false,
	accessibilityLabel,
	fullWidth = false,
	showArrow = false,
}: CustomButtonProps) => {
	const isRTL = I18nManager.isRTL;
	return (
		<TouchableOpacity
			onPress={onPress}
			className={` ${fullWidth ? "w-full" : "w-[70%]"}`}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel || title}
			accessibilityState={{ disabled }}
		>
			<LinearGradient
				colors={["#5140E8", "#15AA96"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={{
					padding: 12,
					borderRadius: 16,
					alignItems: "center",
					justifyContent: "center",
					opacity: disabled ? 0.5 : 1,
				}}
			>
				<View className="flex-row items-center justify-center">
					{isRTL && showArrow && <ArrowIcon isRTL={isRTL} />}
					<Text className="text-white text-xl">{title}</Text>
					{!isRTL && showArrow && <ArrowIcon isRTL={isRTL} />}
				</View>
			</LinearGradient>
		</TouchableOpacity>
	);
};

export default CustomButton;
