import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCardSkeleton from '../../profile/components/ProfileCardSkeleton';
import FavouriteHeader from '../components/Header';
import WordCard from '../components/WordCard';
import { getAll } from '../services/favourite-words.services';

const LIMIT = 10;

export default function FavouriteWordsScreen() {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const { data, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: ['fav-words'],
            queryFn: ({ pageParam = 1 }) => getAll(pageParam, LIMIT),
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                const { page, totalPages } = lastPage.data.meta;
                return page < totalPages ? page + 1 : undefined;
            },
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
        });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ['fav-words'] });
        setRefreshing(false);
    }, [queryClient]);

    const onEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const savedWords = data?.pages.flatMap((page) => page.data.data) ?? [];

    const isInitialLoading = isFetching && savedWords.length === 0;

    return (
        <SafeAreaView className="flex-1">
            <FavouriteHeader />

            {isInitialLoading ? (
                <FlatList
                    data={Array.from({ length: 10 })}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={{ gap: 16, padding: 16 }}
                    renderItem={() => <ProfileCardSkeleton />}
                    scrollEnabled={false}
                />
            ) : (
                <FlatList
                    data={savedWords}
                    keyExtractor={(item, index) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        gap: 16,
                        padding: 16,
                        flexGrow: 1,
                    }}
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
                            {t('favourite.empty')}
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <WordCard word={item.word} id={item.id} />
                    )}
                />
            )}
        </SafeAreaView>
    );
}
