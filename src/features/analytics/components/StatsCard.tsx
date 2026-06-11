import { Text, View } from 'react-native';

interface StatsCardProps {
    label: string;
    value: string | number;
    accent?: string;
}

export default function StatsCard({ label, value, accent = '#5140E8' }: StatsCardProps) {
    return (
        <View className="flex-1 bg-white rounded-2xl p-4 gap-1 border border-gray-100 items-center">
            <Text className="text-2xl font-bold" style={{ color: accent }}>
                {value}
            </Text>
            <Text className="text-xs text-gray-500 text-center">{label}</Text>
        </View>
    );
}
