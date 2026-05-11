import CustomButton from '@/components/CustomButton';
import CustomHeader from '@/components/CustomHeader';
import i18n from '@/i18n/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { profileService } from '../services/profile.services';
import {
    ChangePasswordForm,
    changePasswordSchema,
} from '../validations/change-password';

export default function ChangePasswordScreen() {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema(t)),
        mode: 'all',
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });
    const [isOldPasswordFocused, setIsOldPasswordFocused] = useState(false);
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
        useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const newPasswordValue = useWatch({ control, name: 'newPassword' }) || '';
    const newPasswordChecks = useMemo(
        () => [
            {
                key: 'len',
                label: t('auth.validation.resetPassword.newPassword.min'),
                valid: newPasswordValue.length >= 8,
            },
            {
                key: 'upper',
                label: t('auth.validation.resetPassword.newPassword.uppercase'),
                valid: /[A-Z]/.test(newPasswordValue),
            },
            {
                key: 'num',
                label: t('auth.validation.resetPassword.newPassword.number'),
                valid: /\d/.test(newPasswordValue),
            },
            {
                key: 'special',
                label: t('auth.validation.resetPassword.newPassword.special'),
                valid: /[@_\-&]/.test(newPasswordValue),
            },
        ],
        [newPasswordValue],
    );
    const insets = useSafeAreaInsets();

    const onSubmit = async (data: ChangePasswordForm) => {
        try {
            Keyboard.dismiss();
            setIsLoading(true);
            const response = await profileService.changePassword(
                data.oldPassword,
                data.newPassword,
            );
            Toast.show({
                type: 'success',
                text1: response.message,
            });
            router.back();
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                Toast.show({
                    type: 'error',
                    text1:
                        error.response?.data.message ||
                        'An unknown error occurred',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <CustomHeader
                title={t('profileEditors.changePassword.title')}
                showBackButton={true}
                onBackPress={() => router.back()}
            />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 64,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="p-5 gap-6">
                    {/* old password */}
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('profileEditors.changePassword.oldPassword')}
                        </Text>
                        <Controller
                            control={control}
                            name="oldPassword"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.oldPassword ? 'border-red-500' : isOldPasswordFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* icon  */}
                                    <View
                                        pointerEvents="none"
                                        className="w-10 h-10 items-center justify-center rounded-xl bg-bgGrey"
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={22}
                                            color={
                                                errors.oldPassword
                                                    ? 'red'
                                                    : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'profileEditors.changePassword.oldPasswordPlaceholder',
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
                                            onChangeText={(text) =>
                                                onChange(
                                                    text.replace(/\s/g, ''),
                                                )
                                            }
                                            onBlur={() => {
                                                onBlur();
                                                setIsOldPasswordFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsOldPasswordFocused(true);
                                            }}
                                            className={`text-black flex-1  `}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            secureTextEntry={!showOldPassword}
                                            accessibilityLabel={t(
                                                'profileEditors.changePassword.oldPassword',
                                            )}
                                            accessibilityRole="text"
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowOldPassword(
                                                    !showOldPassword,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                            activeOpacity={0.8}
                                            accessibilityLabel={
                                                showOldPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            accessibilityRole="button"
                                        >
                                            <Ionicons
                                                name={
                                                    showOldPassword
                                                        ? 'eye-off-outline'
                                                        : 'eye-outline'
                                                }
                                                size={22}
                                                color="#63677E"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        {errors.oldPassword && (
                            <Text className="text-red-500 text-sm">
                                {errors.oldPassword.message}
                            </Text>
                        )}
                    </View>

                    {/* new password */}
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('profileEditors.changePassword.newPassword')}
                        </Text>
                        <Controller
                            control={control}
                            name="newPassword"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.newPassword ? 'border-red-500' : isNewPasswordFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* icon  */}
                                    <View
                                        pointerEvents="none"
                                        className="w-10 h-10 items-center justify-center rounded-xl bg-bgGrey"
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={22}
                                            color={
                                                errors.newPassword
                                                    ? 'red'
                                                    : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'profileEditors.changePassword.newPasswordPlaceholder',
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
                                            onChangeText={(text) =>
                                                onChange(
                                                    text.replace(/\s/g, ''),
                                                )
                                            }
                                            onBlur={() => {
                                                onBlur();
                                                setIsNewPasswordFocused(false);
                                            }}
                                            onFocus={() => {
                                                setIsNewPasswordFocused(true);
                                            }}
                                            className={`text-black flex-1  `}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            secureTextEntry={!showNewPassword}
                                            accessibilityLabel={t(
                                                'profileEditors.changePassword.newPassword',
                                            )}
                                            accessibilityRole="text"
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowNewPassword(
                                                    !showNewPassword,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                            activeOpacity={0.8}
                                            accessibilityLabel={
                                                showNewPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            accessibilityRole="button"
                                        >
                                            <Ionicons
                                                name={
                                                    showNewPassword
                                                        ? 'eye-off-outline'
                                                        : 'eye-outline'
                                                }
                                                size={22}
                                                color="#63677E"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        {errors.newPassword && (
                            <Text className="text-red-500 text-sm">
                                {errors.newPassword.message}
                            </Text>
                        )}
                    </View>

                    {/* confirm password */}
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('profileEditors.changePassword.confirmPassword')}
                        </Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.confirmPassword ? 'border-red-500' : isConfirmPasswordFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* icon  */}
                                    <View
                                        pointerEvents="none"
                                        className="w-10 h-10 items-center justify-center rounded-xl bg-bgGrey"
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={22}
                                            color={
                                                errors.confirmPassword
                                                    ? 'red'
                                                    : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'auth.resetPassword.confirmNewPasswordPlaceholder',
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
                                            onChangeText={(text) =>
                                                onChange(
                                                    text.replace(/\s/g, ''),
                                                )
                                            }
                                            onBlur={() => {
                                                onBlur();
                                                setIsConfirmPasswordFocused(
                                                    false,
                                                );
                                            }}
                                            onFocus={() => {
                                                setIsConfirmPasswordFocused(
                                                    true,
                                                );
                                            }}
                                            className={`text-black flex-1  `}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            secureTextEntry={
                                                !showConfirmPassword
                                            }
                                            accessibilityLabel={t(
                                                'profileEditors.changePassword.confirmPassword',
                                            )}
                                            accessibilityRole="text"
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                            activeOpacity={0.8}
                                            accessibilityLabel={
                                                showConfirmPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            accessibilityRole="button"
                                        >
                                            <Ionicons
                                                name={
                                                    showConfirmPassword
                                                        ? 'eye-off-outline'
                                                        : 'eye-outline'
                                                }
                                                size={22}
                                                color="#63677E"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                        {errors.confirmPassword && (
                            <Text className="text-red-500 text-sm">
                                {errors.confirmPassword.message}
                            </Text>
                        )}
                    </View>

                    {/* new password checks */}
                    <View className="rounded-2xl border border-[#E8EAF8] bg-white py-4 px-6">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color="#5140E8"
                            />
                            <Text className="text-[#2A2F45] font-semibold">
                                {t('auth.resetPassword.mustContain')}
                            </Text>
                        </View>

                        <View className="gap-2">
                            {newPasswordChecks.map((item) => (
                                <View
                                    key={item.key}
                                    className="flex-row items-center gap-2"
                                >
                                    <Ionicons
                                        name={
                                            item.valid
                                                ? 'checkmark-circle'
                                                : 'ellipse-outline'
                                        }
                                        size={18}
                                        color={
                                            item.valid ? '#20C997' : '#BFC5D6'
                                        }
                                    />
                                    <Text
                                        className={
                                            item.valid
                                                ? 'text-[#2A2F45]'
                                                : 'text-[#7B8198]'
                                        }
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* submit button */}

                    <CustomButton
                        title={t(
                            'profileEditors.changePassword.changePassword',
                        )}
                        onPress={handleSubmit(onSubmit)}
                        fullWidth
                        disabled={isLoading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
