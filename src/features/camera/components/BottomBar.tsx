import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { translatedWords } from '../../../constants/translatedWords';
import { addFavouriteWord } from '../services/scan.services';

interface BottomBarProps {
    detectedWord: string;
}

export default function BottomBar({ detectedWord }: Readonly<BottomBarProps>) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { t } = useTranslation();

    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [isAddingFavoriteWord, setIsAddingFavoriteWord] = useState(false);

    useEffect(() => {
        Speech.speak(' ', {
            language: 'ar',
            volume: 0,
        });

        Speech.stop();
    }, []);

    const speak = (word: string) => {
        setIsPlayingSound(true);

        Speech.speak(word, {
            language: 'ar',
            onDone: () => setIsPlayingSound(false),
            onStopped: () => setIsPlayingSound(false),
            onError: () => setIsPlayingSound(false),
        });
    };

    const translatedWord = translatedWords[detectedWord] || 'No Detected Words';

    const isWordNotDetected = !detectedWord || detectedWord === 'لم يتم تحديد';

    const handleAddFavoriteWord = async () => {
        try {
            setIsAddingFavoriteWord(true);
            if (isWordNotDetected) return;

            const data = await addFavouriteWord(detectedWord);
            if (data) {
                Toast.show({
                    type: 'success',
                    text1: t('camera.success'),
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t('camera.error'),
            });
            console.log(error);
        } finally {
            setIsAddingFavoriteWord(false);
        }
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={['40%', '70%']}
            backgroundComponent={({ style }) => (
                <BlurView
                    intensity={60}
                    tint="dark"
                    style={[
                        style,
                        {
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            overflow: 'hidden',
                        },
                    ]}
                />
            )}
            handleIndicatorStyle={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
            <BottomSheetView>
                <View className="p-6 gap-3">
                    <View className="flex-row items-center gap-5">
                        <View className="w-16 h-16 p-2 items-center justify-center bg-[#f2f0fc] rounded-full">
                            <MaterialCommunityIcons
                                name="hand-clap"
                                size={26}
                                color="#5140E8"
                            />
                        </View>
                        <View className="gap-2 flex-1">
                            <Text className="text-md text-gray-500">
                                {t('camera.sign')}
                            </Text>
                            <Text
                                className="text-3xl font-bold rtl:ml-2 text-primary"
                                style={{
                                    writingDirection: 'rtl',
                                    textAlign: 'right',
                                }}
                            >
                                {`${detectedWord ? `"${detectedWord}"` : 'لم يتم تحديد'}`}
                            </Text>
                        </View>
                    </View>

                    <View className="w-full h-[1px] bg-gray-200" />

                    <View className="flex-row items-center gap-5">
                        <View className="w-16 h-16 p-2 items-center justify-center bg-[#f2f0fc] rounded-full">
                            <MaterialCommunityIcons
                                name="translate-variant"
                                size={26}
                                color="#15AA96"
                            />
                        </View>
                        <View className="gap-2 flex-1">
                            <Text className="text-md text-gray-500">
                                {t('camera.translation')}
                            </Text>
                            <Text
                                className="text-3xl font-bold text-white"
                                style={{
                                    writingDirection: 'ltr',
                                    textAlign: 'left',
                                }}
                            >
                                "{translatedWord}"
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row w-full items-center justify-between gap-3">
                        <TouchableOpacity
                            onPress={() => {
                                speak(detectedWord);
                            }}
                            disabled={isPlayingSound || isWordNotDetected}
                            activeOpacity={0.8}
                            className={`bg-secondary p-3 rounded-xl flex-row gap-2 items-center w-1/2 disabled:opacity-50`}
                        >
                            <Ionicons name="play" color={'white'} size={22} />
                            <Text className="text-lg text-white">
                                {t('camera.sound')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="flex-row items-center gap-2 p-3 rounded-xl bg-Tertiary w-1/2 disabled:opacity-50"
                            onPress={handleAddFavoriteWord}
                            disabled={isAddingFavoriteWord || isWordNotDetected}
                        >
                            <Ionicons name="heart" color={'white'} size={22} />
                            <Text className="text-lg text-white">
                                {t('camera.favourite')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
}
