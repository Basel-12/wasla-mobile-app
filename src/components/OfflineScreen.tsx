import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfflineScreen() {
    const { t } = useTranslation();

    const advices = [
        {
            icon: <Feather name="wifi" size={24} color="#5140E8" />,
            title: t('app.offline.advice1'),
        },
        {
            icon: <Fontisto name="plane" size={24} color="#5140E8" />,
            title: t('app.offline.advice2'),
        },
        {
            icon: (
                <FontAwesome6
                    name="arrow-rotate-right"
                    size={24}
                    color="#5140E8"
                />
            ),
            title: t('app.offline.advice3'),
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 bg-white items-center justify-center">
                <LottieView
                    source={require('../../assets/nointernet.json')}
                    autoPlay
                    loop
                    style={{
                        width: 400,
                        height: 350,
                    }}
                />

                <View className=" items-center gap-4">
                    {/* header and text  */}
                    <View className="gap-2 px-6">
                        <Text className="text-4xl font-bold text-center">
                            {' '}
                            {t('app.offline.title')}
                        </Text>
                        <Text className="text-center text-gray-400">
                            {t('app.offline.longDescription')}
                        </Text>
                    </View>

                    <View
                        className="px-6  border-gray-300 rounded-xl py-4 gap-4"
                        style={{
                            borderWidth: 0.3,
                        }}
                    >
                        {advices.map((advice) => (
                            <View className="flex-row items-center gap-4">
                                {/* icon  */}
                                <View className="w-14 h-14 bg-[#f2f2fc] items-center justify-center rounded-full">
                                    {advice.icon}
                                </View>

                                <Text className="text-gray-500">
                                    {advice.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
