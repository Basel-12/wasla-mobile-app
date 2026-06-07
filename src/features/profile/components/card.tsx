import i18n from '@/i18n/i18n';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileCardProps {
    icon: React.ReactNode;
    title: string;
    data: string;
    showEditIcon: boolean;
    dangerous?: boolean;
    disabled?: boolean;
    onPress: () => void;
}

export default function ProfileCard({
    icon,
    title,
    data,
    showEditIcon,
    onPress,
    dangerous = false,
    disabled = false,
}: ProfileCardProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="flex-row items-center justify-between bg-white p-4 rounded-2xl gap-3"
            style={{
                shadowColor: '#63677E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 2,
                opacity: disabled ? 0.7 : 1,
            }}
            disabled={disabled}
        >
            <View
                pointerEvents="none"
                className={`w-10 h-10 items-center justify-center rounded-xl ${dangerous ? 'bg-[#fbeceb]' : 'bg-[#f2f0fc]'}`}
            >
                {icon}
            </View>

            <View className="flex-1">
                <Text
                    className={`text-lg font-semibold ${dangerous ? 'text-[#c91d12]' : 'text-[#111827]'}`}
                >
                    {title}
                </Text>
                <Text className="text-sm text-gray-500">{data}</Text>
            </View>

            {showEditIcon && (
                <View
                    className={`p-2 rounded-full ${dangerous ? 'bg-[##fbeceb]' : 'bg-[#f2f0fc]'}`}
                >
                    <SimpleLineIcons
                        name={
                            i18n.language == 'ar' ? 'arrow-left' : 'arrow-right'
                        }
                        size={18}
                        color={dangerous ? '#c91d12' : '#5140E8'}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
}
