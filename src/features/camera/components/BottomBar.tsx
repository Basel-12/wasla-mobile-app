import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Speech from 'expo-speech';
import { translate } from 'google-translate-api-x';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface BottomBarProps {
    detectedWord: string;
}

export default function BottomBar({ detectedWord }: Readonly<BottomBarProps>) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { t } = useTranslation();
    const [translatedWord, setTranslatedWord] = useState('');
    const [isPlayingSound, setIsPlayingSound] = useState(false);

    useEffect(() => {
        const runTranslation = async () => {
            try {
                const result = await translate(detectedWord, { to: 'en' });
                setTranslatedWord(result.text);
            } catch (e) {
                console.error('Translation failed:', e);
                setTranslatedWord('');
            }
        };
        runTranslation();
    }, [detectedWord]);

    const speak = (word: string) => {
        setIsPlayingSound(true);
        Speech.speak(word, {
            language: 'ar',
        });
        setTimeout(() => {
            setIsPlayingSound(false);
        }, 500);
    };

    return (
        <BottomSheet ref={bottomSheetRef} index={0} snapPoints={['40%', '70%']}>
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
                                "{detectedWord}"
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
                                className="text-3xl font-bold"
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
                            disabled={isPlayingSound}
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
                            className="flex-row items-center gap-2 p-3 rounded-xl bg-Tertiary w-1/2"
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
