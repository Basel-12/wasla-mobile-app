import CustomButton from '@/components/CustomButton';
import CustomHeader from '@/components/CustomHeader';
import { useProfileQuery } from '@/hooks/useCurrentUser';
import i18n from '@/i18n/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    Keyboard,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COUNTRIES } from '../../../constants/countries';
import { profileService } from '../services/profile.services';
import {
    EditProfileForm,
    editProfileSchema,
} from '../validations/edit-profile';

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'EG') || COUNTRIES[0];

export default function EditProfileScreen() {
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { data } = useProfileQuery();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<EditProfileForm>({
        resolver: zodResolver(editProfileSchema(t)),
        mode: 'all',
        defaultValues: {
            name: data?.name || '',
            phone: data?.phone || '',
        },
    });

    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return COUNTRIES;
        const query = searchQuery.toLowerCase();
        return COUNTRIES.filter(
            (country) =>
                country.name.toLowerCase().includes(query) ||
                country.dialCode.includes(query) ||
                country.code.toLowerCase().includes(query),
        );
    }, [searchQuery]);

    const updateProfile = useMutation({
        mutationFn: (data: EditProfileForm) =>
            profileService.updateProfile({
                name: data.name,
                phone: data.phone,
            }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            router.back();
        },
        onError: (error) => {
            console.log(error);
            setIsLoading(false);
            Toast.show({
                type: 'error',
                text1:
                    (error as AxiosError<{ message: string }>).response?.data
                        .message || 'An unknown error occurred',
            });
        },
    });

    const onSubmit = (data: EditProfileForm) => {
        Keyboard.dismiss();
        console.log(data);
        setIsLoading(true);
        updateProfile.mutate(data);
    };

    const handleCloseModal = () => {
        setShowCountryPicker(false);
        setSearchQuery('');
    };

    return (
        <SafeAreaView className="flex-1">
            <CustomHeader
                title={t('profileEditors.editProfile.title')}
                showBackButton={true}
                onBackPress={() => router.back()}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 64 }}
            >
                <View className="p-5 gap-6">
                    {/* name */}
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('profileEditors.editProfile.name')}
                        </Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.name ? 'border-red-500' : isNameFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* icon  */}
                                    <View
                                        pointerEvents="none"
                                        className="w-10 h-10 items-center justify-center rounded-xl bg-bgGrey"
                                    >
                                        <Ionicons
                                            name="person-outline"
                                            size={22}
                                            color={
                                                errors.name ? 'red' : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'profileEditors.editProfile.namePlaceholder',
                                            )}
                                            placeholderTextColor="#63677E"
                                            textAlign={
                                                i18n.language === 'ar'
                                                    ? 'right'
                                                    : 'left'
                                            }
                                            style={{
                                                writingDirection:
                                                    i18n.language === 'ar'
                                                        ? 'rtl'
                                                        : 'ltr',
                                            }}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsNameFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsNameFocused(true);
                                            }}
                                            className={`text-black flex-1  `}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            accessibilityLabel={t(
                                                'auth.resetPassword.confirmNewPassword',
                                            )}
                                            accessibilityRole="text"
                                        />
                                    </View>
                                </View>
                            )}
                        />
                        {errors.name && (
                            <Text className="text-red-500 text-sm">
                                {errors.name.message}
                            </Text>
                        )}
                    </View>

                    {/* phone */}
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('profileEditors.editProfile.phone')}
                        </Text>
                        <Controller
                            control={control}
                            name="phone"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl border ${errors.phone ? 'border-red-500' : isPhoneFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* Country Code Selector */}
                                    <TouchableOpacity
                                        onPress={() =>
                                            setShowCountryPicker(true)
                                        }
                                        className="flex-row items-center gap-1 px-2 py-2 rounded-xl bg-bgGrey"
                                    >
                                        <Text className="text-lg">
                                            {selectedCountry.flag}
                                        </Text>
                                        <Text className="text-black text-sm font-medium">
                                            {selectedCountry.dialCode}
                                        </Text>
                                        <Ionicons
                                            name="chevron-down"
                                            size={16}
                                            color="#63677E"
                                        />
                                    </TouchableOpacity>

                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'profileEditors.editProfile.phonePlaceholder',
                                            )}
                                            placeholderTextColor="#63677E"
                                            textAlign={
                                                i18n.language === 'ar'
                                                    ? 'right'
                                                    : 'left'
                                            }
                                            style={{
                                                writingDirection:
                                                    i18n.language === 'ar'
                                                        ? 'rtl'
                                                        : 'ltr',
                                            }}
                                            value={value}
                                            onChangeText={(text) => {
                                                const numericText =
                                                    text.replace(/[^0-9]/g, '');
                                                onChange(numericText);
                                            }}
                                            onBlur={() => {
                                                onBlur();
                                                setIsPhoneFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsPhoneFocused(true);
                                            }}
                                            className="text-black flex-1"
                                            keyboardType="phone-pad"
                                            autoCapitalize="none"
                                            maxLength={15}
                                            accessibilityLabel={t(
                                                'profileEditors.editProfile.phone',
                                            )}
                                            accessibilityRole="text"
                                        />
                                    </View>
                                </View>
                            )}
                        />
                        {errors.phone && (
                            <Text className="text-red-500 text-sm mt-1">
                                {errors.phone.message}
                            </Text>
                        )}
                    </View>

                    <CustomButton
                        title={t('profileEditors.editProfile.save')}
                        onPress={handleSubmit(onSubmit)}
                        fullWidth
                        disabled={isLoading}
                    />
                </View>
            </ScrollView>

            {/* Country Picker Modal */}
            <Modal
                visible={showCountryPicker}
                transparent
                animationType="slide"
                onRequestClose={handleCloseModal}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <Pressable className="flex-1" onPress={handleCloseModal} />
                    <View className="bg-white rounded-t-3xl max-h-[80%]">
                        {/* Header */}
                        <View className="p-4 border-b border-gray-200">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-black text-lg font-semibold">
                                    {t(
                                        'profileEditors.editProfile.selectCountry',
                                    )}
                                </Text>
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color="#63677E"
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Search Input */}
                            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color="#63677E"
                                />
                                <TextInput
                                    placeholder={t(
                                        'profileEditors.editProfile.searchCountry',
                                    )}
                                    placeholderTextColor="#63677E"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    className="flex-1 ml-2 text-black"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchQuery('')}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={20}
                                            color="#63677E"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Country List */}
                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item: country }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedCountry(country);
                                        handleCloseModal();
                                    }}
                                    className={`flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 ${
                                        selectedCountry.code === country.code
                                            ? 'bg-mainBlue/10'
                                            : ''
                                    }`}
                                >
                                    <Text className="text-2xl">
                                        {country.flag}
                                    </Text>
                                    <View className="flex-1">
                                        <Text className="text-black text-base">
                                            {country.name}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">
                                        {country.dialCode}
                                    </Text>
                                    {selectedCountry.code === country.code && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color="#5140E8"
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="p-8 items-center">
                                    <Text className="text-gray-500">
                                        {t(
                                            'profileEditors.editProfile.noCountriesFound',
                                        )}
                                    </Text>
                                </View>
                            }
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
