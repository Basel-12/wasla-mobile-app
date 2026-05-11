import i18n from '@/i18n/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

interface NotificationCardProps {
    notification: {
        title: string;
        body: string;
        id: number;
        title_translations: {
            en: string;
            ar: string;
        };
        body_translations: {
            en: string;
            ar: string;
        };
    };
    time: string;
}

export default function NotificationCard({
    notification,
    time,
}: NotificationCardProps) {
    const diffMs = Date.now() - new Date(time).getTime();

    const MS = 1000;
    const MIN = 60 * MS;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;

    const { value, unit } =
        diffMs < MIN
            ? { value: Math.floor(diffMs / MS), unit: 's' }
            : diffMs < HOUR
              ? { value: Math.floor(diffMs / MIN), unit: 'm' }
              : diffMs < DAY
                ? { value: Math.floor(diffMs / HOUR), unit: 'h' }
                : { value: Math.floor(diffMs / DAY), unit: 'd' };

    const localizedUnit = i18n.t(`home.notifications.units.${unit}`);

    return (
        <View className="w-full  bg-white rounded-3xl py-6 px-2 flex-row  items-center justify-evenly gap- border border-gray-100 overflow-hidden">
            {/* icon */}
            <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-primary"></View>
                <View className="bg-bgGrey rounded-full p-3">
                    <View className="relative">
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color="#5140E8"
                        />
                        <View
                            className="w-2 h-2 rounded-full bg-primary absolute "
                            style={{
                                top: 3,
                                right: 4,
                            }}
                        />
                    </View>
                </View>
            </View>
            {/* text  */}
            <View className="ml-2">
                <Text className="text-lg font-bold">
                    {notification.title_translations[
                        i18n.language as keyof typeof notification.title_translations
                    ] ?? notification.title}
                </Text>
                <Text className="text-xs text-gray-500 text-center ">
                    {notification.body_translations[
                        i18n.language as keyof typeof notification.body_translations
                    ].slice(0, 40) ?? notification.body.slice(0, 40)}
                    ...
                </Text>
            </View>
            {/* time */}
            <Text className="text-xs text-gray-500">
                {i18n.t('home.notifications.timeAgo', {
                    value,
                    unit: localizedUnit,
                })}
            </Text>
        </View>
    );
}
