import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

export default function FavouriteHeader() {
    const { t } = useTranslation();
    return (
        <View className="flex-row items-center justify-between bg-bgGrey p-6">
            <View className="gap-1">
                <Text className="text-3xl font-bold">
                    {t('favourite.title')}
                </Text>
                <Text className="text-sm text-gray-500">
                    {t('favourite.description')}
                </Text>
            </View>
            {/* settings button  */}
            <TouchableOpacity
                className="p-2 bg-white rounded-full"
                activeOpacity={1}
            >
                <Ionicons name="heart-outline" size={22} color="#5140E8" />
            </TouchableOpacity>
        </View>
    );
}
