import CustomHeader from '@/components/CustomHeader';
import Skeleton from '@/components/Skeleton';
import Section from '@/features/home/components/Section';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarChart from '../components/BarChart';
import StatsCard from '../components/StatsCard';
import { analyticsService } from '../services/analytics.service';

function LoadingSkeleton() {
    return (
        <View className="p-6 gap-6">
            <View className="flex-row gap-3">
                <Skeleton height={80} style={{ flex: 1, borderRadius: 16 }} />
                <Skeleton height={80} style={{ flex: 1, borderRadius: 16 }} />
                <Skeleton height={80} style={{ flex: 1, borderRadius: 16 }} />
            </View>
            <Skeleton height={80} borderRadius={16} />
            <View className="gap-3">
                <Skeleton height={16} width="40%" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} className="gap-1">
                        <Skeleton height={14} width="60%" />
                        <Skeleton height={12} borderRadius={6} />
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function DashboardScreen() {
    const { t } = useTranslation();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: analyticsService.getSummary,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    return (
        <SafeAreaView className="flex-1 bg-bgGrey">
            <CustomHeader title={t('analytics.title')} showBackButton={false} />

            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 24, gap: 24 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            colors={['#5140E8']}
                            tintColor="#5140E8"
                        />
                    }
                >
                    {/* Overview row */}
                    <Section title={t('analytics.overview')}>
                        <View className="flex-row gap-3">
                            <StatsCard
                                label={t('analytics.totalSigns')}
                                value={data?.totalSigns ?? 0}
                            />
                            <StatsCard
                                label={t('analytics.thisWeek')}
                                value={data?.thisWeek ?? 0}
                                accent="#15AA96"
                            />
                            <StatsCard
                                label={t('analytics.sessions')}
                                value={data?.totalSessions ?? 0}
                                accent="#ED4181"
                            />
                        </View>
                    </Section>

                    {/* Avg confidence */}
                    <Section title={t('analytics.avgConfidence')}>
                        <View className="bg-white rounded-2xl p-5 border border-gray-100 items-center">
                            <Text className="text-5xl font-bold text-primary">
                                {data?.avgConfidence
                                    ? `${Math.round(data.avgConfidence * 100)}%`
                                    : '—'}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                {t('analytics.avgConfidenceHint')}
                            </Text>
                        </View>
                    </Section>

                    {/* Top signs bar chart */}
                    <Section title={t('analytics.topSigns')}>
                        <View className="bg-white rounded-2xl p-5 border border-gray-100">
                            {data?.topSigns && data.topSigns.length > 0 ? (
                                <BarChart data={data.topSigns} />
                            ) : (
                                <Text className="text-gray-400 text-sm text-center py-4">
                                    {t('analytics.noData')}
                                </Text>
                            )}
                        </View>
                    </Section>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
