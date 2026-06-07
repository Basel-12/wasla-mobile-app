import Skeleton from '@/components/Skeleton';
import { useProfileQuery } from '@/hooks/useCurrentUser';
import { TokenService } from '@/services/token.service';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    ImageBackground,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AvatarPicker from '../components/AvatarPicker';
import ProfileCard from '../components/card';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import ProfileCardSkeleton from '../components/ProfileCardSkeleton';
import ProfileHeader from '../components/ProfileHeader';
import { useImagePicker } from '../hooks/useImagePicker';
import { profileService } from '../services/profile.services';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const { data, isLoading } = useProfileQuery();
    const [avatar, setAvatar] = useState<string | null>(data?.avatar);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const { openGallery, openCamera } = useImagePicker((uri) => {
        setAvatar(uri);
        setSheetVisible(false);
        updateAvatar.mutate(uri);
    });
    const insets = useSafeAreaInsets();

    const onLogout = async () => {
        setLogoutVisible(true);
    };

    const confirmLogout = async () => {
        try {
            setLogoutLoading(true);
            queryClient.clear();
            await TokenService.Logout();
            setLogoutVisible(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLogoutLoading(false);
        }
    };

    const updateAvatar = useMutation({
        mutationFn: (uri: string) => profileService.updateAvatar(uri),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            Toast.show({
                type: 'success',
                text1: response.message,
            });
        },
        onError: (error) => {
            setAvatar(data?.avatar || null);
            Toast.show({
                type: 'error',
                text1:
                    (error as AxiosError<{ message: string }>).response?.data
                        .message || 'An unknown error occurred',
            });
        },
    });

    const languageItems = [
        {
            key: 'ar',
            title: t('profile.languages.ar'),
        },
        {
            key: 'en',
            title: t('profile.languages.en'),
        },
    ];

    const profileItems = [
        {
            key: 'name',
            title: t('profile.name'),
            data: data?.name,
            icon: <Ionicons name="person-outline" size={24} color="#5140E8" />,
            onPress: () => router.push('/(profileEditors)/edit-profile'),
        },
        {
            key: 'email',
            title: t('profile.email'),
            data: data?.email,
            icon: <Ionicons name="mail-outline" size={24} color="#5140E8" />,
            onPress: () => {},
            disabled: true,
        },
        {
            key: 'password',
            title: t('profile.password'),
            data: t('profile.passwordPlaceholder'),
            icon: (
                <Ionicons
                    name="lock-closed-outline"
                    size={24}
                    color="#5140E8"
                />
            ),
            onPress: () => router.push('/(profileEditors)/new-password'),
        },
        {
            key: 'phone',
            title: t('profile.phone'),
            data: data?.phone || 'N/A',
            icon: <Ionicons name="call-outline" size={24} color="#5140E8" />,
            onPress: () => router.push('/(profileEditors)/edit-profile'),
        },
        {
            key: 'language',
            title: t('profile.language'),
            data: languageItems.find(
                (item) => item.key === data?.preferredLanguage,
            )?.title,
            icon: <Feather name="globe" size={24} color="#5140E8" />,
            onPress: () =>
                router.push({
                    pathname: '/(profileEditors)/language',
                    params: {
                        language: data?.preferredLanguage,
                    },
                }),
        },
        {
            key: 'logout',
            title: t('profile.logout'),
            data: t('profile.logoutDescription'),
            icon: <MaterialIcons name="logout" size={24} color="#c91d12" />,
            onPress: onLogout,
            dangerous: true,
        },
    ];

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        setRefreshing(false);
    }, [queryClient]);

    return (
        <SafeAreaView className="flex-1">
            <ProfileHeader />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 64,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#5140E8']}
                        tintColor={'#5140E8'}
                        progressBackgroundColor={'#f6f6f8'}
                    />
                }
            >
                <View className="p-5 gap-6">
                    {/* profile picture */}
                    <View className="w-full items-center justify-center">
                        <ImageBackground
                            source={require('../../../../assets/images/avatar-background.png')}
                            resizeMode="cover"
                            className="w-full rounded-3xl overflow-hidden items-center justify-center py-2"
                            imageStyle={{ borderRadius: 24 }}
                        >
                            <View className="relative w-36 h-36 items-center justify-center">
                                {/* soft outer ring */}
                                <View
                                    className="absolute w-36 h-36 rounded-full"
                                    style={{
                                        backgroundColor: '#F7F7FF',
                                        borderWidth: 2,
                                        borderColor: 'rgba(255,255,255,0.9)',
                                        shadowColor: '#5140E8',
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 16,
                                        elevation: 3,
                                    }}
                                />

                                {/* actual avatar */}
                                <View className="w-32 h-32 rounded-full overflow-hidden bg-white items-center justify-center">
                                    {isLoading || updateAvatar.isPending ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#5140E8"
                                        />
                                    ) : (
                                        <Image
                                            source={
                                                avatar
                                                    ? avatar
                                                    : require('../../../../assets/images/profile.jpg')
                                            }
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            contentFit="cover"
                                            cachePolicy="memory"
                                        />
                                    )}
                                </View>

                                {/* camera/edit button */}
                                <TouchableOpacity
                                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white items-center justify-center"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.12,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                    onPress={() => setSheetVisible(true)}
                                >
                                    <Ionicons
                                        name="camera-outline"
                                        size={20}
                                        color="#5140E8"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View className="items-center mt-4">
                                {isLoading ? (
                                    <>
                                        <Skeleton
                                            width={100}
                                            height={20}
                                            borderRadius={10}
                                        />
                                        <Skeleton
                                            width={100}
                                            height={20}
                                            borderRadius={10}
                                            style={{ marginTop: 10 }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-2xl font-bold text-[#111827]">
                                            {data?.name}
                                        </Text>
                                        <Text className="text-sm text-[#6B7280] mt-1">
                                            {data?.email}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </ImageBackground>
                    </View>

                    {/* profile cards */}
                    <View className="flex-1 gap-6">
                        {isLoading
                            ? profileItems.map((item) => (
                                  <ProfileCardSkeleton key={item.key} />
                              ))
                            : profileItems.map((item) => (
                                  <ProfileCard
                                      key={item.key}
                                      icon={item.icon}
                                      title={item.title}
                                      data={item.data}
                                      showEditIcon={true}
                                      dangerous={item.dangerous}
                                      onPress={item.onPress}
                                      disabled={item.disabled}
                                  />
                              ))}
                    </View>
                </View>
            </ScrollView>
            <AvatarPicker
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onCamera={openCamera}
                onGallery={openGallery}
            />
            <ConfirmLogoutModal
                visible={logoutVisible}
                onCancel={() => setLogoutVisible(false)}
                onConfirm={confirmLogout}
                loading={logoutLoading}
            />
        </SafeAreaView>
    );
}
