// components/ImagePickerSheet.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface ImagePickerSheetProps {
    visible: boolean;
    onClose: () => void;
    onCamera: () => void;
    onGallery: () => void;
}

export default function AvatarPicker({
    visible,
    onClose,
    onCamera,
    onGallery,
}: ImagePickerSheetProps) {
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <TouchableOpacity
                className="flex-1 bg-black/40"
                onPress={onClose}
            />
            <View className="bg-white rounded-t-3xl p-6 gap-4">
                <Text className="text-lg font-bold text-center">
                    {t('profile.changePhoto')}
                </Text>

                <View className="flex-row gap-4 items-center justify-between w-full">
                    <TouchableOpacity
                        className="rounded-2xl p-3 gap-2 items-center flex-1 border border-gray-100"
                        onPress={onCamera}
                        activeOpacity={0.6}
                        style={{}}
                    >
                        <View className="flex items-center justify-center w-14 h-14 rounded-full bg-[#f2f0fc]">
                            <Ionicons
                                name="camera-outline"
                                size={32}
                                color="#5140E8"
                            />
                        </View>
                        <Text className="text-gray-500 font-semibold">
                            {t('profile.takePhoto')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="rounded-2xl p-3 gap-2 items-center flex-1 border border-gray-100"
                        onPress={onGallery}
                        activeOpacity={0.6}
                    >
                        <View className="flex items-center justify-center w-14 h-14 rounded-full bg-[#f2f0fc]">
                            <Ionicons
                                name="image-outline"
                                size={32}
                                color="#5140E8"
                            />
                        </View>
                        <Text className="text-gray-500 font-semibold">
                            {t('profile.chooseFromGallery')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="p-4 items-center bg-[##f2f0fc] rounded-2xl w-full mx-auto active:opacity-80"
                    onPress={onClose}
                >
                    <Text className="text-primary font-semibold">
                        {t('profile.cancel')}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}
