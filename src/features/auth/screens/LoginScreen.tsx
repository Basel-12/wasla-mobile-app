import CustomButton from '@/components/CustomButton';
import i18n from '@/i18n/i18n';
import { deviceRegisterService } from '@/services/device-register.service';
import { StorageService } from '@/services/storage.service';
import { StorageKeys } from '@/utils/constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { AxiosError } from 'axios';
import { Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import GoogleButton from '../components/GoogleButton';
import { authService } from '../services/auth.service';
import { LoginForm, loginSchema } from '../validations/auth.schema';

export default function LoginScreen() {
    const { t } = useTranslation();
    const [isFocusedEmail, setIsFocusedEmail] = useState(false);
    const [isFocusedPassword, setIsFocusedPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema(t)),
        mode: 'all',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        const checkToken = async () => {
            const token = await StorageService.getItemSecure(
                StorageKeys.TOKEN,
                false,
            );
            if (token) {
                await deviceRegisterService.registerDevice(false);
                router.replace('/(app)/(home)' as Href);
            } else {
                setIsCheckingToken(false);
            }
        };
        checkToken();
    }, []);

    const onSubmit = async (data: LoginForm) => {
        try {
            Keyboard.dismiss();
            setIsLoading(true);
            const response = await authService.login(data.email, data.password);
            Toast.show({
                type: 'success',
                text1: response.message,
            });
            //set the token in the storage
            await StorageService.setItemSecure(
                StorageKeys.TOKEN,
                response.data,
            );
            await deviceRegisterService.registerDevice(true);
            router.push('/(app)/(home)' as Href);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status === 403) {
                    router.replace({
                        pathname: '/(auth)/verify',
                        params: {
                            email: data.email,
                            password: data.password,
                            type: 'login',
                            reason: 'verify_email',
                        },
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1:
                            error.response?.data.message ||
                            'An unknown error occurred',
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true);
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            console.log('hasPlayServices');
            const result = await GoogleSignin.signIn();

            const idToken = result.data?.idToken;

            if (!idToken) {
                throw new Error('Google sign in failed');
            }
            const response = await authService.googleLogin(idToken);

            const accessToken = response.data.access_token;
            const refreshToken = response.data.refresh_token;

            console.log('access token', accessToken);
            console.log('refresh token', refreshToken);

            await Promise.all([
                deviceRegisterService.registerDevice(true),
                StorageService.setItemSecure(StorageKeys.TOKEN, accessToken),
                StorageService.setItemSecure(
                    StorageKeys.REFRESH_TOKEN,
                    refreshToken,
                ),
            ]);
            Toast.show({
                type: 'success',
                text1: response.message,
            });
            router.push('/(app)/(home)' as Href);
        } catch (error: any) {
            console.log('ERROR code:', error.code);
            console.log('ERROR message:', error.message);
            console.log('ERROR full:', JSON.stringify(error));

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('In progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play services not available');
            } else {
                console.log('Unknown error');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    if (isCheckingToken) return null;

    return (
        <AuthLayout>
            <AuthForm
                title={t('auth.login.title')}
                subtitle={t('auth.login.subtitle')}
                imageSource={require('../../../../assets/images/login.png')}
            >
                <View className="gap-6">
                    {/* email input */}

                    <View>
                        <Text className="text-black mb-2 text-md">
                            {t('auth.login.email')}
                        </Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.email ? 'border-red-500' : isFocusedEmail ? 'border-mainBlue' : 'border-gray-200'}`}
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
                                            'auth.login.emailPlaceholder',
                                        )}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        textContentType="emailAddress"
                                        placeholderTextColor={'#63677E'}
                                        accessibilityLabel={t(
                                            'auth.login.email',
                                        )}
                                        accessibilityRole="text"
                                        accessibilityState={{ disabled: false }}
                                        accessibilityValue={{ text: '' }}
                                        multiline={false}
                                        className={`text-black flex-1 `}
                                        onChangeText={onChange}
                                        onBlur={() => {
                                            onBlur();
                                            setIsFocusedEmail(false);
                                        }}
                                        onFocus={() => {
                                            setIsFocusedEmail(true);
                                        }}
                                        value={value}
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

                    {/* password input */}

                    <View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-[#63677E] mb-2 text-md w-1/2">
                                {t('auth.login.password')}
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(
                                        '/(auth)/forget-password' as Href,
                                    )
                                }
                            >
                                <Text className="text-mainBlue text-sm">
                                    {t('auth.login.forgotPassword')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Controller
                            control={control}
                            name="password"
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View
                                    className={`relative flex-row items-center gap-2 p-2
                                        bg-white/50 rounded-2xl  border ${errors.password ? 'border-red-500' : isFocusedPassword ? 'border-mainBlue' : 'border-gray-200'}`}
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
                                                errors.password
                                                    ? 'red'
                                                    : '#5140E8'
                                            }
                                        />
                                    </View>
                                    <View className="relative flex-1">
                                        <TextInput
                                            placeholder={t(
                                                'auth.login.passwordPlaceholder',
                                            )}
                                            placeholderTextColor={'#63677E'}
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
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            secureTextEntry={!showPassword}
                                            autoComplete="password"
                                            textContentType="password"
                                            accessibilityLabel={t(
                                                'auth.login.password',
                                            )}
                                            accessibilityRole="text"
                                            accessibilityState={{
                                                disabled: false,
                                            }}
                                            accessibilityValue={{ text: '' }}
                                            className={`text-black flex-1  `}
                                            multiline={false}
                                            onChangeText={onChange}
                                            onBlur={() => {
                                                onBlur();
                                                setIsFocusedPassword(false);
                                            }}
                                            onFocus={() => {
                                                setIsFocusedPassword(true);
                                            }}
                                            value={value}
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
                        {errors.password && (
                            <Text className="text-red-500 text-sm">
                                {errors.password.message}
                            </Text>
                        )}
                    </View>

                    {/* login button */}
                    <CustomButton
                        title={t('auth.login.signIn')}
                        fullWidth
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                    />
                    <View className="flex-row items-center justify-center gap-2">
                        <View className="flex-1 h-[1px] bg-[#E0E0E0]" />
                        <Text className="text-[#63677E] text-md shrink-0">
                            {t('auth.login.or')}
                        </Text>
                        <View className="flex-1 h-[1px] bg-[#E0E0E0]" />
                    </View>
                    <GoogleButton
                        loading={isGoogleLoading}
                        onPress={handleGoogleLogin}
                        title={t('auth.login.signInWithGoogle')}
                    />
                    <View className="flex-row items-center justify-center gap-2">
                        <Text className="text-[#63677E] text-md">
                            {t('auth.login.noAccount')}
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                router.push('/(auth)/signup' as Href)
                            }
                        >
                            <Text
                                className="text-mainBlue text-md
								"
                            >
                                {t('auth.login.signUp')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AuthForm>
        </AuthLayout>
    );
}
