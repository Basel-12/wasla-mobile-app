import CustomHeader from '@/components/CustomHeader';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    LandmarkResult,
    MediapipeCameraView,
} from '../../../../modules/src/modules/mediapipe';
import ScanHeader from '../components/ScanHeader';

export default function ScanScreen() {
    const { t } = useTranslation();
    const [isReady, setIsReady] = useState(false);
    const [landmarks, setLandmarks] = useState<LandmarkResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkPermissions = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setIsReady(true);
                }
            }
        };
        checkPermissions();
    }, [Platform.OS]);

    if (error) {
        console.log(error);
    }

    if (!isReady) {
        return (
            <SafeAreaView className="flex-1">
                <CustomHeader title={t('camera.scan')} showBackButton={false} />
                <View className="flex-1">
                    <ActivityIndicator size="large" color="#5140E8" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" edges={[]}>
            <StatusBar
                barStyle="dark-content"
                translucent={true}
                backgroundColor="transparent"
            />
            {/* <CustomHeader title={t('camera.scan')} /> */}


            <View className="flex-1">
                <MediapipeCameraView
                    style={{ flex: 1 }}
                    facing="front"
                    onReady={() => setIsReady(true)}
                    onError={(e) => setError(e.nativeEvent.message)}
                    onLandmarks={(e) => setLandmarks(e.nativeEvent)}
                />

                {/* Overlay UI */}
                <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {!isReady && !error && (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-white text-lg">
                                Loading camera...
                            </Text>
                        </View>
                    )}

                    {isReady && landmarks && (
                        <View className="absolute top-4 left-0 right-0 items-center">
                            {landmarks.hands.length > 0 && (
                                <View className="bg-black/60 px-4 py-2 rounded-full mb-2">
                                    <Text className="text-green-400 text-base font-semibold">
                                        {landmarks.hands.length} hand(s)
                                        detected
                                    </Text>
                                    {landmarks.handedness.length > 0 && (
                                        <Text className="text-white text-sm text-center">
                                            {landmarks.handedness.join(', ')}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {landmarks.face.length > 0 && (
                                <View className="bg-black/60 px-4 py-2 rounded-full">
                                    <Text className="text-blue-400 text-base font-semibold">
                                        Face detected
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
