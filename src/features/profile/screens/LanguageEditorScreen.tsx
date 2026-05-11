import CustomHeader from '@/components/CustomHeader';
import Feather from '@expo/vector-icons/Feather';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileService } from '../services/profile.services';
import {changeLanguage} from '@/i18n/i18n';
import { useProfileQuery } from '@/hooks/useCurrentUser';

export default function LanguageEditorScreen() {
    const { t } = useTranslation();
    const {data} = useProfileQuery()
    const queryClient = useQueryClient();
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        data?.preferredLanguage as string,
    );
    const languageItems = [
        {
            key: 'ar',
            title: t('profileEditors.language.languages.ar'),
            hint: t('profileEditors.language.languagesHints.ar'),
            flag: require('../../../../assets/images/flags/EG.png'),
        },
        {
            key: 'en',
            title: t('profileEditors.language.languages.en'),
            hint: t('profileEditors.language.languagesHints.en'),
            flag: require('../../../../assets/images/flags/UK.png'),
        },
    ];

    const updateLanguage = useMutation({
        mutationFn: (preferredLanguage: string) =>
            profileService.updateLanguage(preferredLanguage),
        onSuccess: async (response) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            await changeLanguage(response.preferredLanguage);
            router.replace('/(app)/(home)' as Href);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const handleChangeLanguage = (language: string) => {
        updateLanguage.mutate(language);
    };

    return (
        <SafeAreaView className="flex-1">
            <CustomHeader
                title={t('profileEditors.language.title')}
                showBackButton={true}
                onBackPress={() => router.back()}
            />
            <View className="flex-1 p-4  gap-6">
                <Text className="text-lg font-bold">
                    {t('profileEditors.language.description')}
                </Text>
                {languageItems.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        className={`py-4 px-3 rounded-2xl flex-row items-center  `}
                        style={{
                            borderWidth: 1,
                            borderColor:
                                selectedLanguage === item.key
                                    ? '#5140E8'
                                    : '#E8EAF8',
                            backgroundColor:
                                selectedLanguage === item.key
                                    ? '#f2f0fc'
                                    : '#fff',
                        }}
                        onPress={() => handleChangeLanguage(item.key)}
                    >
                        {/* flag  */}
                        <View className="w-16 h-16">
                            <Image
                                source={item.flag}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        </View>
                        {/* title and hint  */}
                        <View className="flex-1">
                            <Text className="text-lg font-bold">
                                {item.title}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {item.hint}
                            </Text>
                        </View>

                        {/* is selected icon  */}
                        {selectedLanguage === item.key && (
                            <View
                                className="w-10 h-10  items-center justify-center  bg-primary "
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#fff',
                                    borderRadius: 100,
                                    marginRight: 4,
                                }}
                            >
                                <Feather name="check" size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}
