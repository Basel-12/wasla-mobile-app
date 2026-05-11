import CustomButton from '@/components/CustomButton';
import { Href, router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <LottieView
                source={require('../../assets/notfound.json')}
                autoPlay
                loop
                style={{ width: 400, height: 300 }}
            />
            <View className="gap-4 w-full p-6">
                <Text className="text-5xl font-bold text-gray-900 text-center mt-6">
                    {t('notFound.title')}
                </Text>
                <Text className="text-gray-500 text-lg text-center">
                    {t('notFound.description')}
                </Text>
                <View className="w-full items-center">
                    <CustomButton
                        title={t('notFound.buttonText')}
                        onPress={() => router.replace('/(app)/(home)' as Href)}
                        showArrow
                        borderRadius={50}
                    />
                </View>
            </View>
        </View>
    );
}
