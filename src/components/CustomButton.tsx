import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    I18nManager,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
	View,
} from 'react-native';

type CustomButtonProps = {
    onPress?: TouchableOpacityProps['onPress'];
    title: string;
    disabled?: boolean;
    accessibilityLabel?: string;
    fullWidth?: boolean;
    showArrow?: boolean;
	borderRadius?: number;
};

const CustomButton = ({
    onPress,
    title,
    disabled = false,
    accessibilityLabel,
    fullWidth = false,
    showArrow = false,
    borderRadius = 16,
}: CustomButtonProps) => {
    const isRTL = I18nManager.isRTL;
    return (
        <TouchableOpacity
            onPress={onPress}
            className={` ${fullWidth ? 'w-full' : 'w-[70%]'}`}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
            accessibilityState={{ disabled }}
			
        >
            <LinearGradient
                colors={['#5140E8', '#15AA96']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    padding: 12,
                    borderRadius: borderRadius,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-white text-xl">{title}</Text>
                    {showArrow && (
                        <Ionicons
                            name={isRTL ? 'arrow-back' : 'arrow-forward'}
                            size={24}
                            color="white"
                        />
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default CustomButton;
