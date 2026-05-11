import Skeleton from '@/components/Skeleton';
import { useProfileQuery } from '@/hooks/useCurrentUser';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
    const { t } = useTranslation();

    const { data, isLoading } = useProfileQuery();

    return (
        <View
            className="w-[92%] mx-auto mt-5 px-4 py-4 rounded-[28px] bg-white/70 flex-row items-center justify-between border border-gray-100"
            style={{
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
            }}
        >
            {/* profile image */}
            <View className=" flex-row items-center gap-2">
                {/* image */}
                <View
                    className="w-16 h-16 rounded-full bg-white border border-gray-100 items-center justify-center overflow-hidden"
                    style={{
                        shadowColor: '#5140E8',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: 2,
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                    ) : (
                        <Image
                            source={{
                                uri:
                                    data?.avatar ||
                                    require('../../../../assets/images/profile.jpg'),
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 32,
                            }}
                            contentFit="cover"
                            cachePolicy="memory"
                        />
                    )}
                </View>
                {/* name */}
                <View className=" gap-1 ">
                    <Text className="text-sm text-gray-500">
                        {t('home.header.welcome')}
                    </Text>
                    {isLoading ? (
                        <Skeleton width={100} height={20} borderRadius={10} />
                    ) : (
                        <Text className="text-[18px] font-extrabold text-[#111827]">
                            {data?.name.split(' ')[0]} 👋
                        </Text>
                    )}
                </View>
            </View>

            {/* notification icon */}
            <View>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
