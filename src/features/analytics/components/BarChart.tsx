import { Text, View } from 'react-native';
import { TopSign } from '../services/analytics.service';

interface BarChartProps {
    data: TopSign[];
}

export default function BarChart({ data }: BarChartProps) {
    if (data.length === 0) return null;

    const maxCount = Math.max(...data.map((d) => d.count));

    return (
        <View className="gap-3">
            {data.map((item) => {
                const fillPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                    <View key={item.label} className="gap-1">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-gray-700">
                                {item.label}
                            </Text>
                            <Text className="text-sm text-gray-400">{item.count}</Text>
                        </View>
                        <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${fillPercent}%`,
                                    backgroundColor: '#5140E8',
                                }}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
