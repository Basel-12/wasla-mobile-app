import Skeleton from '@/components/Skeleton';
import { View } from 'react-native';

export default function ProfileCardSkeleton() {
    return (
        <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl gap-3">
            <Skeleton width={30} height={30} borderRadius={10} />
            <View className="flex-1">
                <Skeleton width={100} height={20} borderRadius={10} />
                <Skeleton
                    width={100}
                    height={20}
                    borderRadius={10}
                    style={{ marginTop: 10 }}
                />
            </View>
            <Skeleton width={30} height={30} borderRadius={15} />
        </View>
    );
}
