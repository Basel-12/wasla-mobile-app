import CustomHeader from '@/components/CustomHeader';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Brightness from 'expo-brightness';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
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
import i18n from '../../../i18n/i18n';
import BottomBar from '../components/BottomBar';
import FaceEmotionBox from '../components/FaceEmotionBox';

function LandmarkOverlay({ landmarks }: { landmarks: LandmarkResult | null }) {
    if (!landmarks) return null;
    return (
        <View
            style={{ position: 'absolute', top: 100, left: 16 }}
            pointerEvents="none"
        >
            <View className="bg-black/70 px-3 py-1 rounded-full mb-2">
                <Text className="text-green-400 text-sm font-bold">
                    Hands: {landmarks.hands.length}
                </Text>
            </View>
            {landmarks.hands.map((hand, i) => (
                <View
                    key={i}
                    className="bg-black/70 px-3 py-1 rounded-full mb-1"
                >
                    <Text className="text-yellow-300 text-xs">
                        {landmarks.handedness?.[i] ?? `Hand ${i}`} wrist: x=
                        {hand[0]?.x.toFixed(2)} y={hand[0]?.y.toFixed(2)}
                    </Text>
                </View>
            ))}
            {landmarks.face.length > 0 && (
                <View className="bg-black/70 px-3 py-1 rounded-full">
                    <Text className="text-blue-400 text-sm font-bold">
                        Face: {landmarks.face.length} pts
                    </Text>
                </View>
            )}
        </View>
    );
}
const emotionDisplayAr: Record<string, string> = {
    angry: 'غاضب',
    disgust: 'اشمئزاز',
    fear: 'خايف',
    happy: 'سعيد',
    neutral: 'عادي',
    sad: 'حزين',
    surprise: 'متفاجئ',
};

export default function ScanScreen() {
    const { t } = useTranslation();
    const [isReady, setIsReady] = useState(false);
    const [landmarks, setLandmarks] = useState<LandmarkResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const [signResult, setSignResult] = useState('');
    const isArabic = i18n.language === 'ar';

    const [emotion, setEmotion] = useState<{
        emotion: string;
        confidence: number;
    }>({
        emotion: isArabic ? emotionDisplayAr['neutral'] : 'neutral',
        confidence: 0,
    });

    const flashOpacity = useRef(new Animated.Value(0)).current;
    const [flashOn, setFlashOn] = useState(false);
    const originalBrightness = useRef<number | null>(null);

    const triggerScreenFlash = async () => {
        if (flashOn) {
            // toggle OFF — restore brightness and hide overlay
            setFlashOn(false);
            if (originalBrightness.current !== null) {
                await Brightness.setBrightnessAsync(originalBrightness.current);
            } else await Brightness.setBrightnessAsync(0.5);
            Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start();
        } else {
            // toggle ON — max brightness + white overlay
            originalBrightness.current = await Brightness.getBrightnessAsync();
            setFlashOn(true);
            await Brightness.setBrightnessAsync(1);
            Animated.timing(flashOpacity, {
                toValue: 0.92, // near-white, not fully opaque so you still see the subject
                duration: 80,
                useNativeDriver: true,
            }).start();
        }
    };

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
                            setSignResult(`${label}`);
                        }
                    }}
                    onEmotionDetected={(e) => {
                        const { emotion, confidence } = e.nativeEvent;
                        console.log(confidence);

                        setEmotion({
                            emotion: isArabic
                                ? emotionDisplayAr[emotion]
                                : emotion,
                            confidence,
                        });
                    }}
                />

                {/* ── Debug landmark overlay ── */}
                {/* <LandmarkOverlay landmarks={landmarks} /> */}

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

                        {/* flash light  */}
                        <Pressable
                            onPress={triggerScreenFlash}
                            android_ripple={{
                                color: 'rgba(255,255,255,0.2)',
                                borderless: true,
                                radius: 24,
                            }}
                        >
                            <BlurView
                                intensity={60}
                                tint={flashOn ? 'light' : 'dark'} // visual feedback
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
                                    name={flashOn ? 'flash' : 'flash-outline'}
                                    size={20}
                                    color={flashOn ? '#FACC15' : 'white'} // yellow when on
                                />
                            </BlurView>
                        </Pressable>
                    </View>

                    {/* face square emotion  */}
                    <FaceEmotionBox
                        face={landmarks?.face || []}
                        emotion={emotion.emotion}
                    />
                    <BlurView
                        intensity={60}
                        tint="dark"
                        className="absolute right-5 top-32 rounded-3xl overflow-hidden"
                    >
                        <View className="flex-row items-center px-3 py-1 gap-3">
                            <Ionicons
                                name="happy-outline"
                                size={24}
                                color="#22D3EE"
                            />

                            <View>
                                <Text className="text-cyan-400 font-bold text-lg">
                                    {emotion.emotion}
                                </Text>

                                <Text className="text-white font-semibold">
                                    {Math.round(emotion.confidence * 100)}%
                                </Text>
                            </View>
                        </View>
                    </BlurView>

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
