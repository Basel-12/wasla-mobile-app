import React from "react";
import {
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

const ArrowIcon = () => <Text className="text-white text-xl ml-2">→</Text>;

const CustomButton = ({
	onPress,
	title,
	disabled = false,
	accessibilityLabel,
	fullWidth = false,
	showArrow = false,
}: CustomButtonProps) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			className={`bg-mainBlue p-4 rounded-xl items-center justify-center duration-700 ${
				fullWidth ? "w-full" : "w-[70%]"
			} ${disabled ? "bg-[#c2cef5]" : ""}`}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel || title}
			accessibilityState={{ disabled }}
		>
			<View className="flex-row items-center justify-center">
				<Text className="text-white text-xl">{title}</Text>
				{showArrow && <ArrowIcon />}
			</View>
		</TouchableOpacity>
	);
};

export default CustomButton;
