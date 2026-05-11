import CustomButton from '@/components/CustomButton';
import i18n from '@/i18n/i18n';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/auth.service';
import {
    ResetPasswordForm,
    resetPasswordSchema,
} from '../validations/auth.schema';

export default function ResetPasswordScreen() {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema(t)),
        mode: 'all',
        defaultValues: {
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const passwordValue = useWatch({ control, name: 'newPassword' }) || '';
    const { email, reset_token } = useLocalSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
    const [isConfirmNewPasswordFocused, setIsConfirmNewPasswordFocused] =
        useState(false);

    const passwordChecks = useMemo(
        () => [
            {
                key: 'len',
                label: t('auth.validation.resetPassword.newPassword.min'),
                valid: passwordValue.length >= 8,
            },
            {
                key: 'upper',
                label: t('auth.validation.resetPassword.newPassword.uppercase'),
                valid: /[A-Z]/.test(passwordValue),
            },
            {
                key: 'num',
                label: t('auth.validation.resetPassword.newPassword.number'),
                valid: /\d/.test(passwordValue),
            },
            {
                key: 'special',
                label: t('auth.validation.resetPassword.newPassword.special'),
                valid: /[@_\-&]/.test(passwordValue),
            },
        ],
        [passwordValue],
    );

    const onSubmit = async (data: ResetPasswordForm) => {
        try {
            setIsLoading(true);
            const response = await authService.resetPassword(
                reset_token as string,
                data.newPassword,
            );
            Toast.show({
                type: 'success',
                text1: response.message,
            });
            router.replace('/(auth)/login' as Href);
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

    useEffect(() => {
        if (!reset_token) {
            router.replace('/not-found' as Href);
        }
    }, [reset_token]);

    if (!reset_token) {
        return null;
    }

    return (
        <AuthLayout>
            <AuthForm
                title={t('auth.resetPassword.title')}
                subtitle={t('auth.resetPassword.subtitle')}
                titleClassName="w-full leading-tight"
                imageSource={require('../../../../assets/images/reset-password.png')}
            >
                <View className="gap-6">
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('auth.resetPassword.newPassword')}
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
                                                'auth.resetPassword.newPasswordPlaceholder',
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
                                            onFocus={() =>
                                                setIsNewPasswordFocused(true)
                                            }
                                            className={`text-black flex-1  `}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            textContentType="password"
                                            accessibilityLabel={t(
                                                'auth.resetPassword.newPassword',
                                            )}
                                            accessibilityRole="text"
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                            activeOpacity={0.8}
                                            accessibilityLabel={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            accessibilityRole="button"
                                        >
                                            <Ionicons
                                                name={
                                                    showPassword
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
                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('auth.resetPassword.confirmNewPassword')}
                        </Text>
                        <Controller
                            control={control}
                            name="confirmNewPassword"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.confirmNewPassword ? 'border-red-500' : isConfirmNewPasswordFocused ? 'border-mainBlue' : 'border-gray-200'}`}
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
                                                errors.confirmNewPassword
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
                                                setIsConfirmNewPasswordFocused(
                                                    false,
                                                );
                                            }}
                                            onFocus={() => {
                                                setIsConfirmNewPasswordFocused(
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
                                                'auth.resetPassword.confirmNewPassword',
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
                        {errors.confirmNewPassword && (
                            <Text className="text-red-500 text-sm">
                                {errors.confirmNewPassword.message}
                            </Text>
                        )}
                    </View>

                    {/* password-strength-indicator */}

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
                            {passwordChecks.map((item) => (
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

                    <View className="gap-4">
                        <CustomButton
                            title={t('auth.resetPassword.resetPassword')}
                            onPress={handleSubmit(onSubmit)}
                            fullWidth
                            disabled={isLoading}
                        />
                        <View className="flex-row items-center justify-center gap-2">
                            <TouchableOpacity
                                onPress={() =>
                                    router.push('/(auth)/login' as Href)
                                }
                            >
                                <Text className="text-mainBlue text-md">
                                    {t('auth.forgetPassword.backToLogin')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </AuthForm>
        </AuthLayout>
    );
}
