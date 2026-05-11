import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { notificationsService } from '../services/notifications.services';
import NotificationCard from './cards/NotificationCard';
import NotificationCardSkeleton from './cards/NotificationCardSkeleton';
import Section from './Section';

export default function Notifications() {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery({
        queryKey: ['latest-notifications'],
        queryFn: () => notificationsService.getLatestNotifications(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });

    const notifications = data?.data ?? [];

    return (
        <Section
            title={t('home.notifications.title')}
            viewAll={true}
            viewAllText={t('home.notifications.viewAll')}
            onViewAllPress={() => router.push('/notifications')}
            viewAllDisabled={notifications.length === 0}
        >
            {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                    <NotificationCardSkeleton key={index} />
                ))
            ) : notifications.length > 0 ? (
                notifications.map((notification: any, index: number) => (
                    <NotificationCard
                        key={index}
                        notification={notification.notification}
                        time={notification.createdAt}
                    />
                ))
            ) : (
                <Text className="text-center text-gray-500 text-sm">
                    {t('home.notifications.noNotifications')}
                </Text>
            )}
        </Section>
    );
}
