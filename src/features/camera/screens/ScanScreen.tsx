import CustomHeader from '@/components/CustomHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    Pressable,
    StatusBar,
    Text,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
    LandmarkResult,
    MediapipeCameraView,
} from '../../../../modules/src/modules/mediapipe';
import BottomBar from '../components/BottomBar';

export default function ScanScreen() {
    const { t } = useTranslation();
    const [isReady, setIsReady] = useState(false);
    const [landmarks, setLandmarks] = useState<LandmarkResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const [signResult, setSignResult] = useState('');

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
                    onSignDetected={(e) => {
                        const { label, confidence, committed } = e.nativeEvent;

                        if (committed) {
                            console.log(
                                'confidence for ',
                                label,
                                'is ',
                                confidence,
                            );
                            setSignResult(label);
                        }
                    }}
                />

                {/* Overlay UI */}
                <View className="absolute inset-0 " pointerEvents="box-none">
                    <View
                        style={{ paddingTop: insets.top + 8 }}
                        className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pointer-events-auto"
                    >
                        <Pressable
                            onPress={() =>
                                router.canGoBack()
                                    ? router.back()
                                    : router.push('/(app)/(home)')
                            }
                            android_ripple={{
                                color: 'rgba(255,255,255,0.2)',
                                borderless: true,
                                radius: 24,
                            }}
                        >
                            <BlurView
                                intensity={60}
                                tint="dark"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 22,
                                    overflow: 'hidden',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color="white"
                                />
                            </BlurView>
                        </Pressable>

                        {/* Title */}
                        <BlurView
                            intensity={60}
                            tint="dark"
                            style={{
                                borderRadius: 20,
                                overflow: 'hidden',
                                paddingHorizontal: 20,
                                paddingVertical: 10,
                                flexDirection: 'row',
                                gap: 4,
                                alignItems: 'center',
                            }}
                        >
                            <Ionicons name="scan" color={'white'} size={18} />
                            <Text className="text-white font-semibold text-base">
                                {t('camera.scan')}
                            </Text>
                        </BlurView>

                        {/* Reload button */}
                        <Pressable
                            onPress={() => {}}
                            android_ripple={{
                                color: 'rgba(255,255,255,0.2)',
                                borderless: true,
                                radius: 24,
                            }}
                        >
                            <BlurView
                                intensity={60}
                                tint="dark"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 22,
                                    overflow: 'hidden',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons
                                    name="flash-outline"
                                    size={20}
                                    color="white"
                                />
                            </BlurView>
                        </Pressable>
                    </View>
                    {/* ── Landmark badges ── */}
                    {isReady && landmarks && (
                        <View className="absolute top-24 left-0 right-0 items-center">
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
            <BottomBar detectedWord={signResult} />
        </SafeAreaView>
    );
}
