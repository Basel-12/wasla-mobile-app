import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionCardProps {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    onPress: () => void;
}

export default function ActionCard({
    icon,
    title,
    description,
    onPress,
    iconColor = '#5140E8',
}: ActionCardProps) {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="w-40">
            <View className="bg-white flex items-center justify-center border border-gray-100 rounded-2xl px-4 py-6">
                <View className="flex items-center justify-center w-14 h-14 rounded-full bg-bgGrey">
                    <Ionicons name={icon as any} size={24} color={iconColor} />
                </View>
                <Text className="text-lg font-bold text-center">{title}</Text>
                <Text className="text-sm text-gray-500 text-center">
                    {description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
