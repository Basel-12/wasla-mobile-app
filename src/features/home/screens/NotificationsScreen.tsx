import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import NotificationCardSkeleton from '../components/cards/NotificationCardSkeleton';
import NotificationCard from '../components/notifications/NotificationCard';
import NotificationDetailSheet from '../components/notifications/NotificationDetailSheet';
import { notificationsService } from '../services/notifications.services';

const LIMIT = 7;

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any>(null);

    const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
        useInfiniteQuery({
            queryKey: ['notifications'],
            queryFn: ({ pageParam = 1 }) =>
                notificationsService.getUserNotifications(pageParam, LIMIT),
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                const { page, totalPages } = lastPage.data.meta;
                return page < totalPages ? page + 1 : undefined;
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
        });

    const notifications = data?.pages.flatMap((page) => page.data.data) ?? [];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setRefreshing(false);
    }, [queryClient]);

    const markAsRead = async (notificationId: number) => {
        try {
            const response = await notificationsService.markNotificationAsRead(
                notificationId.toString(),
            );

            if (response.success) {
                queryClient.setQueryData(['notifications'], (old: any) => ({
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: {
                            ...page.data,
                            data: page.data.data.map((n: any) =>
                                n.id === notificationId
                                    ? { ...n, isRead: true }
                                    : n,
                            ),
                        },
                    })),
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const isInitialLoading = isFetching && notifications.length === 0;

    return (
        <SafeAreaView className="flex-1">
            <CustomHeader
                title={t('home.notifications.title')}
                showBackButton={true}
                onBackPress={() => router.back()}
            />

            {isInitialLoading ? (
                <FlatList
                    data={Array.from({ length: 10 })}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={{ gap: 16, padding: 16 }}
                    renderItem={() => <NotificationCardSkeleton />}
                    scrollEnabled={false}
                />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{
                        gap: 16,
                        padding: 16,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#5140E8']}
                            tintColor={'#5140E8'}
                            progressBackgroundColor={'#f6f6f8'}
                        />
                    }
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <ActivityIndicator
                                color="#5140E8"
                                style={{ paddingVertical: 16 }}
                            />
                        ) : null
                    }
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 text-sm">
                            {t('home.notifications.noNotifications')}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <NotificationCard
                            key={item.id}
                            notification={item.notification}
                            id={item.id}
                            markAsRead={() => markAsRead(item.id)}
                            time={item.createdAt}
                            isRead={item.isRead}
                            onPress={() => setSelectedNotification(item)}
                        />
                    )}
                />
            )}

            {selectedNotification && (
                <NotificationDetailSheet
                    notification={selectedNotification.notification}
                    time={selectedNotification.createdAt}
                    onClose={() => setSelectedNotification(null)}
                />
            )}
        </SafeAreaView>
    );
}
