import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { translatedWords } from '../../../constants/translatedWords';
import { removeFromFavourites } from '../services/favourite-words.services';

interface Props {
    word: string;
    id: number;
}

export default function WordCard({ word, id }: Props) {
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [visible, setVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const dotsRef = useRef<typeof TouchableOpacity>(null);
    const openMenu = () => {
        dotsRef.current?.measure((_fx, _fy, w, h, px, py) => {
            const screenW = Dimensions.get('window').width;
            setPos({ top: py + h + 6, right: screenW - px - w });
            setVisible(true);
        });
    };
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    useEffect(() => {
        Speech.speak(' ', { language: 'ar', volume: 0 });
        Speech.stop();
    }, []);

    const speak = (word: string, lang: 'ar' | 'en' = 'ar') => {
        setIsPlayingSound(true);
        Speech.speak(word, {
            language: lang,
            onDone: () => setIsPlayingSound(false),
            onStopped: () => setIsPlayingSound(false),
            onError: () => setIsPlayingSound(false),
        });
    };

    const handleRemove = async (id: number) => {
        try {
            setDeleting(true);
            const respone = await removeFromFavourites(id);
            Toast.show({
                type: 'success',
                text1: t('favourite.deleted'),
            });
            await queryClient.invalidateQueries({
                queryKey: ['fav-words'],
            });
        } catch (err) {
            Toast.show({
                type: 'error',
                text1: t('favourite.error'),
            });
        } finally {
            setDeleting(false);
        }
    };

    const MENU_ITEMS = [
        { label: t('favourite.playEN'), onPress: () => speak(word, 'en') },
        {
            label: t('favourite.delete'),
            onPress: () => handleRemove(id),
            danger: true,
        },
    ];

    return (
        <View className="bg-white flex-row justify-between items-center p-4 rounded-xl">
            <View className="flex-row gap-4 items-center">
                <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isPlayingSound}
                    onPress={() => speak(word, 'ar')}
                    className="w-10 h-10 items-center justify-center rounded-xl bg-[#f2f0fc] disabled:opacity-60"
                >
                    <Ionicons
                        name={isPlayingSound ? 'volume-mute' : 'volume-high'}
                        size={24}
                        color="#5140E8"
                    />
                </TouchableOpacity>

                <View className="gap-2">
                    <Text className="font-bold text-lg text-[#111827]">
                        {word}
                    </Text>
                    <Text className="text-md text-gray-600">
                        {translatedWords[word]}
                    </Text>
                </View>
            </View>

            <View className="flex-row gap-5 items-center">
                <TouchableOpacity
                    activeOpacity={1}
                    disabled={deleting}
                    onPress={() => handleRemove(id)}
                    className="disabled:opacity-50"
                >
                    <Ionicons name="heart" size={24} color="#5140E8" />
                </TouchableOpacity>

                {/* ← ref + onPress added here */}
                <TouchableOpacity
                    ref={dotsRef}
                    activeOpacity={0.7}
                    onPress={openMenu}
                >
                    <Entypo
                        name="dots-three-vertical"
                        size={18}
                        color="black"
                    />
                </TouchableOpacity>
            </View>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                {/* Backdrop */}
                <Pressable
                    className="absolute inset-0"
                    onPress={() => setVisible(false)}
                />

                {/* Menu card — top/right are dynamic so they stay inline */}
                <View
                    className="absolute bg-white rounded-xl py-1 min-w-[160px]"
                    style={{
                        top: pos.top,
                        right: pos.right,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 12,
                    }}
                >
                    {MENU_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            className={`px-4 py-3 ${
                                i < MENU_ITEMS.length - 1
                                    ? 'border-b border-gray-200'
                                    : ''
                            }`}
                            onPress={() => {
                                setVisible(false);
                                item.onPress();
                            }}
                        >
                            <Text
                                className={`text-[15px] ${
                                    item.danger
                                        ? 'text-red-500'
                                        : 'text-[#111827]'
                                }`}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
        </View>
    );
}
