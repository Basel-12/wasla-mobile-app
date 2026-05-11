import i18n from '@/i18n/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

interface NotificationCardProps {
    id: number;
    markAsRead: (notificationId: number) => void;
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
        createdAt: string;
    };
    time: string;
    isRead: boolean;
    onPress: () => void;
}

export default function NotificationCard({
    notification,
    markAsRead,
    id,
    time,
    isRead,
    onPress,
}: NotificationCardProps) {
    const date = new Date(time);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours}:${minutes} ${hours > 12 ? 'PM' : 'AM'}`;

    const onClick = () => {
        if (!isRead) markAsRead(id);
        onPress();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full  rounded-2xl p-4 gap-6  flex-row items-center ${!isRead ? 'bg-secondary/20' : 'bg-white/50'}`}
            onPress={onClick}
        >
            <View className="w-10 h-10 rounded-full bg-bgGrey   flex-shrink-0">
                <View className="w-full h-full items-center justify-center bg-primary rounded-full">
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="white"
                    />
                </View>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold">
                        {notification.title_translations[
                            i18n.language as keyof typeof notification.title_translations
                        ] ?? notification.title}
                    </Text>
                    {!isRead && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                    )}
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500 w-2/3">
                        {notification.body_translations[
                            i18n.language as keyof typeof notification.body_translations
                        ] ?? notification.body}
                    </Text>
                    <View className="items-center justify-center gap-2 ">
                        <Text className="text-md text-gray-500">{month}</Text>
                        <Text className="text-lg font-bold">{day}</Text>
                        <Text className="text-sm text-gray-500">
                            {formattedTime}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
