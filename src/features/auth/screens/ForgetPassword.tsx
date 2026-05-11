import CustomButton from '@/components/CustomButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthForm } from '../components/AuthForm';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/auth.service';
import { EmailForm, emailSchema } from '../validations/auth.schema';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgetPassowrd() {
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<EmailForm>({
        resolver: zodResolver(emailSchema(t)),
        mode: 'all',
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: EmailForm) => {
        try {
            setDisabled(true);
            Keyboard.dismiss();
            const response = await authService.forgetPassword(data.email);
            Toast.show({
                type: 'success',
                text1: response.message,
            });
            router.push({
                pathname: '/(auth)/verify',
                params: {
                    email: data.email,
                    type: 'reset-password',
                    reason: 'reset_password',
                },
            });
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                if (error.response?.status === 404) {
                    Toast.show({
                        type: 'error',
                        text1: error.response?.data.message,
                    });
                }
                if (error.response?.status === 400) {
                    Toast.show({
                        type: 'error',
                        text1: error.response?.data.message,
                    });
                }
            }
        } finally {
            setDisabled(false);
        }
    };

    return (
        <AuthLayout>
            <AuthForm
                title={t('auth.forgetPassword.title')}
                subtitle={t('auth.forgetPassword.subtitle')}
                titleClassName="w-full leading-tight"
                imageSource={require('../../../../assets/images/forgot-password.png')}
            >
                <View className="gap-6">
                    <View className="relative">
                        <Text className="text-black mb-2 text-md">
                            {t('auth.forgetPassword.email')}
                        </Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.email ? 'border-red-500' : isEmailFocused ? 'border-mainBlue' : 'border-gray-200'}`}
                                >
                                    {/* icon  */}
                                    <View
                                        pointerEvents="none"
                                        className="w-10 h-10 items-center justify-center rounded-xl bg-bgGrey"
                                    >
                                        <Ionicons
                                            name="mail-outline"
                                            size={22}
                                            color={
                                                errors.email ? 'red' : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <TextInput
                                        placeholder={t(
                                            'auth.forgetPassword.emailPlaceholder',
                                        )}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={() => {
                                            onBlur();
                                            setIsEmailFocused(false);
                                        }}
                                        placeholderTextColor={'#63677E'}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        textContentType="emailAddress"
                                        accessibilityLabel={t(
                                            'auth.forgetPassword.email',
                                        )}
                                        accessibilityRole="text"
                                        accessibilityState={{ disabled: false }}
                                        accessibilityValue={{ text: '' }}
                                        className={`text-black flex-1  `}
                                        multiline={false}
                                        onFocus={() => setIsEmailFocused(true)}
                                    />
                                </View>
                            )}
                        />
                        {errors.email && (
                            <Text className="text-red-500 text-sm">
                                {errors.email.message}
                            </Text>
                        )}
                    </View>
                    <CustomButton
                        title={t('auth.forgetPassword.sendCode')}
                        onPress={handleSubmit(onSubmit)}
                        fullWidth
                        disabled={disabled}
                    />
                    <View className="flex-row items-center justify-center gap-2">
                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/login' as Href)}
                        >
                            <Text className="text-mainBlue text-md">
                                {t('auth.forgetPassword.backToLogin')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AuthForm>
        </AuthLayout>
    );
}
