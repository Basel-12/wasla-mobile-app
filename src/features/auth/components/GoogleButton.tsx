import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function GoogleButton({
    onPress,
    title,
    loading,
}: {
    onPress: () => void;
    title: string;
    loading: boolean;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="w-full flex-row items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-4 shadow-sm"
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#5140E8" />
            ) : (
                <>
                    <AntDesign name="google" size={24} color="#5140E8" />
                    <Text className="text-black text-md font-bold">
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
